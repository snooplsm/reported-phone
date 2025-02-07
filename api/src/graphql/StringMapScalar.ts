import { GraphQLScalarType, Kind } from "graphql";

export const StringMapScalar = new GraphQLScalarType({
  name: "StringMap",
  description: "A key-value object where both keys and values are strings",
  parseValue(value) {
    return typeof value === "object" ? value : null;
  },
  serialize(value) {
    return typeof value === "object" ? value : null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      const parsedObject = Object.create(null);
      ast.fields.forEach(field => {
        if (field.value.kind === Kind.STRING) {
          parsedObject[field.name.value] = field.value.value; // ✅ Fix: Extract only values
        }
      });
      return parsedObject;
    }
    return null;
  },
});