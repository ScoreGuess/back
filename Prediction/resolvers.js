const { find, save } = require("../Shared/db");

const predictionCreate = async (_, { fixtureId, userId, ...rest }) => {
  return await save("predictions", {
    fixtureId,
    userId,
    ...rest,
  });
};

const predictionSearch = async (_, { userId }) => {
  const predictions = await find("predictions");
  predictions.filter((prediction) => prediction.userId === userId);
};

module.exports = {
  predictionSearch,
  predictionCreate,
};
