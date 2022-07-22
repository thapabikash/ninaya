const Sequelize = require("sequelize");
const {Op} = require("sequelize");

//reuse unique case sensetive field check
async function updateUniqueValue(Modal_name,Modal,data,params,field){
    const existWithValue = await Modal.findAll({
        where:{
            id:{
                [Op.ne]: params.id
            },
            $and:Sequelize.where(Sequelize.fn('lower', Sequelize.col(field)), Sequelize.fn('lower', data[field]))
        }  
    });
    if (existWithValue.length > 0) {
        throw new Error(`${Modal_name} with ${field} ${data[field]} already exist`);
    }
}


async function createUniqueValue(Modal_name,Modal,data,field){
    const existing=await Modal.findAll({
        where:Sequelize.where(Sequelize.fn('lower', Sequelize.col(field)), Sequelize.fn('lower', data[field]))
    })
    if (existing.length > 0) {
        throw new Error(`${Modal_name} with ${field} ${data[field]} already exist`);
    }
}

module.exports={
    createUniqueValue,
    updateUniqueValue
}