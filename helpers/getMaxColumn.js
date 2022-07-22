//  getMaxColumn : returns max value of column for given model/table

const Sequelize = require("sequelize");
/**
 * @param {*} model table
 * @param {*} field column
 * @returns
 */

async function findMaxValue(model, field = "") {
  const maxVal = await model.findAll({
    where: {},
    attributes: [Sequelize.fn("max", Sequelize.col(field))],
    raw: true,
  });
  return maxVal[0].max;
}

module.exports = findMaxValue;
