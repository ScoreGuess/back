const admin = require("firebase-admin");
const { findOne, find } = require("../Shared/db");

const userCreate = async (_, user) => {
  const ref = admin.database().ref("users");
  await ref.child(user.id).set(user);
  return user;
};

const userRead = async (_, { userId }) => {
  return await findOne("users", userId);
};

const userCreatePrediction = async (_, { fixtureId, userId, ...rest }) => {
  // c.f. https://firebase.google.com/docs/database/admin/save-data#section-push
  const ref = admin.database().ref(`users/${userId}/predictions`);
  console.log(fixtureId);
  await ref.child(fixtureId).update({ fixtureId, ...rest });
  const fixture = await findOne("fixtures", fixtureId);

  return {
    fixture,
    ...rest,
  };
};

const userSearchPredictions = async (_, { userId }) => {
  const predictions = await find(`users/${userId}/predictions`);
  const fixtures = await find("fixtures");

  return predictions.map((p) => ({
    ...p,
    fixture: fixtures.find((f) => f.id === p.fixtureId),
  }));
};

module.exports = {
  userCreate,
  userRead,
  userCreatePrediction,
  userSearchPredictions,
};
