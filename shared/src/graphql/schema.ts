import { gql } from "graphql-tag";
export const typeDefs = gql`

  type Coordinates {
    lat: Float!
    lng: Float!
  }

  scalar BigInt

  scalar DateTime

  scalar StringMap

  scalar JSON

  type Location {
    id: ID!
    coordinates: Coordinates!
    street: String
    building_number: String
    neighborhoods: [String]
    city: String!
    state: String!
    zip: String!
    created: DateTime!
  }

  type Complaint {
    name: String!
  }

  type Neighborhood {
    id: ID!
    name: String!
    geojson: JSON!  
  }

  type Report {
    id: ID!
    complaint: String!
    time: DateTime!
    created: DateTime!
    location: Location!
    files: [S3File!]!
  }

  type S3File {
    id: ID!
    file_name: String!
    file_size: BigInt!
    url: String!
    bucket_name: String!
    key: String!
    mime_type: String!
    width: Int
    height: Int
    duration: Int
    parent: ID
    created: DateTime!
  }

  type PresignedUrl {
    url: String!
    method: String!
    contentType: String!
    bucketName: String!
    key: String!
  }

  input ReportFilterInput {
  neighborhoods: [String!]!
  createdAfter: DateTime
  createdBefore: DateTime
  complaints: [String!]!
}

  type Query {
    reports: [Report]
    report(id: ID!): Report
    reportsForNeighborhood(filters: ReportFilterInput!): [Report!]!
    reportsForNeighborhoodCount(filters: ReportFilterInput!): BigInt!
    neighborhoods: [Neighborhood!]!
    neighborhood(names: [String!]!): [Neighborhood!]!
    complaints: [Complaint!]!
  }

  type Mutation {
    createReport(
      reports: [ReportInput!]!
    ): [Report!]!
    deleteReport(
      id: ID!
    ): Boolean!
    presignedUrls(
      keys: [PresignedUrlInput!]!
): [PresignedUrl!]!
  }

  type Subscription {
    reportCreated: [Report!]!
    reportCreatedForNeighborhoods(neighborhoods: [String!]!): [Report!]!
  }

  input ReportInput {
    complaint: String!        
    time: DateTime!             
    location: LocationInput!  
    files: [FileInput!]!
}

  input PresignedUrlInput {
    key: String!
    contentType: String
  }

  input CoordinatesInput { # ✅ Changed input to use coordinates
    lat: Float!
    lng: Float!
  }

  input LocationInput {
    coordinates: CoordinatesInput! # ✅ Nesting coordinates inside input
    city: String!
    state: String!
    zip: String!
    street: String
    building_number: String
  }

  input FileInput {
    file_name: String!
    url: String!
    key: String!
    bucket_name: String!
    mime_type: String!
    file_size: BigInt!
    width: Int
    height: Int
    duration: Int
    parent: ID
  }
`;

export default typeDefs