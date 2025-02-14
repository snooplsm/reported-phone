import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
  StringMap: { input: any; output: any; }
};

export type Complaint = {
  __typename?: 'Complaint';
  name: Scalars['String']['output'];
};

export type Coordinates = {
  __typename?: 'Coordinates';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type CoordinatesInput = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type FileInput = {
  bucket_name: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  file_name: Scalars['String']['input'];
  file_size: Scalars['BigInt']['input'];
  height?: InputMaybe<Scalars['Int']['input']>;
  key: Scalars['String']['input'];
  mime_type: Scalars['String']['input'];
  parent?: InputMaybe<Scalars['ID']['input']>;
  url: Scalars['String']['input'];
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type Location = {
  __typename?: 'Location';
  building_number?: Maybe<Scalars['String']['output']>;
  city: Scalars['String']['output'];
  coordinates: Coordinates;
  created: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  neighborhoods?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  state: Scalars['String']['output'];
  street?: Maybe<Scalars['String']['output']>;
  zip: Scalars['String']['output'];
};

export type LocationInput = {
  building_number?: InputMaybe<Scalars['String']['input']>;
  city: Scalars['String']['input'];
  coordinates: CoordinatesInput;
  state: Scalars['String']['input'];
  street?: InputMaybe<Scalars['String']['input']>;
  zip: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createReport: Array<Report>;
  deleteReport: Scalars['Boolean']['output'];
  presignedUrls: Array<PresignedUrl>;
};


export type MutationCreateReportArgs = {
  reports: Array<ReportInput>;
};


export type MutationDeleteReportArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPresignedUrlsArgs = {
  keys: Array<PresignedUrlInput>;
};

export type Neighborhood = {
  __typename?: 'Neighborhood';
  geojson: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type PresignedUrl = {
  __typename?: 'PresignedUrl';
  bucketName: Scalars['String']['output'];
  contentType: Scalars['String']['output'];
  key: Scalars['String']['output'];
  method: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type PresignedUrlInput = {
  contentType?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  complaints: Array<Complaint>;
  neighborhood: Array<Neighborhood>;
  neighborhoods: Array<Neighborhood>;
  report?: Maybe<Report>;
  reports?: Maybe<Array<Maybe<Report>>>;
  reportsForNeighborhood: Array<Report>;
  reportsForNeighborhoodCount: Scalars['BigInt']['output'];
};


export type QueryNeighborhoodArgs = {
  names: Array<Scalars['String']['input']>;
};


export type QueryReportArgs = {
  id: Scalars['ID']['input'];
};


export type QueryReportsForNeighborhoodArgs = {
  filters: ReportFilterInput;
};


export type QueryReportsForNeighborhoodCountArgs = {
  filters: ReportFilterInput;
};

export type Report = {
  __typename?: 'Report';
  complaint: Scalars['String']['output'];
  created: Scalars['DateTime']['output'];
  files: Array<S3File>;
  id: Scalars['ID']['output'];
  location: Location;
  time: Scalars['DateTime']['output'];
};

export type ReportFilterInput = {
  complaints?: InputMaybe<Array<Scalars['String']['input']>>;
  createdAfter?: InputMaybe<Scalars['DateTime']['input']>;
  createdBefore?: InputMaybe<Scalars['DateTime']['input']>;
  neighborhoods?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ReportInput = {
  complaint: Scalars['String']['input'];
  files: Array<FileInput>;
  location: LocationInput;
  time: Scalars['DateTime']['input'];
};

export type S3File = {
  __typename?: 'S3File';
  bucket_name: Scalars['String']['output'];
  created: Scalars['DateTime']['output'];
  duration?: Maybe<Scalars['Int']['output']>;
  file_name: Scalars['String']['output'];
  file_size: Scalars['BigInt']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  mime_type: Scalars['String']['output'];
  parent?: Maybe<Scalars['ID']['output']>;
  url: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  reportCreated: Array<Report>;
  reportCreatedForNeighborhoods: Array<Report>;
};


export type SubscriptionReportCreatedForNeighborhoodsArgs = {
  neighborhoods: Array<Scalars['String']['input']>;
};

export type ComplaintFieldsFragment = { __typename?: 'Complaint', name: string };

export type NeighborhoodFieldsFragment = { __typename?: 'Neighborhood', id: string, name: string, geojson: any };

export type ReportFieldsFragment = { __typename?: 'Report', id: string, complaint: string, time: any, created: any, location: { __typename?: 'Location', street?: string | null, building_number?: string | null, city: string, state: string, zip: string, neighborhoods?: Array<string | null> | null, coordinates: { __typename?: 'Coordinates', lat: number, lng: number } }, files: Array<{ __typename?: 'S3File', url: string, width?: number | null, height?: number | null, duration?: number | null }> };

export type CreateReportsMutationVariables = Exact<{
  reports: Array<ReportInput> | ReportInput;
}>;


export type CreateReportsMutation = { __typename?: 'Mutation', createReport: Array<{ __typename?: 'Report', id: string, complaint: string, time: any, created: any, location: { __typename?: 'Location', street?: string | null, building_number?: string | null, city: string, state: string, zip: string, neighborhoods?: Array<string | null> | null, coordinates: { __typename?: 'Coordinates', lat: number, lng: number } }, files: Array<{ __typename?: 'S3File', url: string, width?: number | null, height?: number | null, duration?: number | null }> }> };

export type PresignedUrlsMutationVariables = Exact<{
  keys: Array<PresignedUrlInput> | PresignedUrlInput;
}>;


export type PresignedUrlsMutation = { __typename?: 'Mutation', presignedUrls: Array<{ __typename?: 'PresignedUrl', url: string, method: string, contentType: string, bucketName: string, key: string }> };

export type GetAllComplaintsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllComplaintsQuery = { __typename?: 'Query', complaints: Array<{ __typename?: 'Complaint', name: string }> };

export type GetAllNeighborhoodsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllNeighborhoodsQuery = { __typename?: 'Query', neighborhoods: Array<{ __typename?: 'Neighborhood', id: string, name: string }> };

export type GetNeighborhoodQueryVariables = Exact<{
  names: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetNeighborhoodQuery = { __typename?: 'Query', neighborhood: Array<{ __typename?: 'Neighborhood', id: string, name: string, geojson: any }> };

export type GetReportsForNeighborhoodQueryVariables = Exact<{
  filters: ReportFilterInput;
}>;


export type GetReportsForNeighborhoodQuery = { __typename?: 'Query', reportsForNeighborhood: Array<{ __typename?: 'Report', id: string, complaint: string, time: any, created: any, location: { __typename?: 'Location', street?: string | null, building_number?: string | null, city: string, state: string, zip: string, neighborhoods?: Array<string | null> | null, coordinates: { __typename?: 'Coordinates', lat: number, lng: number } }, files: Array<{ __typename?: 'S3File', url: string, width?: number | null, height?: number | null, duration?: number | null }> }> };

export type ReportCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ReportCreatedSubscription = { __typename?: 'Subscription', reportCreated: Array<{ __typename?: 'Report', id: string, complaint: string, time: any, created: any, location: { __typename?: 'Location', street?: string | null, building_number?: string | null, city: string, state: string, zip: string, neighborhoods?: Array<string | null> | null, coordinates: { __typename?: 'Coordinates', lat: number, lng: number } }, files: Array<{ __typename?: 'S3File', url: string, width?: number | null, height?: number | null, duration?: number | null }> }> };

export type ReportCreatedForNeighborhoodsSubscriptionVariables = Exact<{
  neighborhoods: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type ReportCreatedForNeighborhoodsSubscription = { __typename?: 'Subscription', reportCreatedForNeighborhoods: Array<{ __typename?: 'Report', id: string, complaint: string, time: any, created: any, location: { __typename?: 'Location', street?: string | null, building_number?: string | null, city: string, state: string, zip: string, neighborhoods?: Array<string | null> | null, coordinates: { __typename?: 'Coordinates', lat: number, lng: number } }, files: Array<{ __typename?: 'S3File', url: string, width?: number | null, height?: number | null, duration?: number | null }> }> };

export const ComplaintFieldsFragmentDoc = gql`
    fragment ComplaintFields on Complaint {
  name
}
    `;
export const NeighborhoodFieldsFragmentDoc = gql`
    fragment NeighborhoodFields on Neighborhood {
  id
  name
  geojson
}
    `;
export const ReportFieldsFragmentDoc = gql`
    fragment ReportFields on Report {
  id
  complaint
  time
  created
  location {
    street
    building_number
    city
    state
    zip
    coordinates {
      lat
      lng
    }
    neighborhoods
  }
  files {
    url
    width
    height
    duration
  }
}
    `;
export const CreateReportsDocument = gql`
    mutation CreateReports($reports: [ReportInput!]!) {
  createReport(reports: $reports) {
    ...ReportFields
  }
}
    ${ReportFieldsFragmentDoc}`;
export type CreateReportsMutationFn = Apollo.MutationFunction<CreateReportsMutation, CreateReportsMutationVariables>;

/**
 * __useCreateReportsMutation__
 *
 * To run a mutation, you first call `useCreateReportsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReportsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReportsMutation, { data, loading, error }] = useCreateReportsMutation({
 *   variables: {
 *      reports: // value for 'reports'
 *   },
 * });
 */
export function useCreateReportsMutation(baseOptions?: Apollo.MutationHookOptions<CreateReportsMutation, CreateReportsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateReportsMutation, CreateReportsMutationVariables>(CreateReportsDocument, options);
      }
export type CreateReportsMutationHookResult = ReturnType<typeof useCreateReportsMutation>;
export type CreateReportsMutationResult = Apollo.MutationResult<CreateReportsMutation>;
export type CreateReportsMutationOptions = Apollo.BaseMutationOptions<CreateReportsMutation, CreateReportsMutationVariables>;
export const PresignedUrlsDocument = gql`
    mutation PresignedUrls($keys: [PresignedUrlInput!]!) {
  presignedUrls(keys: $keys) {
    url
    method
    contentType
    bucketName
    key
  }
}
    `;
export type PresignedUrlsMutationFn = Apollo.MutationFunction<PresignedUrlsMutation, PresignedUrlsMutationVariables>;

/**
 * __usePresignedUrlsMutation__
 *
 * To run a mutation, you first call `usePresignedUrlsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePresignedUrlsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [presignedUrlsMutation, { data, loading, error }] = usePresignedUrlsMutation({
 *   variables: {
 *      keys: // value for 'keys'
 *   },
 * });
 */
export function usePresignedUrlsMutation(baseOptions?: Apollo.MutationHookOptions<PresignedUrlsMutation, PresignedUrlsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PresignedUrlsMutation, PresignedUrlsMutationVariables>(PresignedUrlsDocument, options);
      }
export type PresignedUrlsMutationHookResult = ReturnType<typeof usePresignedUrlsMutation>;
export type PresignedUrlsMutationResult = Apollo.MutationResult<PresignedUrlsMutation>;
export type PresignedUrlsMutationOptions = Apollo.BaseMutationOptions<PresignedUrlsMutation, PresignedUrlsMutationVariables>;
export const GetAllComplaintsDocument = gql`
    query GetAllComplaints {
  complaints {
    name
  }
}
    `;

/**
 * __useGetAllComplaintsQuery__
 *
 * To run a query within a React component, call `useGetAllComplaintsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllComplaintsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllComplaintsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllComplaintsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllComplaintsQuery, GetAllComplaintsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllComplaintsQuery, GetAllComplaintsQueryVariables>(GetAllComplaintsDocument, options);
      }
export function useGetAllComplaintsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllComplaintsQuery, GetAllComplaintsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllComplaintsQuery, GetAllComplaintsQueryVariables>(GetAllComplaintsDocument, options);
        }
export function useGetAllComplaintsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllComplaintsQuery, GetAllComplaintsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllComplaintsQuery, GetAllComplaintsQueryVariables>(GetAllComplaintsDocument, options);
        }
export type GetAllComplaintsQueryHookResult = ReturnType<typeof useGetAllComplaintsQuery>;
export type GetAllComplaintsLazyQueryHookResult = ReturnType<typeof useGetAllComplaintsLazyQuery>;
export type GetAllComplaintsSuspenseQueryHookResult = ReturnType<typeof useGetAllComplaintsSuspenseQuery>;
export type GetAllComplaintsQueryResult = Apollo.QueryResult<GetAllComplaintsQuery, GetAllComplaintsQueryVariables>;
export const GetAllNeighborhoodsDocument = gql`
    query GetAllNeighborhoods {
  neighborhoods {
    id
    name
  }
}
    `;

/**
 * __useGetAllNeighborhoodsQuery__
 *
 * To run a query within a React component, call `useGetAllNeighborhoodsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllNeighborhoodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllNeighborhoodsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllNeighborhoodsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllNeighborhoodsQuery, GetAllNeighborhoodsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllNeighborhoodsQuery, GetAllNeighborhoodsQueryVariables>(GetAllNeighborhoodsDocument, options);
      }
export function useGetAllNeighborhoodsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllNeighborhoodsQuery, GetAllNeighborhoodsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllNeighborhoodsQuery, GetAllNeighborhoodsQueryVariables>(GetAllNeighborhoodsDocument, options);
        }
export function useGetAllNeighborhoodsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllNeighborhoodsQuery, GetAllNeighborhoodsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllNeighborhoodsQuery, GetAllNeighborhoodsQueryVariables>(GetAllNeighborhoodsDocument, options);
        }
export type GetAllNeighborhoodsQueryHookResult = ReturnType<typeof useGetAllNeighborhoodsQuery>;
export type GetAllNeighborhoodsLazyQueryHookResult = ReturnType<typeof useGetAllNeighborhoodsLazyQuery>;
export type GetAllNeighborhoodsSuspenseQueryHookResult = ReturnType<typeof useGetAllNeighborhoodsSuspenseQuery>;
export type GetAllNeighborhoodsQueryResult = Apollo.QueryResult<GetAllNeighborhoodsQuery, GetAllNeighborhoodsQueryVariables>;
export const GetNeighborhoodDocument = gql`
    query GetNeighborhood($names: [String!]!) {
  neighborhood(names: $names) {
    ...NeighborhoodFields
  }
}
    ${NeighborhoodFieldsFragmentDoc}`;

/**
 * __useGetNeighborhoodQuery__
 *
 * To run a query within a React component, call `useGetNeighborhoodQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNeighborhoodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNeighborhoodQuery({
 *   variables: {
 *      names: // value for 'names'
 *   },
 * });
 */
export function useGetNeighborhoodQuery(baseOptions: Apollo.QueryHookOptions<GetNeighborhoodQuery, GetNeighborhoodQueryVariables> & ({ variables: GetNeighborhoodQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>(GetNeighborhoodDocument, options);
      }
export function useGetNeighborhoodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>(GetNeighborhoodDocument, options);
        }
export function useGetNeighborhoodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>(GetNeighborhoodDocument, options);
        }
export type GetNeighborhoodQueryHookResult = ReturnType<typeof useGetNeighborhoodQuery>;
export type GetNeighborhoodLazyQueryHookResult = ReturnType<typeof useGetNeighborhoodLazyQuery>;
export type GetNeighborhoodSuspenseQueryHookResult = ReturnType<typeof useGetNeighborhoodSuspenseQuery>;
export type GetNeighborhoodQueryResult = Apollo.QueryResult<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>;
export const GetReportsForNeighborhoodDocument = gql`
    query GetReportsForNeighborhood($filters: ReportFilterInput!) {
  reportsForNeighborhood(filters: $filters) {
    ...ReportFields
  }
}
    ${ReportFieldsFragmentDoc}`;

/**
 * __useGetReportsForNeighborhoodQuery__
 *
 * To run a query within a React component, call `useGetReportsForNeighborhoodQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReportsForNeighborhoodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReportsForNeighborhoodQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetReportsForNeighborhoodQuery(baseOptions: Apollo.QueryHookOptions<GetReportsForNeighborhoodQuery, GetReportsForNeighborhoodQueryVariables> & ({ variables: GetReportsForNeighborhoodQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReportsForNeighborhoodQuery, GetReportsForNeighborhoodQueryVariables>(GetReportsForNeighborhoodDocument, options);
      }
export function useGetReportsForNeighborhoodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReportsForNeighborhoodQuery, GetReportsForNeighborhoodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReportsForNeighborhoodQuery, GetReportsForNeighborhoodQueryVariables>(GetReportsForNeighborhoodDocument, options);
        }
export function useGetReportsForNeighborhoodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReportsForNeighborhoodQuery, GetReportsForNeighborhoodQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetReportsForNeighborhoodQuery, GetReportsForNeighborhoodQueryVariables>(GetReportsForNeighborhoodDocument, options);
        }
export type GetReportsForNeighborhoodQueryHookResult = ReturnType<typeof useGetReportsForNeighborhoodQuery>;
export type GetReportsForNeighborhoodLazyQueryHookResult = ReturnType<typeof useGetReportsForNeighborhoodLazyQuery>;
export type GetReportsForNeighborhoodSuspenseQueryHookResult = ReturnType<typeof useGetReportsForNeighborhoodSuspenseQuery>;
export type GetReportsForNeighborhoodQueryResult = Apollo.QueryResult<GetReportsForNeighborhoodQuery, GetReportsForNeighborhoodQueryVariables>;
export const ReportCreatedDocument = gql`
    subscription ReportCreated {
  reportCreated {
    ...ReportFields
  }
}
    ${ReportFieldsFragmentDoc}`;

/**
 * __useReportCreatedSubscription__
 *
 * To run a query within a React component, call `useReportCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useReportCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReportCreatedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useReportCreatedSubscription(baseOptions?: Apollo.SubscriptionHookOptions<ReportCreatedSubscription, ReportCreatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ReportCreatedSubscription, ReportCreatedSubscriptionVariables>(ReportCreatedDocument, options);
      }
export type ReportCreatedSubscriptionHookResult = ReturnType<typeof useReportCreatedSubscription>;
export type ReportCreatedSubscriptionResult = Apollo.SubscriptionResult<ReportCreatedSubscription>;
export const ReportCreatedForNeighborhoodsDocument = gql`
    subscription ReportCreatedForNeighborhoods($neighborhoods: [String!]!) {
  reportCreatedForNeighborhoods(neighborhoods: $neighborhoods) {
    ...ReportFields
  }
}
    ${ReportFieldsFragmentDoc}`;

/**
 * __useReportCreatedForNeighborhoodsSubscription__
 *
 * To run a query within a React component, call `useReportCreatedForNeighborhoodsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useReportCreatedForNeighborhoodsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReportCreatedForNeighborhoodsSubscription({
 *   variables: {
 *      neighborhoods: // value for 'neighborhoods'
 *   },
 * });
 */
export function useReportCreatedForNeighborhoodsSubscription(baseOptions: Apollo.SubscriptionHookOptions<ReportCreatedForNeighborhoodsSubscription, ReportCreatedForNeighborhoodsSubscriptionVariables> & ({ variables: ReportCreatedForNeighborhoodsSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ReportCreatedForNeighborhoodsSubscription, ReportCreatedForNeighborhoodsSubscriptionVariables>(ReportCreatedForNeighborhoodsDocument, options);
      }
export type ReportCreatedForNeighborhoodsSubscriptionHookResult = ReturnType<typeof useReportCreatedForNeighborhoodsSubscription>;
export type ReportCreatedForNeighborhoodsSubscriptionResult = Apollo.SubscriptionResult<ReportCreatedForNeighborhoodsSubscription>;