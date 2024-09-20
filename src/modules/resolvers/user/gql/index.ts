import gql from 'graphql-tag';

export const userTypeDefs = gql`
  type Query {
    getUsers: [User]
    me: Me
  }

  type Mutation {
    createUser(input: CreateUserInput!): User
    login(input: LoginInput!): LoginResponse
  }

  type LoginResponse {
    accessToken: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateUserInput {
    email: String!
    password: String!
    name: String
  }

  type Me {
    id: Int
    email: String
    name: String
  }

  type User {
    id: Int
    email: String
    name: String
    password: String
  }
`;
