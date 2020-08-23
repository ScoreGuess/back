const { findOne } = require("./utils/db");
const admin = require("firebase-admin");

const {
  userCreate,
  userRead,
  userCreatePrediction,
  userSearchPredictions,
  User,
} = require("./User/resolvers");
const {
  fixtureSearch,
  fixtureRead,
  updateScore,
  updateStatus,
  fixtureCreate,
  Fixture,
} = require("./Fixture/resolvers");
const { teamSearch, teamCreate, teamDelete } = require("./Team/resolvers");
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
  Fixture,
  User,
  Prediction: {
    attributes: (p) => {
      return p.attributes == null
        ? []
        : Object.values(p.attributes).map((type) => ({ type }));
    },
    fixture: async (prediction) =>
      await findOne("fixtures", prediction.fixtureId),
  },
  Mutation: {
    // teams related mutation resolvers
    teamCreate,
    teamDelete,

    // fixtures related mutation resolvers
    fixtureCreate,
    updateScore,
    updateStatus,
    // user related mutation resolvers
    userCreate,
    userCreatePrediction,
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
