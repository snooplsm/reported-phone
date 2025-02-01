import express, { Application, json } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { sequelize } from "./database";
import { typeDefs } from "@reported/shared/src/graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { ApolloServerErrorCode } from '@apollo/server/errors';

import "./models";
import { GraphQLFormattedError } from "graphql";

sequelize.sync().then(() => {
  console.log("Database synced");
});


async function startServer() {
  const app: Application = express();

  app.use(cors());
  app.use(json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError:GraphQLFormattedError, error) => {
      // Return a different error message
      if (
        formattedError.extensions?.code ===
        ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED
      ) {
        return {
          ...formattedError,
          message: "Your query doesn't match the schema. Try double-checking it!",
        };
      }
      if(
        formattedError.extensions?.code==='CONFLICT'
      ) {
        return {
          message: 'Data already exists',
          code: 'CONFLICT'
        }
      }
  
      // Otherwise return the formatted error. This error can also
      // be manipulated in other ways, as long as it's returned.
      return formattedError;
    },
  });

  // Start Apollo Server
  await server.start();

  // Apply Apollo GraphQL middleware to Express

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server),
  );

  // Sync database
  await sequelize.sync();

  // Start Express server
  app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000/graphql"));
}

startServer();