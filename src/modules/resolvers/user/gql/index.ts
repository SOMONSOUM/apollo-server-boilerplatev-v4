import gql from 'graphql-tag';

export const userTypeDefs = gql`
  type Query {
    getUsers: [User]
    me: Me
  }

  type Mutation {
    createUser(input: CreateUserInput!): User
    login(input: LoginInput!): LoginResponse
    refreshToken(input: RefreshTokenInput!): LoginResponse
  }

  input RefreshTokenInput {
    refreshToken: String
  }

  type LoginResponse {
    accessToken: String
    refreshToken: String
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
  }
`;
