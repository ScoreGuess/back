const {gql} = require("apollo-server-express");

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
        fixtures:[Fixture!]
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
    type Competition {
        id:ID!
        name: String!
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
        predictions: [Prediction!]!
        competition: Competition!
    }
    type Ranking {
        userId: String!,
        score: Int!
    }
    type Standing {
        user: User!
        rank: Int
    }
    enum GroupStatus {
        DRAFT
        LIVE
        STOPPED
    }

    type Group {
        id: ID!
        author: User!
        participants: [User!]!
        name: String!
        status: GroupStatus
        size: Int
         rankings:[Ranking!]!
        createdAt:String!
    }

    """
    Prediction represents a prediction
    """
    type Prediction {
        user: User
        fixture: Fixture
        homeScore: Int!
        awayScore: Int!
        "attributes should be calculated every week"
        attributes: [Attribute!]
    }

    enum AttributeType {
        "exact score duh!"
        EXACT_SCORE
        "good winner or draw"
        EXACT_RESULT
        "wrong result"
        WRONG_RESULT
    }

    """
    Attribute
    """
    type Attribute {
        user: User!
        "an attribute is always bond to a fixture even though it is something like 3 good score in a row"
        fixture: Fixture!
        type: AttributeType!
    }

    type Query {
        competitions:[Competition!]!
        group(groupId:String!): Group

        groups: [Group!]!
        teams: [Team!]!
        team: Team!

        fixture(fixtureId: String!, groupId: String): Fixture!
        fixtures(first:Int, after:String,offset:Int, status: [FixtureStatus!], groupId:String, start:String, end:String, matchDay:Int): [Fixture!]!
        """
        Resolves the last matchDay entered
        """
        currentMatchDay: Int!
        """
        Returns the authenticated user and all its data
        it uses the userId provided in the Authorization bearer token
        """
        me: User!

        """
        Returns the authenticated user
        Note: predictions are not returned if the userId does not match the current authenticated userId
        """
        user(userId: String!): User

        """
        returns a list of predictions
        """
        predictions(userId: String): [Prediction!]!
    }

    type Mutation {
        createGroup(name: String!): Group

        joinGroup(groupId: String!, userId: String): Group

        "Adds a team to the competition"
        teamCreate(shortName: String!, longName: String!, logo: String!): Team
        "Removes a team from a competition"
        teamDelete(id: ID!): Team

        "Adds a team to the competition"
        fixtureCreate(
            awayTeamId: ID!
            homeTeamId: ID!
            matchDay: Int
            competition: ID!
            startDate: String
        ): Fixture

        "Updates the score of a fixture"
        updateScore(fixtureId: ID!, homeScore: Int, awayScore: Int): Fixture

        "Updates the status of a fixture"
        updateStatus(fixtureId: ID!, status: FixtureStatus!): Fixture
        "Update the date"
        updateStartDate(fixtureId: ID!, startDate: String!): Fixture

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
            userId: ID
        ): Prediction

        """
        Updates the attributes of a Prediction. Usually this mutation is called after a fixture is over
        Attributes are used to compute the amount of point a user has won for a fixture.
        """
        updateAttributes(
            fixtureId: String!
            userId: String!
            attributeTypes: [AttributeType!]
        ): Prediction

        createCompetition(
            name:String!
        ):Competition
    }
`;
