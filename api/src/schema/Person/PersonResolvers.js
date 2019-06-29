import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { transaction } from 'objection';
import Person from '../../models/Person';
import Animal from '../../models/Animal';
import Movie from '../../models/Movie';
import * as error from '../../error-messages';

const resolvers = {
  // Person: {
  //   pets: async (parent, args) => {
  //     const person = await Person.query().findById(parent.id);
  //     const pets = await person
  //       .$relatedQuery('pets')
  //       .skipUndefined()
  //       .where('name', 'like', args.name)
  //       .where('species', args.species);

  //     return pets;
  //   }
  // },
  // Article: {
  //   user: (parent, args) => User.findById(parent.user)
  // },
  Mutation: {
    createPerson: () => {
      return {
        firstName: 'AnotherUser',
        lastName: 'Uservov',
        age: 33,
        address: {
          city: 'Gaithersburg',
          zipCode: '20882',
          street: '8009 Rocky Road'
        }
      };
    }
  },
  Query: {
    getPersonsCount: async (parent, args, ctx, info) => {
      const total = await Person.query().count('id');
      return total[0]['count(`id`)'];
    },
    getPerson: async (parent, args, context) => {
      return await Person.query().findById(args.id);
    },
    getPersons: async (parent, args, context) => {
      // if (!context.loggedInUser) throw new ForbiddenError(error.auth.failed);
      const persons = await Person.query();
      // const pets = await person
      //   .$relatedQuery('pets')
      //   .skipUndefined()
      //   .where('name', 'like', args.name)
      //   .where('species', args.species);

      return persons;
      // return {
      //   lastName: 'xxx',
      //   firstName: 'vvvv'
      // };
    }
  }
};

export default resolvers;
