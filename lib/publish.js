/*
 * Publisher Facade
 * ================
 */

module.exports = Publish;


var match = require("./storage").match;
var ContextError = require("./errors/context-error");


/**
 * Publish constructor
 *
 * Argument order is insignificant. Pass in the context when you'd like the
 * events fired to have it.
 *
 * @constructor
 * @param {Array} initial - array of event-names to trigger (strings) & contexts (object)
 */

function Publish (initial) {
  this._cxt = null;
  this._err = null;

  if (Array.isArray(initial)) {
    for (var i = 0 , len = initial.length ; i < len ; i++) {
      if (typeof initial[i] === "string" && initial[i]) {
        this.events(initial[i]);
      } else if (typeof initial[i] === "object" && initial[i]) {
        this.context(initial[i]);
      }
    }
  }
}


/**
 * Assign the context.
 *
 * @method context
 * @param {Object} cxt
 * @chainable
 */

Publish.prototype.context = function (cxt) {
  if (typeof cxt === "object" && cxt) {
    this._cxt = cxt;
  }
  return this;
};


/**
 * Fire off events.
 *
 * No limit to event name arguments or to how many times you
 * can call .event & .events
 *
 * @example
 *   publish
 *     .context(req)
 *     .events("users:read:build-query", "users:read:query", "users:read:format-results")
 *
 * @method events
 * @param {String} name; can pass in multiple
 * @chainable
 */

Publish.prototype.events = function () {
  var name, listeners, listener, fn, returned;

  if (this._err || arguments.length === 0) { return this; }

  for (var i = 0, len = arguments.length ; i < len ; i++) {

    name = arguments[i];

    if (typeof name !== "string") { continue; }

    listeners = match(name);

    // if any listeners were found...
    for (var j = 0 ; j < listeners.length ; j++) {
      listener = listeners[j];

      // if all listener-predicates pass
      if (validate(listener.predicates, this._cxt)) {

        // if the dependencies aren't met in the context, ContextError
        if (!validate(listener.dependencies, this._cxt)) {
          this._err = new ContextError("event: '" + name + "' had missing context dependencies");
          return this;
        }

        for (var k = 0 ; k < listener.logic.length ; k++) {
          fn = listener.logic[k];
          returned = fn.call(this._cxt);
          // if error is returned, set & stop execution
          if (returned instanceof Error) {
            this._err = returned;
            return this;
          }
        }

      }

    }

  }

  return this;
};


/**
 * Alias for .events
 *
 * @method event
 */

Publish.prototype.event = Publish.prototype.events;


/**
 * Fire Tasks
 *
 * If the task accidently begins task name with ":",
 * .tasks() will still work correctly. ":" can be contained
 * inside the task name, which might be useful if doing
 * sub-tasks.
 *
 * @example
 *   // intended use
 *   .tasks("event", ["task1", "task2"]);
 *   // also will work
 *   .tasks("event", "task");
 *   .tasks("event", ":task");
 *
 * @method tasks
 * @param {String} eventName
 * @param {Array|String} task(s) - can be a string if only one task is being fired
 * @chainable
 */

Publish.prototype.tasks = function (eventName, tasks) {
  if (typeof tasks === "string") {
    tasks = [tasks];
  }
  
  if (typeof eventName === "string" && Array.isArray(tasks)) {
    for (var i = 0, len = tasks.length, task, eventTaskName ; i < len ; i++) {
      task = tasks[i];
      eventTaskName = task.slice(0,1) === ":" ? eventName + task : eventName + ":" + task;
      this.events(eventTaskName);
    }
  }
  
  return this;
};


/**
 * Alias for .tasks
 *
 * @method task
 */

Publish.prototype.task = Publish.prototype.tasks;


/**
 * Publisher provided function
 *
 * Publisher functions can update the context
 * just like subscriber functions.
 *
 * If an error has been thrown, publisher functions
 * will not be invoked (just like listener functions)
 * UNLESS the publisher function has a .length === 1
 *
 * Publisher functions can be called at any time
 * in the event-flow, not just at the end.
 *
 * @example
 *   publish
 *     .context({ data : true })
 *     .event("event-name")
 *     .then(function () {...}, function () {...})
 *     .events("more-event-names")
 *     .then(function (err) {...});
 *
 * @method then
 * @param {Function}
 * @chainable
 */

Publish.prototype.then = function () {
  var returned;

  for (var i = 0, len = arguments.length, fn ; i < len ; i++) {
    fn = arguments[i];
    
    if (typeof fn === "function") {
      
      // always invoke functions that accept errors
      if (fn.length === 1) {
        returned = fn.call(this._cxt, this._err);
      } else if (!this._err) {
        returned = fn.call(this._cxt);
      }

      // assign/reassign error if returned from function
      if (returned instanceof Error) {
        this._err = returned;
      }
    }
  }

  return this;
};


/**
 * Helper Function: Test if all predicates
 * return true. Also works with context
 * dependency-test functions.
 *
 * If predicates/dependency functions array
 * is empty, return true.
 *
 * @param {Array} predicates
 * @param {mixed} context
 */

function validate (predicates, context) {
  for (var i = 0, len = predicates.length ; i < len ; i++) {

    if (!predicates[i].call(context)) {
      return false;
    }

  }

  return true;
}