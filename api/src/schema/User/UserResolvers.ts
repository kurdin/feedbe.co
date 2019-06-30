import { AuthenticationError } from 'apollo-server-express';
import User from '../../models/User';
import * as error from '../../error-messages';

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      return await User.query().findById(user.id);
    },
    getUsers: async () => {
      return await User.query();
    },
    getUser: async (_, args) => {
      return await User.query().findById(args.id);
    },
    findUserByEmail: async (_, args, { isAdmin }) => {
      if (!isAdmin) {
        throw new AuthenticationError(error.auth.adminOnly);
      }
      return await User.query().findOne({ email: args.email });
    }
  },
  Mutation: {
    signup: async (_, args) => {
      try {
        if (!args.email || !args.password) {
          throw new Error(error.signup.invalidEmailOrPassword);
        }

        const isUniqueUser = await User.query().findOne({ email: args.email });

        if (isUniqueUser) {
          throw new AuthenticationError(error.signup.invalidEmailAlreadyExist);
        }

        const newUser = await User.query()
          .insert(args)
          .returning('*');

        return {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          token: newUser.token
        };
      } catch (error) {
        throw new Error(error);
      }
    },
    login: async (_, args) => {
      try {
        const user = await User.query().findOne({ email: args.email });

        if (!user) {
          throw new AuthenticationError(error.login.noUserFound);
        }

        const isPasswordCorrect = await user.verifyPassword(args.password);

        if (!isPasswordCorrect) {
          throw new AuthenticationError(error.login.noPasswordMatched);
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          token: user.token
        };
      } catch (error) {
        throw new Error(error);
      }
    }
    // ,
    // createArticle: (parent, args, context) => {
    //   if (!context.loggedInUser) throw new ForbiddenError(error.auth.failed);
    //   return Article.create(args);
    // }
  }
};

export default resolvers;
