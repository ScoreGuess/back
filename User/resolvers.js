const { find, save } = require("../Shared/db");

const userCreate = async (_, user) => {
  const resource = await save("users", {
    ...user,
  });
  return resource;
};

const userSearch = async () => {
  return await find("users");
};

module.exports = {
  userCreate,
  userSearch,
};
