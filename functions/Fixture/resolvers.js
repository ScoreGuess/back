const { save, find, findOne, findOneAndUpdate } = require("../utils/db");
const admin = require("firebase-admin");
const moment = require("moment");

const fixtureRead = async (_, { fixtureId, groupId, userId }) => {
  const fixture = await findOne("fixtures", fixtureId);
  return {
    ...fixture,
    groupId,
  };
};

const currentMatchDay = async () => {
  const fixtures = await find("fixtures");
  const grouped = fixtures.reduce((groupedFixtures, fixture) => {
    const day = fixture.matchDay;
    const group = groupedFixtures[day] != null ? groupedFixtures[day] : [];
    return { ...groupedFixtures, [day]: [...group, fixture] };
  }, {});

  const [[currentMatchDay]] = Object.entries(grouped).sort(
    ([keyA], [keyB]) => keyB - keyA
  );
  return currentMatchDay;
};
const fixtureSearch = async (
  _,
  { first = 20, after = null, matchDay, start, end, status, groupId }
) => {
  const ref = admin.firestore().collection("fixtures");
  let res;
  if (after != null) {
    let last = await ref.doc(after);
    last = await last.get();
    res = await ref
      .orderBy("startDate", "desc")
      .startAfter(last)
      .limit(20)
      .get();
  } else {
    res = await ref.orderBy("startDate", "desc").limit(20).get();
  }
  let fixtures = [];
  res.forEach((doc) => {
    fixtures.push({ id: doc.id, ...doc.data() });
  });

  return fixtures
    .map((fixture) => ({ ...fixture, groupId }))
    .filter((fixture) => matchDay == null || fixture.matchDay === matchDay)
    .filter((fixture) => status == null || status.includes(fixture.status))
    .filter(
      (fixture) =>
        start == null ||
        moment(fixture.startDate, "YYYY-MM-DDTHH:mm").isAfter(
          start,
          "YYYY-MM-DD"
        )
    )
    .filter(
      (fixture) =>
        end == null ||
        moment(fixture.startDate, "YYYY-MM-DDTHH:mm").isBefore(
          end,
          "YYYY-MM-DD"
        )
    )
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
};

const fixtureCreate = async (_, fixture) => {
  const { competition: competitionId } = fixture;
  const ref = admin.firestore().collection("fixtures");
  const doc = await ref.add({
    ...fixture,
    status: "PLANNED",
  });

  await findOneAndUpdate("competitions", competitionId, (competition) => ({
    ...competition,
    allFixturesIds: [
      ...(competition != null && competition.allFixturesIds != null
        ? competition.allFixturesIds
        : []),
      doc.id,
    ],
  }));
  return {
    ...fixture,
    id: doc.id,
    status: "PLANNED",
  };
  // return saved;
};
const updateStartDate = async (_, { fixtureId, startDate }) => {
  const ref = admin.firestore().collection("fixtures");
  let doc = await ref.doc(fixtureId);
  await doc.update({ startDate });
  const updated = await doc.get();
  return {
    id: fixtureId,
    ...updated.data(),
  };
};
const updateStatus = async (_, { fixtureId, status }) => {
  const ref = admin.firestore().collection("fixtures");
  let doc = await ref.doc(fixtureId);
  await doc.update({ status });
  const updated = await doc.get();
  return {
    id: fixtureId,
    ...updated.data(),
  };
};
/**
 * Updates the score of a fixture.
 * @param _ the resolver Parent param not used in this case
 * @param fixtureId the fixture id
 * @param homeScore the homeScore >= 0
 * @param awayScore the awayScore >= 0
 */
const updateScore = async (_, { fixtureId, homeScore, awayScore }) => {
  try {
    const ref = admin.firestore().collection("fixtures");
    let doc = await ref.doc(fixtureId);
    await doc.update({
      homeScore,
      awayScore,
    });
    const updated = await doc.get();
    return {
      id: fixtureId,
      ...updated.data(),
    };
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
    competition: async (fixture) => {
      const competition = await findOne("competitions", fixture.competition);
      return competition;
    },
    prediction: async (fixture, _, { userId }) =>
      await findOne(`users/${userId}/predictions`, fixture.id),
    homeTeam: async (fixture) => await findOne("teams", fixture.homeTeamId),
    awayTeam: async (fixture) => await findOne("teams", fixture.awayTeamId),
    predictions: async (fixture) => {
      console.log("coucoucou");
      if (fixture.groupId == null) return [];
      const group = await findOne("groups", fixture.groupId);
      const participants = await Promise.all(
        group.participants.map(async (userId) => {
          const predictions = await find(`users/${userId}/predictions`);
          return { id: userId, predictions };
        })
      );
      return participants
        .map((participant) => {
          const prediction = participant.predictions.find(
            (p) => p.fixtureId === fixture.id
          );
          if (prediction == null) return null;
          return {
            ...prediction,
            user: {
              id: participant.id,
            },
          };
        })
        .filter((p) => p != null);
    },
  },
};
