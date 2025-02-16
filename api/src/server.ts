import express, { Application, json } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { sequelize } from "./database.js";
import { typeDefs } from "@reported/shared/graphql/schema";
import { resolversWithScalars } from "./graphql/resolversWithScalars.js";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { createServer } from "http";
import { useServer } from 'graphql-ws/use/ws';
import { WebSocketServer } from "ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLSchema } from "graphql";
import { UserInterface } from "./UserInterface.js";
import "./models/index.js";

const PORT = (process.env.PORT && parseInt(process.env.PORT)) || 3000;

async function startServer() {
  const app: Application = express();

  app.use(cors());
  app.use(json());

  interface AppContext {
    user: UserInterface | null;
  }

  const context = async ({ req }: { req: Express.Request }): Promise<AppContext> => {
    console.log("context");
    
    const user = null
    return { user };
  };

  // ✅ Create Apollo Schema (Required for WebSocket support)
  const schema: GraphQLSchema = makeExecutableSchema({ typeDefs, resolvers:resolversWithScalars(true) });

  // ✅ Create WebSocket Server
  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

  useServer({ schema, context: async () => ({ user: null }) }, wsServer);
  const isProduction = process.env.NODE_ENV === "production";

  // ✅ Create Apollo Server
  const server = new ApolloServer<AppContext>({
    schema, // Use schema instead of typeDefs & resolvers separately
    formatError: (formattedError) => {
      if (formattedError.extensions?.code === ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED) {
        return {
          ...formattedError,
          message: "Your query doesn't match the schema. Try double-checking it!",
        };
      }
      if (formattedError.extensions?.code === "CONFLICT") {
        return {
          message: "Data already exists",
          code: "CONFLICT",
        };
      }
      return formattedError;
    },
    introspection: !isProduction,
    plugins: isProduction ? [ApolloServerPluginLandingPageDisabled()] : []
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server, { context }));

  // ✅ Start HTTP + WebSocket Server

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📡 WebSocket ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer();
