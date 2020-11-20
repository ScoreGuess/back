const admin = require("firebase-admin");
const fromGroups = require("./Groups/resolvers");
const fromCompetition = require("./Competition/resolvers");
const fromPredictions = require("./Predictions/resolvers");
const fromUser = require("./User/resolvers");
const {
  fixtureSearch,
  fixtureRead,
  updateScore,
  updateStatus,
  updateStartDate,
  currentMatchDay,
  fixtureCreate,
  Fixture,
} = require("./Fixture/resolvers");
const fromTeam = require("./Team/resolvers");
// naming convention for resolvers is ResourceType+Action+DataType?
// resourceType: Team, Fixture etc...
// action: SCRUD => search, create, read, update, delete
// datatype should be define when updating something on the resource
// since GraphQL is separating Query from Mutation
// we should have Search and Read operation in Query
// Create Update and Delete in Mutation
const resolvers = {
  Query: {
    competitions: fromCompetition.search,
    group: fromGroups.read,
    groups: fromGroups.search,
    teams: fromTeam.search,
    fixtures: fixtureSearch,
    fixture: fixtureRead,
    currentMatchDay,

    // to resolve me we get userId directly from the context
    // see the context definition down below to find out more
    me: (_, __, { userId }) => fromUser.userRead(userId),
    // when looking for a specific user we expect to have userId as an argument
    user: (_, { userId }) => fromUser.userRead(userId),
    predictions: fromUser.userSearchPredictions,
  },
  Fixture,
  Team:fromTeam.Team,
  User: fromUser.User,
  Prediction: fromPredictions.Prediction,
  Group: fromGroups.Group,
  Mutation: {
    createCompetition: fromCompetition.create,
    // group
    createGroup: fromGroups.create,
    joinGroup: fromGroups.join,
    // teams related mutation resolvers
    teamCreate: fromTeam.create,
    teamDelete: fromTeam.remove,

    // fixtures related mutation resolvers
    fixtureCreate,
    updateScore,
    updateStatus,
    updateStartDate,
    // user related mutation resolvers
    userCreate: fromUser.userCreate,
    userCreatePrediction: fromUser.userCreatePrediction,
    updateAttributes: async (_, { userId, fixtureId, attributeTypes }) => {
      // c.f. https://firebase.google.com/docs/database/admin/save-data#section-push
      const ref = admin
        .database()
        .ref(`users/${userId}/predictions/${fixtureId}/attributes`);
      // Attribute model expect a Fixture and a User
      attributeTypes.forEach((type) => ref.push(type));
      return null;
    },
  },
};

module.exports = resolvers;
