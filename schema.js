const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    displayName: String
    email: String
    photoUrl: String
    predictions: [Prediction!]
  }
  "Team represents a football team"
  type Team {
    id: ID!
    shortName: String!
    longName: String!
    logo: String!
  }

  """
  Score represents the score of a fixture
  The score could be used while the fixture is in-progress or finished
  """
  enum FixtureStatus {
    PLANNED
    IN_PROGRESS
    FINISHED
  }

  """
  Fixture represents a match between two teams
  """
  type Fixture {
    id: ID!
    status: FixtureStatus!
    startDate: String!
    awayTeam: Team!
    homeTeam: Team!
    matchDay: Int!
    homeScore: Int
    awayScore: Int
    prediction: Prediction
  }

  """
  Prediction represents a prediction
  """
  type Prediction {
    user: User
    fixture: Fixture
    homeScore: Int!
    awayScore: Int!
  }

  type Query {
    teams: [Team!]!

    fixture(fixtureId: String!): Fixture!
    fixtures(matchDay: Int): [Fixture!]!

    """

    """
    me: User!

    user(userId: String!): User

    predictions(userId: String): [Prediction!]!
  }

  type Mutation {
    "Adds a team to the competition"
    teamCreate(shortName: String!, longName: String!, logo: String!): Team
    "Removes a team from a competition"
    teamDelete(id: ID!): Team

    "Adds a team to the competition"
    fixtureCreate(
      awayTeamId: ID!
      homeTeamId: ID!
      matchDay: Int
      startDate: String!
    ): Fixture
    "Updates the score of a fixture"
    updateScore(fixtureId: ID!, homeScore: Int, awayScore: Int): Fixture

    "Adds a user"
    userCreate(
      userId: String!
      firstName: String!
      lastName: String!
      email: String!
    ): User

    "Adds a prediction"
    userCreatePrediction(
      fixtureId: String!
      homeScore: Int!
      awayScore: Int!
    ): Prediction
  }
`;
