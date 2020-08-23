const { AuthenticationError } = require("apollo-server-errors");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const serviceAccount = require("./credentials.json");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const onFixtureWrite = require("./Fixture/index");
const { find } = require("./utils/db");
const moment = require("moment");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://scoreguess-17a79.firebaseio.com",
});

const app = express();

const checkAPIKey = (req) => {
  return req.headers.scoreguess_api_key === "5C0R3GU355_15_AW350M3";
};

const checkToken = (req) =>
  req.headers.authorization != null
    ? req.headers.authorization.substring(7)
    : null;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // user info is extract from the context
  // see https://www.apollographql.com/docs/apollo-server/security/authentication/
  context: async ({ req }) => {
    if (checkAPIKey(req) === true) {
      // when using api key, automatically use my userId
      return {
        userId: "24S8zgYYT6UWD8IgTMA3HXYkqDo1",
      };
    } else {
      const token = checkToken(req);
      if (!token) throw new AuthenticationError("you must be logged in");
      try {
        const { user_id } = await admin.auth().verifyIdToken(token);
        // we prefer 🐪 over 🐍
        return { userId: user_id };
      } catch (e) {
        throw new AuthenticationError("invalid token");
      }
    }
  },
});

server.applyMiddleware({ app, path: "/", cors: true });

// graphql endpoint used to get user info and fixture on the mobile app
exports.graphql = functions.https.onRequest(app);

// everyTime a fixture is created, this function will register tasks to update the status when the match starts or ends
exports.onFixtureWrite = onFixtureWrite;

exports.onDayEnd = functions.https.onRequest(async (req, res) => {
  const fixtures = await find("fixtures");
  const snapshot = await admin.database().ref("users").once("value");

  const userEntries = Object.entries(snapshot.val());
  const oneWeekBefore = moment().subtract(1, "week");

  const finishedFixtures = fixtures
    .filter((fixture) =>
      moment(fixture.startDate, "DD-MM-YYYYTHH:mm").isBetween(
        oneWeekBefore,
        moment()
      )
    )
    .filter((fixture) => fixture.status === "FINISHED");

  userEntries.map(([userId, { predictions }]) => {
    finishedFixtures.map((fixture) => {
      const prediction = predictions[fixture.id];

      if (prediction == null) return;

      if (
        prediction.homeScore === fixture.homeScore &&
        prediction.awayScore === fixture.awayScore
      ) {
        console.log("exact score");
        return;
      }

      const predictionResult = prediction.homeScore - prediction.awayScore;
      const fixtureResult = fixture.homeScore - fixture.awayScore;
      if (predictionResult === 0 && fixtureResult === 0) {
        console.log("exact result draw");
        return;
      }
      //prevent draw prediction to be consider as exact result
      // check if they have the same sign
      if (
        predictionResult !== 0 &&
        fixtureResult !== 0 &&
        predictionResult > 0 === fixtureResult > 0
      )
        console.log("exact result winner");
    });
  });

  res.send("ok");
});
