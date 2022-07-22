const AccountService = require("../../services/datas/account.data");
// helpers
const { log } = require("../../../helpers/logger");
const { pagination } = require("../../../helpers/paginationHelper");
const AccountSchema = require("../../services/validationSchema/account.schema");
const title = "Account";
/**
 * index: controller to get list of users
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next function
 */

async function index(req, res, next) {
  const { q, page, size, order_by, status, order_direction } = req.query;
  let order = [];
  let searchq = {};
  try {
    if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }
    if (q) {
      searchq = {
        ...searchq,
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${q}%`,
            },
          },
        ],
      };
    }
    if (status) {
      searchq["status"] = status;
    }
    const paginateData = pagination(page, size, searchq, order);
    const accounts = await AccountService.findAllAccount(paginateData);
    res.send({
      data: accounts,
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function add(req, res, next) {
  const data = req.body;
  try {
    const { error } = AccountSchema.schema.validate(data);
    if (error) {
      let errArray = [];
      error.details.forEach((err) => {
        errArray.push(err.message);
        throw new Error(errArray);
      });
    }
    const account = await AccountService.createAccount(data);
    log.info(
      { req, title, id: account.id },
      `Account added success with name ${account.name}`
    );
    res.send({
      data: { account },
      message: "Account added Successfully",
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const id = req.params.id;
    const account = await AccountService.findOneAccount({ id });
    res.send({
      data: { account },
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const { error } = AccountSchema.schema.validate(data);
    if (error) {
      let errArray = [];
      error.details.forEach((err) => {
        errArray.push(err.message);
        throw new Error(errArray);
      });
    }
    const account = await AccountService.updateAccount({ id }, data);
    if (account) {
      log.info(
        { req, title, id: account.id },
        `Account update success with name ${account.name}`
      );
      res.send({
        data: { account },
        message: "Account Updated Successfully",
        success: true,
      });
    } else {
      throw new Error("Failed to update account / account not found");
    }
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const id = req.params.id;
    const account = await AccountService.deleteAccount({ id });

    if (account === 0) {
      return res.status(404).send({
        error: {
          code: 404,
          message: "account not found",
        },
        success: false,
      });
    }

    log.info({ req, title, id }, `Acount delete success with id: ${id}!!`);
    res.send({
      status: account,
      message: "Account Deleted Successfully",
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

module.exports = {
  index,
  add,
  show,
  update,
  destroy,
};
