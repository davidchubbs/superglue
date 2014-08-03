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
   * Add an Error Constructor.
   *
   * Includes ability to extend an existing constructor,
   * as well as adds standardized properties, such as:
   *
   * .type     - name of the constructor
   * .failedOn - name of task that created the error
   *
   * @example
   *   superglue.addError("ConstructorName", function () {
   *     this.specialProp = "unique to this constructor";
   *   }, Error);
   *
   * @method addError
   * @param {String} name
   * @param {Function} constructor
   * @param {Function} [protoConstructor]
   * @chainable
   */

  addError : function (name, constructor, protoConstructor) {
    if (typeof name !== "string" || !name || typeof constructor !== "function") return this;

    if (typeof protoConstructor === "function") {
      constructor.prototype = Object.create(protoConstructor.prototype);
    }

    // add standardized properties
    constructor.prototype.type     = name;
    constructor.prototype.failedOn = null;  // set later, when the error is created

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