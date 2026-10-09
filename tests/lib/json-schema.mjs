// Minimal JSON Schema (2020-12 subset) validator, enough for the vendored Agent
// Plugins schemas: type, const, enum, required, properties, additionalProperties,
// oneOf, $ref (local), pattern, minLength, maxLength, items, not, propertyNames.
// Returns a list of error strings; an empty list means valid.
export function validate(schema, value, root = schema, at = "$") {
  const errors = [];
  if (schema.$ref) {
    const target = schema.$ref.replace(/^#\//, "").split("/").reduce((node, key) => node?.[key], root);
    if (!target) return [`${at}: unresolved ${schema.$ref}`];
    return validate(target, value, root, at);
  }
  if (schema.oneOf) {
    const matches = schema.oneOf.filter((option) => validate(option, value, root, at).length === 0);
    if (matches.length !== 1) errors.push(`${at}: matches ${matches.length} of ${schema.oneOf.length} oneOf options`);
    return errors;
  }
  if (schema.not && validate(schema.not, value, root, at).length === 0) errors.push(`${at}: matches a forbidden schema`);
  if ("const" in schema && value !== schema.const) errors.push(`${at}: must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${at}: must be one of ${JSON.stringify(schema.enum)}`);
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
    if (!types.includes(actual)) return [...errors, `${at}: expected ${types.join("|")}, got ${actual}`];
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${at}: shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${at}: longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${at}: does not match ${schema.pattern}`);
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) => errors.push(...validate(schema.items, item, root, `${at}[${index}]`)));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${at}: missing required "${key}"`);
    for (const [key, child] of Object.entries(value)) {
      if (schema.propertyNames && validate(schema.propertyNames, key, root, `${at}.<name>`).length) {
        errors.push(`${at}: property name "${key}" not allowed`);
      }
      if (schema.properties && key in schema.properties) {
        errors.push(...validate(schema.properties[key], child, root, `${at}.${key}`));
      } else if (schema.additionalProperties === false) {
        errors.push(`${at}: unexpected property "${key}"`);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        errors.push(...validate(schema.additionalProperties, child, root, `${at}.${key}`));
      }
    }
  }
  return errors;
}
