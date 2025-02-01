export const typeDefs = `#graphql

  type Coordinates {
    lat: Float!
    lng: Float!
  }

  scalar BigInt

  scalar StringMap

  type Location {
    id: ID!
    coordinates: Coordinates!
    street: String
    building_number: String
    city: String!
    state: String!
    zip: String!
    created: String!
  }

  type Report {
    id: ID!
    complaint: String!
    time: String!
    created: String!
    location: Location!
    files: [S3File]
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
    created: String!
  }

  type PresignedUrl {
    url: String!
    method: String!
    contentType: String!
  }

  type Query {
    reports: [Report]
    report(id: ID!): Report
  }

  type Mutation {
    createReport(
      complaint: String!
      time: String!
      location: LocationInput!
      files: [FileInput!]!
    ): Report
    presignedUrls(
      keys: [PresignedUrlInput!]!
): [PresignedUrl]
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