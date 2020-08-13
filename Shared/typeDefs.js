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
    logo: String
  }

  """
  Score represents the score of a fixture
  The score could be used while the fixture is in-progress or finished
  """
  type Score {
    homeScore: Int!
    awayScore: Int!
  }

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
    score: Score
  }

  """
  Prediction represents a prediction
  """
  type Prediction {
    id: ID!
    user: User!
    fixture: Fixture!
    score: Score!
    active: Boolean!
  }

  type Query {
    allTeams: [Team!]!

    """
    allFixtures queries all the fixtures of the competition.
    It accepts matchDay as an argument to filter fixtures on a specific matchDay
    """
    allFixtures(matchDay: Int): [Fixture!]!

    """

    """
    user(userId: String!): User!

    allPredictions: [Prediction!]!
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
    predictionCreate(
      userId: ID!
      fixtureId: ID!
      homeScore: Int!
      awayScore: Int!
    ): Prediction
  }
`;
