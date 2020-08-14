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

  Mutation: {
    // teams related mutation resolvers
    teamCreate,
    teamDelete,

    // fixtures related mutation resolvers
    fixtureCreate,
    updateScore,

    // user related mutation resolvers
    userCreate,
    userCreatePrediction,
  },
};

module.exports = resolvers;
