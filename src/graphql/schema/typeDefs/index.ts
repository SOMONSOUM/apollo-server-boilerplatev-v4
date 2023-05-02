import gql from "graphql-tag";

const rootTypeDefs = gql`
  scalar Upload
  scalar JSON
  type Ok {
    ok: Boolean
  }
  type Query {
    hellWorld: String
  }
  type Mutation {
    testingMuation: Boolean
  }
`;

export const typeDefs = [rootTypeDefs];
