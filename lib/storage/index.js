/*
 * Subscriber Storage
 * ==================
 *
 * The primary responsibility of this module is to
 * expose methods for working with event-listeners
 * and event-listener-groups.
 */

module.exports = {
  match         : match,
  Listener      : Listener,
  GroupListener : GroupListener,
  /*
   * for tests
   */
  _listeners    : function () {
    return listeners;
  },
  _groups       : function () {
    return groups;
  }
};


/*
 * Storage of event-listeners & event-groups
 */

var listeners = [];
var groups = [];


/**
 * Search for event-listeners containing the
 * event names that match a given event name.
 *
 * @param {String} name
 * @return {Array} results
 */

function match (name) {
  var results;

  results = listeners.filter(function (listener) {
    return listener.eventNames.indexOf(name) !== -1;
  });

  // search for groups with event-name matching `name`
  for (var i = 0 , len = groups.length, group ; i < len ; i++ ) {
    group = groups[i];
    if (group.eventNames.indexOf(name) !== -1) {

      // recursively call .match on each .fire event-names
      for (var j = 0 , jlen = group.fire.length ; j < jlen ; j++) {
        results = results.concat( match( group.fire[j] ) );
      }

    }
  }

  return results;
}


////////////////////////////////////////////////////////////////////////
//                        Listener Constructor                        //
////////////////////////////////////////////////////////////////////////
/*
 * When enough listener components (predicates, dependencies, logic)
 * are added to make a valid event listener, then the event listener
 * instance is added to the `listeners` array and updated anytime the
 * instance changes.
 */

function Listener () {
  this._id          = null;
  this.eventNames   = [];
  this.predicates   = [];
  this.dependencies = [];
  this.logic        = [];
}

Listener.prototype = Object.create(ParentListener.prototype);


/**
 * Add event-listener logic
 *
 * @method addLogic
 * @param {Function} fn
 * @chainable
 */

Listener.prototype.addLogic = function (fn) {
  if (typeof fn === "function") {
    this.logic.push(fn);
    this._persist();
  }
  return this;
};


/**
 * Add event-listener predicate
 *
 * @method addPredicate
 * @param {Function} predicate
 * @chainable
 */

Listener.prototype.addPredicate = function (predicate) {
  if (typeof predicate === "function") {
    this.predicates.push(predicate);
    this._persist();
  }
  return this;
};


/**
 * Add event-listener dependency
 *
 * @method addDependency
 * @param {Function} dependency
 * @chainable
 */

Listener.prototype.addDependency = function (dependency) {
  if (typeof dependency === "function") {
    this.dependencies.push(dependency);
    this._persist();
  }
  return this;
};


Listener.prototype._persist = persist(listeners, ["eventNames", "logic"]);


////////////////////////////////////////////////////////////////////////
//                     Group Listener Constructor                     //
////////////////////////////////////////////////////////////////////////
/*
 * Similar to event-listeners, when enough components are registered, the
 * group listener instance is saved. When the instance is updated, the
 * instance stored will also be updated.
 */

function GroupListener () {
  this._id          = null;
  this.eventNames   = [];
  this.fire         = [];
}

GroupListener.prototype = Object.create(ParentListener.prototype);


/**
 * Add event-names as those needing to be fired
 *
 * @method addFire
 * @param {String} name
 * @chainable
 */

GroupListener.prototype.addFire = function (name) {
  if (typeof name === "string" && name) {
    this.fire.push(name);
    this._persist();
  }
  return this;
};


GroupListener.prototype._persist = persist(groups, ["eventNames", "fire"]);


////////////////////////////////////////////////////////////////////////
//                     Parent Listener Constructor                    //
////////////////////////////////////////////////////////////////////////
/*
 * There are enough similarities between Listener instances and
 * GroupListener instances to warrant the use of a parent constructor.
 */

function ParentListener () {}


/**
 * Test whether the [group] listener has had enough required
 * components added to be registered in `listeners` or `groups` array.
 *
 * @method isSaved
 * @public
 * @return {Boolean} test
 */

ParentListener.prototype.isSaved = function () {
  return this._id !== null;
};


/**
 * Add event-listener name
 *
 * @method addEventName
 * @param {String} name
 * @chainable
 */

ParentListener.prototype.addEventName = function (name) {
  if (typeof name === "string" && name) {
    this.eventNames.push(name);
    this._persist();
  }
  return this;
};


/**
 * If the instance has already been pushed into `storage`,
 * update the instance with the new state. Else, check
 * if all the required components are there and if so,
 * push instance into `storage`.
 *
 * Closure allows us to bind variables to the returning
 * function, perfect for class methods not having to
 * require parameters.
 */

function persist (storage, required) {
  // anticipated that required fields will be an array or string
  var testEach = function (field) {
    return this[field].length > 0;
  };

  return function () {
    if (this.isSaved()) {
      storage[this._id] = this;
    } else if (required.every(testEach, this)) {
      this._id = storage.push(this) - 1;
      storage[this._id]._id = this._id;
    }
  };
}