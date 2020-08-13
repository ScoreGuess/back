const admin = require("firebase-admin");
const { findOne } = require("../Shared/db");

const userCreate = async (_, user) => {
  const ref = admin.database().ref("users");

  await ref.child(user.id).set(user);

  return user;
};

const userRead = async (_, { userId }) => {
  return await findOne("users", userId);
};

module.exports = {
  userCreate,
  userRead,
};
