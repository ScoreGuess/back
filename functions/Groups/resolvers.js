const {save, find, findOne, findOneAndUpdate} = require("../utils/db");
const admin = require("firebase-admin");

const create = async (_, resource, {userId}) => {
    return await save("groups", {
        ...resource,
        participants: [userId],
        author: userId,
    });
};
const join = async (_, {groupId, userId}, context) => {
    userId = userId == null ? context.userId : userId
    return await findOneAndUpdate("groups", groupId, (group) => ({
        ...group,
        participants: [...group.participants, userId].filter(
            (elem, pos, arr) => arr.indexOf(elem) === pos
        ),
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
        participants: async (group) => {
            // c.f. https://firebase.google.com/docs/auth/admin/manage-users?authuser=0#retrieve_user_data
            const {users} = await admin
                .auth()
                .getUsers(group.participants.map((p) => ({uid: p})));

            return users.map((user) => ({...user, id: user.uid}));
        },
    },
};
