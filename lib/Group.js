/*
 * Group Subscribe Facade
 * ======================
 */

module.exports = GroupSubscribe;


/*
 * Internal subscriber constructor
 */

var storage       = require("./storage"),
    GroupListener = storage.GroupListener;


/*
 * Public GroupSubscribe constructor
 *
 * @constructor
 * @param {String|Array} eventNames - event names to listen for
 */

function GroupSubscribe (eventNames) {
  this._group = new GroupListener();

  if (typeof eventNames === "string") {
    this._group.addEventName(eventNames);
  } else if (Array.isArray(eventNames)) {
    for (var i = 0, len = eventNames.length; i < len; i++) {
      this._group.addEventName(eventNames[i]);
    }
  }
}


/**
 * Listeners & Groups with the same event-name
 * will be replaced with this group.
 *
 * Must be called immediately after constructor!!
 *
 * @property replace
 * @example
 *   group("event-name").replace.events(...)
 * @chainable
 */

Object.defineProperty(GroupSubscribe.prototype, "replace", {
  get: function () {
    for (var i=0, len = this._group.eventNames.length; i < len; i++) {
      storage.flush(this._group.eventNames[i]);
    }
    return this;
  }
});


/*
 * Assign events to be fired (in order) when group
 * event is triggered.
 *
 * @method events
 * @param {String} name - event name; can pass in multiple
 * @chainable
 */

GroupSubscribe.prototype.events = function () {
  for (var i = 0, len = arguments.length, name; i < len; i++) {
    name = arguments[i];
    if (typeof name === "string" && name) {
      this._group.addFire(name);
    }
  }

  return this;
};


/*
 * Alias for .events
 */

GroupSubscribe.prototype.event = GroupSubscribe.prototype.events;


/*
 * Assign task-events to be fired (in order) when group
 * event is triggered
 *
 * @example
 *   // intended use
 *   .tasks("event", ["task1", "task2"]);
 *   // also will work
 *   .tasks("event", "task");
 *   .tasks("event", ":task");
 *
 * @method tasks
 * @param {String} prefix - event name's prefix
 * @param {Array|String} task - can be string if just 1 task
 * @chainable
 */

GroupSubscribe.prototype.tasks = function (eventName, tasks) {
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


/*
 * Alias for .tasks
 */

GroupSubscribe.prototype.task = GroupSubscribe.prototype.tasks;