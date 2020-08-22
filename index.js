const { AuthenticationError } = require("apollo-server-errors");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const serviceAccount = require("./credentials.json");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const onFixtureWrite = require("./Fixture/index");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://scoreguess-17a79.firebaseio.com",
});

const app = express();

const checkAPIKey = (req) =>
  req.headers.SCOREGUESS_API_KEY !== "5C0R3GU355_15_AW350M3";

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

exports.graphql = functions.https.onRequest(app);

// everyTime a fixture is created, this function will register tasks to update the status when the match starts or ends
exports.onFixtureWrite = onFixtureWrite;
