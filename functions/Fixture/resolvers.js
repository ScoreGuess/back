const {save, find, findOne, findOneAndUpdate} = require("../utils/db");

const fixtureRead = async (_, {fixtureId, userId}) => {
    return await findOne("fixtures", fixtureId);
};

const currentMatchDay = async () => {
    const fixtures = await find("fixtures");
    const grouped = fixtures.reduce((groupedFixtures, fixture) => {
        const day = fixture.matchDay;
        const group = groupedFixtures[day] != null ? groupedFixtures[day] : [];
        return {...groupedFixtures, [day]: [...group, fixture]};
    }, {});

    const [[currentMatchDay]] = Object.entries(grouped).sort(
        ([keyA], [keyB]) => keyB - keyA
    );
    return currentMatchDay;
};
const fixtureSearch = async (_, {matchDay, groupId}) => {
    const fixtures = await find("fixtures");
    if (matchDay == null) {
        const grouped = fixtures.reduce((groupedFixtures, fixture) => {
            const day = fixture.matchDay;
            const group = groupedFixtures[day] != null ? groupedFixtures[day] : [];
            return {...groupedFixtures, [day]: [...group, {...fixture, groupId}]};
        }, {});

        const [[_, currentMatchDayFixtures]] = Object.entries(grouped).sort(
            ([keyA], [keyB]) => keyB - keyA
        );
        return currentMatchDayFixtures;
    } else {
        return fixtures
            .map(fixture => ({...fixture, groupId}))
            .filter((fixture) => fixture.matchDay === matchDay);
    }
};

const fixtureCreate = async (_, fixture) => {
    return await save("fixtures", {
        ...fixture,
        status: "PLANNED",
    });
};
const updateStartDate = async (_, {fixtureId, startDate}) => {
    return await findOneAndUpdate("fixtures", fixtureId, (resource) => ({
        ...resource,
        startDate,
    }));
};
const updateStatus = async (_, {fixtureId, status}) => {
    return await findOneAndUpdate("fixtures", fixtureId, (resource) => ({
        ...resource,
        status,
    }));
};
/**
 * Updates the score of a fixture.
 * @param _ the resolver Parent param not used in this case
 * @param fixtureId the fixture id
 * @param homeScore the homeScore >= 0
 * @param awayScore the awayScore >= 0
 */
const updateScore = async (_, {fixtureId, homeScore, awayScore}) => {
    try {
        return await findOneAndUpdate("fixtures", fixtureId, (resource) => ({
            ...resource,
            homeScore,
            awayScore,
        }));
    } catch (e) {
        console.error(e);
    }
};

module.exports = {
    currentMatchDay,
    fixtureRead,
    fixtureSearch,
    updateStatus,
    updateScore,
    updateStartDate,
    fixtureCreate,
    Fixture: {
        prediction: async (fixture, _, {userId}) =>
            await findOne(`users/${userId}/predictions`, fixture.id),
        homeTeam: async (fixture) => await findOne("teams", fixture.homeTeamId),
        awayTeam: async (fixture) => await findOne("teams", fixture.awayTeamId),
        predictions: async (fixture) => {
            if(fixture.groupId == null) return []
            const group = await findOne("groups", fixture.groupId);
            const participants = await Promise.all(group.participants.map(async userId => {
                const predictions = await find(`users/${userId}/predictions`)
                return  { id:userId, predictions}
            }))
            return participants.map(participant => {
                const prediction = participant.predictions.find(p=>p.fixtureId===fixture.id)
                if(prediction==null)return null
                return {
                    ...prediction,
                    user:{
                        id:participant.id
                    }
                }
            }).filter(p=>p!=null)
        }
    },
};
