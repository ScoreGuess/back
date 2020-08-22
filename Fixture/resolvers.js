const { save, find, findOne, findOneAndUpdate } = require("../utils/db");

const fixtureRead = async (_, { fixtureId, userId }) => {
  return await findOne("fixtures", fixtureId);
};

const fixtureSearch = async (_, { matchDay }, { userId }) => {
  return await find("fixtures");
};

const fixtureCreate = async (_, fixture) => {
  return await save("fixtures", {
    ...fixture,
    status: "PLANNED",
  });
};

const updateStatus = async (_, { fixtureId, status }) => {
  return await findOneAndUpdate("fixtures", fixtureId, (resource) => ({
    ...resource,
    status,
  }));
};
/**
 * Updates the score of a fixture.
 * @param _ the resolver Parent param not used in this case
 * @param fixtureId the fixture id
 * @param homeScore the homeScore >= 0
 * @param awayScore the awayScore >= 0
 */
const updateScore = async (_, { fixtureId, homeScore, awayScore }) => {
  try {
    return await findOneAndUpdate("fixtures", fixtureId, (resource) => ({
      ...resource,
      homeScore,
      awayScore,
    }));
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  fixtureRead,
  fixtureSearch,
  updateStatus,
  updateScore,
  fixtureCreate,
  Fixture: {
    prediction: async (fixture, _, { userId }) =>
      await findOne(`users/${userId}/predictions`, fixture.id),
    homeTeam: async (fixture) => await findOne("teams", fixture.homeTeamId),
    awayTeam: async (fixture) => await findOne("teams", fixture.awayTeamId),
  },
};
