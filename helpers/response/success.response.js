/**
 *
 * @param {object} res response object
 * @param {string} msg error message
 * @param {object} options other options
 */

const successResponse = (res, msg = "", data, options = {}) => {
  const status = +options.status || 200;
  res.status(status).json({ success: true, msg: msg, data: data });
};

module.exports = successResponse;
