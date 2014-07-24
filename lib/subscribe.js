/*
 * Subscriber Facade
 * =================
 */

module.exports = Subscribe;


/*
 * Internal subscriber constructor
 */

var Listener = require("./storage").Listener;


/*
 * Public Subscribe constructor
 *
 * @constructor
 * @param {String|Array} eventNames - event names to listen for
 */

function Subscribe (eventNames) {
  this._sub = new Listener();

  if (typeof eventNames === "string") {
    this._sub.addEventName(eventNames);
  } else if (Array.isArray(eventNames)) {
    for (var i = 0, len = eventNames.length; i < len; i++) {
      this._sub.addEventName(eventNames[i]);
    }
  }
}


/**
 * Register event-logic
 *
 * @example
 *   subscribe("listen-event-name")
 *     .then(function () {...}, ...)
 *
 * @method then
 * @param {Function} logic - function(s) to invoke whenever event is published; can pass in multiple
 * @chainable
 */

Subscribe.prototype.then = function () {
  for (var i = 0 , len = arguments.length ; i < len ; i++) {
    this._sub.addLogic(arguments[i]);
  }
  return this;
};


/**
 * Register event dependency
 *
 * @example
 *   subscribe("listen-event-name")
 *     .filter(...)
 *     .require(function () {...}, ...)
 *     .then(...)
 *
 * @method require
 * @param {Function} dependency - function(s) that returns a boolean of whether dependent context elements are present; can pass in multiple
 * @chainable
 */

Subscribe.prototype.require = function () {
  for (var i = 0 , len = arguments.length ; i < len ; i++) {
    this._sub.addDependency(arguments[i]);
  }
  return this;
};


/**
 * Register event predicate
 *
 * @example
 *   subscribe("listen-event-name")
 *     .filter(function () {}, function () {}, ...)
 *
 * @method filter
 * @param {Function} predicate - function that returns a boolean of whether the event's callbacks should be run
 * @chainable
 */

Subscribe.prototype.filter = function () {
  for (var i = 0 , len = arguments.length ; i < len ; i++) {
    this._sub.addPredicate(arguments[i]);
  }
  return this;
};