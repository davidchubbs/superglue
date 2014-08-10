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
   * Add an Error Constructor to Superglue.
   *
   * If the function is a "defined function", no need to provide
   * the name. If "anonymous function", please provide a name.
   *
   * @method addError
   * @param {Function} constructor
   * @param {String} [name] - provide the name of the constructor if it's an anonymous function.
   * @chainable
   */

  addError : function (constructor, name) {
    if (typeof constructor !== "function" || (!name && !constructor.name)) {
      return this;
    }

    if (!name) {
        name = constructor.name;
    }

    this.errors[name] = constructor;

    return this;
  },


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