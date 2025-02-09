import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// ✅ Define HTTP & WebSocket URLs
const HTTP_URI = import.meta.env.VITE_GRAPHQL; // Your existing GraphQL API
const WS_URI = import.meta.env.VITE_WS_GRAPHQL; // Convert HTTP URL to WebSocket URL

// ✅ Create WebSocket Link
const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URI,
  })
);

// ✅ Create HTTP Link
const httpLink = new HttpLink({ uri: HTTP_URI });

// ✅ Split Queries, Mutations (HTTP) & Subscriptions (WebSockets)
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

// ✅ Create Apollo Client
export const client = new ApolloClient({
  link: splitLink, // Uses WebSocket for subscriptions, HTTP for others
  cache: new InMemoryCache(),
});