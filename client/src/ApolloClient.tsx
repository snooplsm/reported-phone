import { ApolloClient, InMemoryCache, ApolloProvider, gql, } from '@apollo/client';

export const client = new ApolloClient({
   uri: import.meta.env.VITE_GRAPHQL,
  cache: new InMemoryCache(),
});