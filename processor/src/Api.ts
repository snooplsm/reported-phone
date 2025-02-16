import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import WebSocket from "ws";

import { ReportFieldsFragment,SubscriptionReportCreatedForNeighborhoodsArgs, ReportCreatedForNeighborhoodsDocument, ReportCreatedForNeighborhoodsSubscription, ReportCreatedDocument, ReportCreatedSubscription } from "@reported/shared/client";

// ✅ Define HTTP & WebSocket URLs
const HTTP_URI = process.env.VITE_GRAPHQL!; // Your existing GraphQL API
const WS_URI = process.env.VITE_WS_GRAPHQL!; // Convert HTTP URL to WebSocket URL
console.log(HTTP_URI,WS_URI)
// ✅ Create WebSocket Link
global.WebSocket = WebSocket
const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URI,
    webSocketImpl: WebSocket
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

export function subscribeToReports(
    callback: (data: ReportFieldsFragment[]) => void,
    onError?: (error: any) => void
  ) {
    console.log("subscribing")
    const observable = client.subscribe<ReportCreatedSubscription>({
      query: ReportCreatedDocument
    });
    console.log("subscribed")
  
    // ✅ Start the Subscription
    const subscription = observable.subscribe({
      next: ({ data }) => {
        console.log("data", data)
        if (data?.reportCreated) {
          callback(data.reportCreated);
        }
      },
      error: (err) => {
        if (onError) onError(err);
      },
    });
  
    // ✅ Return Unsubscribe Function
    return {
      unsubscribe: () => {
        console.log("🔄 Unsubscribing from report updates...");
        subscription.unsubscribe();
      },
    };
  }