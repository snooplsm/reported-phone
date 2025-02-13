import { GraphQLScalarType, Kind, ValueNode } from "graphql";
import { DateTimeScalar } from "graphql-date-scalars";

export const StringMapScalar = new GraphQLScalarType({
  name: "StringMap",
  description: "Custom scalar type for key-value objects",

  parseValue(value: unknown): Record<string, string> {
    if (typeof value === "object" && value !== null) {
      return value as Record<string, string>;
    }
    throw new Error("Invalid StringMap value");
  },

  serialize(value: unknown): Record<string, string> {
    if (typeof value === "object" && value !== null) {
      return value as Record<string, string>;
    }
    throw new Error("Invalid StringMap serialization");
  },

  parseLiteral(ast: ValueNode): Record<string, string> {
    if (ast.kind === Kind.OBJECT) {
      const obj: Record<string, string> = {};
      (ast.fields as any[]).forEach((field) => {
        obj[field.name.value] = (field.value as any).value;
      });
      return obj;
    }
    throw new Error("Invalid StringMap literal");
  }
});

// ✅ Export scalars separately
export const scalarResolvers = {
  StringMap: StringMapScalar,
  DateTime: DateTimeScalar,
};