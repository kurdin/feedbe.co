const resolvers = {
  Query: {
    ping: () => ({
      response: 'pong',
      date: new Date().toISOString()
    })
  }
};

export default resolvers;
