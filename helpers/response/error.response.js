/**
 *
 * @param {object} res response object
 * @param {string} msg error message
 * @param {object} options other options
 */
const errorReponse = (res, msg = "", options = {}) => {
  const status = +options.status || 400;
  res
    .status(status)
    .json({ success: false, error: { code: status, message: msg } });
};

module.exports = errorReponse;
