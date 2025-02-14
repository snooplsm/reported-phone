export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
