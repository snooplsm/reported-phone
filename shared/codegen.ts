
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/graphql/schema.ts",
  documents: 'src/**/*.graphql',
  generates: {    
    "src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ]
    },
    "./graphql.schema.json": {
      plugins: ["introspection"]
    },
  },
  require: ["ts-node/register"]
};

export default config;
