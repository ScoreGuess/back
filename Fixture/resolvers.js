const { save, find, findOne, findOneAndUpdate } = require("../Shared/db");

const fixtureRead = async (_, { fixtureId, userId }) => {
  const fixture = await findOne("fixtures", fixtureId);
  const teams = await find("teams");

  const prediction = await findOne(`users/${userId}/predictions/`, fixtureId);

  return {
    ...fixture,
    prediction,
    awayTeam: teams.find((t) => t.id === fixture.awayTeamId),
    homeTeam: teams.find((t) => t.id === fixture.homeTeamId),
  };
};
const fixtureSearch = async (_, { userId, matchDay }) => {
  const fixtures = await find("fixtures");
  const teams = await find("teams");
  const predictions = await find(`users/${userId}/predictions`);

  return fixtures
    .filter((fixture) => matchDay == null || matchDay === fixture.matchDay)
    .map((fixture) => {
      return {
        ...fixture,
        awayTeam: teams.find((t) => t.id === fixture.awayTeamId),
        homeTeam: teams.find((t) => t.id === fixture.homeTeamId),
        prediction: predictions.find((p) => p.fixtureId === fixture.id),
      };
    });
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
const fixtureUpdateScore = async (_, { fixtureId, homeScore, awayScore }) => {
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
  fixtureUpdateScore,
  fixtureCreate,
};
