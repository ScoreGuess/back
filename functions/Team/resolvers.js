const { save, find, findOneAndDelete } = require("../utils/db");

const teamSearch = async (_, resource) => {
  return await find("teams");
};
const teamCreate = async (_, resource) => {
  return await save("teams", {
    ...resource,
  });
};

const teamDelete = async (_, { teamId }) => {
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
  teamSearch,
  teamCreate,
  teamDelete,
};
