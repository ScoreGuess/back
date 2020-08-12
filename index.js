const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const serviceAccount = require("./credentials.json");
const { userCreate, userSearch } = require("./User/resolvers");
const {
  fixtureSearch,
  fixtureUpdateScore,
  fixtureCreate,
} = require("./Fixture/resolvers");
const { teamSearch, teamCreate, teamDelete } = require("./Team/resolvers");
const typeDefs = require("./Shared/typeDefs");

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
    allTeams: teamSearch,
    allFixtures: fixtureSearch,
    allUsers: userSearch,
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
  },
};

const app = express();
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
});

server.applyMiddleware({ app, path: "/", cors: true });
exports.graphql = functions.https.onRequest(app);
