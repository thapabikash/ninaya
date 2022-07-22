const RoleService = require("../../services/datas/roles.data");
// helpers
const { log } = require("../../../helpers/logger");
const { pagination } = require("../../../helpers/paginationHelper");
const RoleSchema = require("../../services/validationSchema/roles.schema");
const title = "Roles";
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
            role: {
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
    const roles = await RoleService.findAllRoles(paginateData);
    res.send({
      data: roles,
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
    const { error } = RoleSchema.schema.validate(data);
    if (error) {
      let errArray = [];
      error.details.forEach((err) => {
        errArray.push(err.message);
        throw new Error(errArray);
      });
    }
    const role = await RoleService.createRole(data);
    log.info(
      { req, title, id: role.id },
      `Role added success with role ${role.name}`
    );
    res.send({
      data: { role },
      message: "Role added Successfully",
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
    const role = await RoleService.findOneRole({ id });
    res.send({
      data: { role },
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
    const { error } = RoleSchema.schema.validate(data);
    if (error) {
      let errArray = [];
      error.details.forEach((err) => {
        errArray.push(err.message);
        throw new Error(errArray);
      });
    }
    const role = await RoleService.updateRole({ id }, data);

    if (role) {
      log.info(
        { req, title, id: role.id },
        `Role update success with name ${role.role}`
      );
      res.send({
        data: { role },
        message: "Role Updated Successfully",
        success: true,
      });
    } else {
      throw new Error("Failed to update role");
    }
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const id = req.params.id;
    const role = await RoleService.deleteRole({ id });

    if (role === 0) {
      return res.status(404).send({
        error: {
          code: 404,
          message: "role not found",
        },
        success: false,
      });
    }

    log.info({ req, title, id }, `role delete success with id: ${id}!!`);
    res.send({
      status: role,
      message: "Role Deleted Successfully",
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
