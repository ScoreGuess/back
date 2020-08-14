const { save, find, findOne, findOneAndUpdate } = require("../utils/db");

const fixtureRead = async (_, { fixtureId, userId }) => {
  return await findOne("fixtures", fixtureId);
};

const fixtureSearch = async (_, { matchDay }, { userId }) => {
  const fixtures = await find("fixtures");

  return fixtures;
};

const fixtureCreate = async (_, fixture) => {
  return await save("fixtures", {
    ...fixture,
    status: "PLANNED",
  });
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
    const updatedResource = await findOneAndUpdate(
      "fixtures",
      fixtureId,
      (resource) => ({
        ...resource,
        homeScore,
        awayScore,
      })
    );

    //TODO find a better approach than copy pasting the following code...
    const teams = await find("teams");

    // the fixture we return via graphql expects teams to be populated
    return {
      ...updatedResource,
      awayTeam: teams.find((t) => t.id === updatedResource.awayTeamId),
      homeTeam: teams.find((t) => t.id === updatedResource.homeTeamId),
    };
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  fixtureRead,
  fixtureSearch,
  updateScore,
  fixtureCreate,
  Fixture: {
    prediction: async (fixture, _, { userId }) =>
      await findOne(`users/${userId}/predictions`, fixture.id),
    homeTeam: async (fixture) => await findOne("teams", fixture.homeTeamId),
    awayTeam: async (fixture) => await findOne("teams", fixture.awayTeamId),
  },
};
