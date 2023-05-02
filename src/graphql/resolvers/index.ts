const rootResolver = {
  Query: {
    hellWorld: () => {
      return "Hello World";
    },
  },
  Mutation: {
    testingMuation: () => {
      return true;
    },
  },
};

export const resolvers = [rootResolver];
