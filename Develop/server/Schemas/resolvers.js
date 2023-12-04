// schemas/resolvers.js

const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Mutation: {
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      
      if (!user) {
        throw new Error('Something went wrong while creating the user.');
      }

      const token = signToken(user);
      return { token, user };
    },

    login: async (_, { username, email, password }) => {
      const user = await User.findOne({ $or: [{ username }, { email }] });

      if (!user) {
        throw new Error("Can't find this user.");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new Error('Wrong password!');
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (_, { bookInfo }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: bookInfo } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.error(err);
        throw new Error('Error saving the book.');
      }
    },

    removeBook: async (_, { bookId }, { user }) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Couldn't find user with this id!");
      }

      return updatedUser;
    },
  },
};

module.exports = resolvers;
