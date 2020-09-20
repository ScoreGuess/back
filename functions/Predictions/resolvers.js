const { findOne } = require("../utils/db");

module.exports = {
  Prediction: {
    attributes: (p) => {
      return p.attributes == null
        ? []
        : Object.values(p.attributes).map((type) => ({ type }));
    },
    fixture: async (prediction) =>
      await findOne("fixtures", prediction.fixtureId),
  },
};
