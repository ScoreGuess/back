const {save,find} = require("../utils/db");


const create = async (_, competition) => {
    return await save("competitions", {
        ...competition,
    });
};
const search = async ()=>{
    return await find('competitions')
}

module.exports={
    create,
    search
}
