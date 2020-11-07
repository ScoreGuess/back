const {findOne} = require("../utils/db");
const admin = require("firebase-admin");

module.exports = {
    Prediction: {
        attributes: (p) => {
            return p.attributes == null
                ? []
                : Object.values(p.attributes).map((type) => ({type}));
        },
        user: async (prediction) => {
            if (prediction != null && prediction.user != null) {
                const user = await admin.auth().getUser(prediction.user.id);
                return {
                    id: user.uid,
                    email: user.email, // email can be null if the user use social login
                    displayName: user.displayName,
                    photoUrl: user.photoURL,
                };
            }
            return null
        },
        fixture: async (prediction) =>
            await findOne("fixtures", prediction.fixtureId),
    },
};
