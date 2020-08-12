const { save, find, findOneAndUpdate } = require("../Shared/db");

const fixtureSearch = async (_, { matchDay }) => {
  const fixtures = await find("fixtures");
  const teams = await find("teams");

  return fixtures
    .filter((fixture) => matchDay == null || matchDay === fixture.matchDay)
    .map((fixture) => {
      return {
        ...fixture,
        awayTeam: teams.find((t) => t.id === fixture.awayTeamId),
        homeTeam: teams.find((t) => t.id === fixture.homeTeamId),
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
        score: {
          homeScore,
          awayScore,
        },
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
  fixtureSearch,
  fixtureUpdateScore,
  fixtureCreate,
};
