'use strict';

/**
 * Create Bad Request Error
 */
function BadRequest(message) {
  this.name = 'BadRequest';
  this.message = message || 'Bad Request';
  this.stack = (new Error()).stack;
}
BadRequest.prototype = Object.create(Error.prototype);
BadRequest.prototype.constructor = BadRequest;

/**
 * Create Not Found Error
 */
function NotFound(message) {
  this.name = 'NotFound';
  this.message = message || 'Not Found';
  this.stack = (new Error()).stack;
}
NotFound.prototype = Object.create(Error.prototype);
NotFound.prototype.constructor = NotFound;

/**
 * Create Unauthorized Error
 */
function Unauthorized(message) {
  this.name = 'Unauthorized';
  this.message = message || 'Unauthorized';
  this.stack = (new Error()).stack;
}
Unauthorized.prototype = Object.create(Error.prototype);
Unauthorized.prototype.constructor = Unauthorized;


module.exports = {
  BadRequest,
  NotFound,
  Unauthorized
};