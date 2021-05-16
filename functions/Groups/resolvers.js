const {save, find, findOne, findOneAndUpdate} = require("../utils/db");
const admin = require("firebase-admin");
const moment = require('moment')

const create = async (_, resource, { userId }) => {
    return await save("groups", {
        ...resource,
        participants: [userId],
        createdAt: moment().format('YYYY-MM-DD'),
        author: userId,
    });
};
const join = async (_, {groupId, userId}, context) => {
    userId = userId == null ? context.userId : userId
    const updatedParticipants =  [...group.participants, userId].filter(
        (elem, pos, arr) => arr.indexOf(elem) === pos
    )
    return await findOneAndUpdate("groups", groupId, (group) => ({
        ...group,
        // proxy value for length
        // we could add leader and stuff like this
        size: updatedParticipants.length,
        participants: updatedParticipants
    }));
};

const search = async (_, __, {userId}) => {
    const groups = await find("groups");
    return groups.filter(group => {
        return group.author === userId || group.participants.some(participantId => participantId === userId)
    })
};

const read = async (_, {groupId}, {userId}) => {
    return await findOne("groups", groupId);
};

module.exports = {
    create,
    read,
    search,
    join,
    Group: {
        author: async (group) => {
            const user = await admin.auth().getUser(group.author)
            return {...user, id: user.uid}
        },
        rankings: async (group) => {
            return Object.entries(group.rankings).map(([id, score]) => {
                return ({ score, userId: id})
            })
        },
        participants: async (group) => {
            // c.f. https://firebase.google.com/docs/auth/admin/manage-users?authuser=0#retrieve_user_data
            const {users} = await admin
                .auth()
                .getUsers(group.participants.map((p) => ({uid: p})));

            return users.map((user) => ({...user, id: user.uid}));
        },
    },
};
