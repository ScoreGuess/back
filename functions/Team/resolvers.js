const { save, find, findOneAndDelete } = require("../utils/db");

const search = async (_, resource) => {
  return await find("teams");
};
const create = async (_, resource) => {
  return await save("teams", {
    ...resource,
  });
};

const remove = async (_, { teamId }) => {
  try {
    const deletedTeam = await findOneAndDelete("teams", teamId);
    return {
      ...deletedTeam,
    };
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  search,
  create,
  remove,
  Team:{
    fixtures: async (team)=>{
      const fixtures =await find("fixtures")
      return fixtures.filter(f=>{
        return team.id === f.awayTeamId || team.id === f.homeTeamId
      })
    }
  }
};
