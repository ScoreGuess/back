const { AuthenticationError } = require("apollo-server-errors");

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const serviceAccount = require("./credentials.json");
const {
  userCreate,
  userRead,
  userCreatePrediction,
  userSearchPredictions,
} = require("./User/resolvers");
const {
  fixtureSearch,
  fixtureRead,
  fixtureUpdateScore,
  fixtureCreate,
} = require("./Fixture/resolvers");
const { teamSearch, teamCreate, teamDelete } = require("./Team/resolvers");
const typeDefs = require("./Shared/schema");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://scoreguess-17a79.firebaseio.com",
});

// naming convention for resolvers is ResourceType+Action+DataType?
// resourceType: Team, Fixture etc...
// action: SCRUD => search, create, read, update, delete
// datatype should be define when updating something on the resource
// since GraphQL is separating Query from Mutation
// we should have Search and Read operation in Query
// Create Update and Delete in Mutation
const resolvers = {
  Query: {
    teams: teamSearch,
    fixtures: fixtureSearch,
    fixture: fixtureRead,
    // to resolve me we get userId directly from the context
    // see the context definition down below to find out more
    me: (_, __, { userId }) => userRead(userId),
    // when looking for a specific user we expect to have userId as an argument
    user: (_, { userId }) => userRead(userId),
    predictions: userSearchPredictions,
  },

  Mutation: {
    // teams related mutation resolvers
    teamCreate,
    teamDelete,

    // fixtures related mutation resolvers
    fixtureCreate,
    fixtureUpdateScore,

    // user related mutation resolvers
    userCreate,
    userCreatePrediction,
  },
};

const app = express();

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  // user info is extract from the context
  // see https://www.apollographql.com/docs/apollo-server/security/authentication/
  context: async ({ req }) => {
    const user = null;
    const token =
      req.headers.authorization != null
        ? req.headers.authorization.substring(7)
        : null;
    if (!token) throw new AuthenticationError("you must be logged in");

    try {
      const { user_id } = await admin.auth().verifyIdToken(token);
      // we prefer 🐪 over 🐍
      return { userId: user_id };
    } catch (e) {
      throw new AuthenticationError("invalid token");
    }
  },
});

server.applyMiddleware({ app, path: "/", cors: true });
exports.graphql = functions.https.onRequest(app);
