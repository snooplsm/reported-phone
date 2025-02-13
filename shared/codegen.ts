
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/graphql/schema.ts",
  documents: 'src/**/*.graphql',
  generates: {    
    "src/generated/client/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ]
    },
    "src/generated/server/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
      ]
    },
    "./graphql.schema.json": {
      plugins: ["introspection"]
    },
  },
  require: ["ts-node/register"]
};

export default config;
