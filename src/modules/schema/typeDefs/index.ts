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
  }

  type Mutation {
    testingMuation: Boolean
  }
`;

export const typeDefs = [rootTypeDefs, userTypeDefs];
