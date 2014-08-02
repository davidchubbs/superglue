var Publish   = require("./Publish"),
    Subscribe = require("./Subscribe"),
    Group     = require("./Group"),
    errors    = {
      ContextError : require("./errors/ContextError")
    };

function makeArray (args) {
  return Array.prototype.slice.call(args);
}


module.exports = {


  /**
   * Error Constructors' Container
   */
  errors : errors,


  /**
   * Create a new publisher instance
   *
   * @method publish
   * @param {String} [eventNames] - events to fire; include as many as you'd like to fire
   * @param {Object} [context] - context object, always last argument
   * @return {Object}
   */

  publish : function () {
    return new Publish( makeArray(arguments) );
  },


  /**
   * Create a new subscriber instance
   *
   * @method subscribe
   * @param {String} eventNames - event names to listen to; include as many event names as you'd like
   * @return {Object}
   */

  subscribe : function () {
    return new Subscribe( makeArray(arguments) );
  },


  /**
   * 
   *
   * @method group
   * @param {String} groupNames - include as many group-event names as you'd like
   * @return {Object}
   */

  group : function () {
    return new Group( makeArray(arguments) );
  }

};