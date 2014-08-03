/**
 * ContextError Constructor
 */

module.exports = ContextError;

function ContextError () {
  this.failedOn = null;
}

ContextError.prototype = Object.create(Error.prototype);