import { userResolver } from './user/resolver';

type TestInput = {
  id: number;
  name: string;
};

const rootResolver = {
  Query: {
    hellWorld: () => {
      return 'Hello World';
    },
    getTest: (_: unknown, args: { input: TestInput }): string => {
      const { input } = args;
      return `This id: ${input.id} and name: ${input.name}`;
    },
  },
  Mutation: {
    testMuation: () => {
      return true;
    },
  },
};

export const resolvers = [rootResolver, userResolver];
