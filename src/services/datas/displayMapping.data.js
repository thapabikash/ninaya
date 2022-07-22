const models = require("../../models/index");
const DisplayMapping = models.display_mapping;

async function getDisplayMappingData() {
  return await DisplayMapping.findOne();
}
async function storeDisplayMapping(data) {
  const isExist = await DisplayMapping.findOne({});
  if (isExist) {
    throw new Error("Display mapping already exist");
  }else{
    return await DisplayMapping.create(data);
  }
}
async function updateDisplayMappingData(data, id) {
  const isExist = await DisplayMapping.findOne({});
  if (isExist) {
    return await DisplayMapping.update(data, { where: { id: id } });
  }else{
    throw new Error("Display mapping not exist");
  }
  
}

async function getLatestDisplayMappingData() {
  return await DisplayMapping.findOne({ order: [["id", "DESC"]] });
}

module.exports = {
  storeDisplayMapping,
  getDisplayMappingData,
  updateDisplayMappingData,
  getLatestDisplayMappingData,
};
