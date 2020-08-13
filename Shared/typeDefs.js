const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
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
    allTeams: [Team!]!

    fixture(fixtureId: String!, userId: String!): Fixture!
    """
    allFixtures queries all the fixtures of the competition.
    It accepts matchDay as an argument to filter fixtures on a specific matchDay
    """
    fixtures(matchDay: Int, userId: String!): [Fixture!]!

    """

    """
    user(userId: String!): User!

    predictions(userId: String!): [Prediction!]!
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
    fixtureUpdateScore(fixtureId: ID!, homeScore: Int, awayScore: Int): Fixture

    "Adds a user"
    userCreate(
      userId: String!
      firstName: String!
      lastName: String!
      email: String!
    ): User

    "Adds a prediction"
    userCreatePrediction(
      userId: ID!
      fixtureId: String!
      homeScore: Int!
      awayScore: Int!
    ): Prediction
  }
`;
