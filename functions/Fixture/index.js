const { CloudTasksClient } = require("@google-cloud/tasks");

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { findOneAndUpdate } = require("../utils/db");

const graphqlLocation = "us-central1";
const queueLocation = "europe-west1";
const project = "scoreguess-17a79";
const queue = "fixtures-ttl";
const tasksClient = new CloudTasksClient();
const queuePath = tasksClient.queuePath(project, queueLocation, queue);
const url = `https://${graphqlLocation}-${project}.cloudfunctions.net/graphql`;

const createQuery = (fixture, status) => `
    mutation {
        updateStatus(
            fixtureId: "${fixture.id}",
            status: ${status}
        ) {
         status
        }
    }
`;

const onDelete = async (fixture) => {
  const { _inProgressTaskName, _finishedTaskName } = fixture;
  try {
    await tasksClient.deleteTask({
      name: _inProgressTaskName,
    });
    await tasksClient.deleteTask({
      name: _finishedTaskName,
    });
  } catch (e) {
    console.log(e);
  }
};

const onCreate = async (fixture) => {
  let date = new Date(fixture.startDate).getTime() / 1000;
  // hack to adapt to correct timestamp
  // la flemme de mettre momentjs
  // attention ckc le dimanche 29 mars
  date -= 60 * 60;

  const inProgressTask = {
    httpRequest: {
      httpMethod: "POST",
      url,
      body: Buffer.from(
        JSON.stringify({
          variables: {},
          query: createQuery(fixture, "IN_PROGRESS"),
        })
      ).toString("base64"),
      headers: {
        SCOREGUESS_API_KEY: "5C0R3GU355_15_AW350M3",
        "Content-Type": "application/json",
      },
    },
    scheduleTime: {
      seconds: date,
    },
  };
  const finishedTask = {
    httpRequest: {
      httpMethod: "POST",
      url,
      body: Buffer.from(
        JSON.stringify({
          variables: {},
          query: createQuery(fixture, "FINISHED"),
        })
      ).toString("base64"),
      headers: {
        SCOREGUESS_API_KEY: "5C0R3GU355_15_AW350M3",
        "Content-Type": "application/json",
      },
    },
    scheduleTime: {
      // fixture will end roughly 2 hours later
      // two hours later
      seconds: date + 60 * 120,
    },
  };
  try {
    const [inProgressRequest] = await tasksClient.createTask({
      parent: queuePath,
      task: inProgressTask,
    });
    const [finishedRequest] = await tasksClient.createTask({
      parent: queuePath,
      task: finishedTask,
    });

    const ref = admin.firestore().collection("fixtures");
    let doc = await ref.doc(fixture.id);
    await doc.update({
      _inProgressTaskName: inProgressRequest.name,
      _finishedTaskName: finishedRequest.name,
    });
    /*  await findOneAndUpdate("fixtures", fixture.id, (resource) => ({
      ...resource,
      _inProgressTaskName: inProgressRequest.name,
      _finishedTaskName: finishedRequest.name,
    }));*/
  } catch (e) {
    console.log(e);
  }
};
module.exports = functions.firestore
  .document("/fixtures/{fixtureId}")
  .onWrite((change, context) => {
    // create new tasks
    if (!change.before.exists) {
      console.log("coucou");

      return onCreate({
        ...change.after.data(),
        id: change.after.id,
      });
    }

    // remove previous tasks
    if (!change.after.exists) {
      return onDelete(change.before.data());
    }
    const before = change.before.data();
    const after = change.after.data();
    if (before.startDate !== after.startDate) {
      return onCreate({
        ...change.after.data(),
        id: change.after.id,
      });
    }

    return null;
  });
