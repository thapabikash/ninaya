const PublisherDisplayFieldService = require("../../services/datas/publisherDisplayFields.data");
const { successResponse } = require("../../../helpers/response");
async function index(req, res, next) {
  try {
    const user_id = req.params.id;
    const publisherDisplayFields = await PublisherDisplayFieldService.index(user_id);
    return successResponse(res, "display fields", {
      publisherDisplayFields,
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const user_id = req.params.id;
    const { data } = req.body;
    const publisherDisplayFields = await PublisherDisplayFieldService.create(user_id, data);
    return successResponse(res, "display fields", {
      publisherDisplayFields,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const user_id = req.params.id;
    const { data } = req.body;
    const publisherDisplayFields = await PublisherDisplayFieldService.update(user_id, data);
    return successResponse(res, "Publisher display fields updated", {
      publisherDisplayFields,
    });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  index,
  create,
  update,
};
