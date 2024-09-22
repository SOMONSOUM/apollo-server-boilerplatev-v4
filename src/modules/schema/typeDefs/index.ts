import gql from 'graphql-tag';
import { userTypeDefs } from './../../resolvers/user/gql';

const rootTypeDefs = gql`
  scalar Upload
  scalar JSON

  type Ok {
    ok: Boolean
  }

  type Query {
    hellWorld: String
    getTest(input: TestInput): String
  }

  input TestInput {
    id: Int
    name: String
  }

  type Mutation {
    testMuation: Boolean
  }
`;

export const typeDefs = [rootTypeDefs, userTypeDefs];
