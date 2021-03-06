Superglue
=========

[![License](https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat)](https://tldrlegal.com/license/mit-license "MIT License")
[![Build](https://img.shields.io/travis/coderaiser/minify/dev.svg?style=flat)](https://travis-ci.org/davidchubbs/superglue)
 [![Dependency Status](https://david-dm.org/davidchubbs/superglue.svg?style=flat)](https://david-dm.org/davidchubbs/superglue)
[![NPM version](https://img.shields.io/npm/v/superglue.svg?style=flat)](https://npmjs.org/package/superglue)

No dependencies.


Description
-----------

Superglue is interested in the organization of your application by promoting loosely coupled components and defining the order of their execution&mdash;or, *application flow*. It is inspired by a few different design patterns and attempts to consolidate some of their benefits. To understand better, see the examples below :)


Installation
------------

Install superglue:

```bash
npm install superglue
```


Documentation
-------------

Superglue *Publishers* are for triggering a **sequence of tasks**, while *Subscribers* are for registering logic to handle that task.

```js
superglue.subscribe("task1").then(function () { /* fired 1st */ });
superglue.subscribe("task2").then(function () { /* fired 2nd */ });

superglue.publish("task1", "task2");
```

As usual, multiple subscribers can be listening to the same task, which are fired one at a time in the order they're registered (due to *context*, explained shortly). Quick note: if they share the same task name, they can be related but should not depend on one another, so order should be irrelevant; if order is significant because they depend on one another, use a separate task name.

```js
// both subscribers listening to the same task,
// so both will be invoked when task is triggered
superglue.subscribe("task").then(...);
superglue.subscribe("task").then(...);
```

Publishers can also fire their own logic at any time during the sequence of tasks.

```js
superglue.publish()
  .events("task1", "task2")
  .then(function () { ... })
  .event("task3");
```

Superglue also allows Publishers to define the *context*, which is then accessible to every Subscriber via `this`. This means updating the context will update the context for subsequent tasks.

```js
superglue.subscribe("build-name").then(function () {
  this.name = this.first + " " + this.last;
});

superglue.publish()
  .context({ first: "Julie", last: "Chubbs" })
  .event("build-name")
  .then(function () {
    console.log(this.name);
  });
//=> "Julie Chubbs"
```

Sometimes you will only want to trigger subscriber logic if the context has a certain state. You can do this using the `.filter()` method. If any functions passed into `.filter()` evaluate to `false`, the subscriber will be skipped (but the task will continue).

```js
superglue.subscribe("build-name")
  .filter(function () {
    return typeof this.first === "string" && typeof this.last === "string";
  })
  .then( /* only triggered if .filter returns true */ );
```

Other times, invoking the subscriber logic will be mandatory but the logic may still depend on the context having a certain state. To require a particular state, use the `.require()` method. If any functions passed into `.require()` evaluate to `false`, a `ContextError` will be generated and the sequence of tasks will be stopped.

```js
superglue.subscribe("build-name")
  .require(function () {
    return typeof this.first === "string" && typeof this.last === "string";
  })
  .then( /* if .require returns false, a ContextError is generated and this function is not invoked */ );
```

Superglue halts the sequence of tasks once an error occurs. Besides the `ContextError`s generated by `.require()` methods, you can also set errors yourself by returning errors (`instanceof Error`) from your Subscriber or Publisher `.then()` methods, at which point, superglue will skip all remaining tasks.

**If you would like to catch and handle errors**, pass in a function with the signature `function (err)` into your publisher's `.then()` method; currently, only Publishers can catch and handle errors.

```js
superglue.subscribe("task1").then(function () {
  return Error("here's what happened...");
});
superglue.subscribe("task2").then(function () {
  // never invoked
});

superglue.publish("task1", "task2")
  .then(function () { /* this one is skipped, since missing `err` argument */ })
  .then(function (err) {
    console.log(err.message);
  });
//=> here's what happened...
```

See [Advanced Error Handling](#advanced-error-handling) for greater error handling control.


### Express Example

Lets look at a more useful example, building on top of *Express*. Notice the convention of namespacing tasks with the `:` character, which by doing so, allows you to use the `.tasks(namespace, [task1, ...])` method.

```js
superglue.subscribe("user:save:validate").then(function () {
  if (!this.body.first || !this.body.last) {
    return Error("First & last names are required");
  }
});
superglue.subscribe("user:save:db").then(function () {
  // add to db
});
superglue.subscribe("user:save:feedback").then(function () {
  this.feedback = this.body.name + " was created successfully!";
});

...

app.post("/user", function (req, res) {

  superglue.publish()
    .context(req)
    .tasks("user:save", ["validate", "db", "feedback"])
    .then(function (err) {
      if (err) {
        res.send(422, err.message);
      } else {
        res.send(this.feedback);
      }
    });

});
```

**By triggering task names, it becomes clearer what your application is actually doing by firing tasks with semantical names; for instance, in the example above we can see that we are using Express' `req` object as the context, then validating & saving the incoming data, and then providing feedback to the user. Furthermore, the pub/sub influence of Superglue keeps your application decoupled and your code DRY. In essence, Superglue glues together your application components while providing a high-level view of how your application works.**

While publishers define the flow of tasks fired, it can be useful to group tasks together on the subscriber side as well.

```js
superglue.group("user:save").tasks("user:save", ["validate", "db", "feedback"]);

...

app.post("/user", function (req, res) {

  superglue.publish()
    .context(req)
    // this fires "user:save:validate", "user:save:db", "user:save:feedback" for you
    .event("user:save")
    .then(...);

});
```


### Advanced Error Handling

Superglue stores error constructors in the `superglue.errors` object. You can add your own error constructors to the `superglue.errors` object directly, or you can use the convenience method `.addError(constructor, [name])`, which adds your error constructor to `superglue.errors`.

When an error occurs, you can check what task created the error using the error's `.failedOn` property.

```js
// SpecialError constructor, extending Error
function SpecialError (msg) {
  Error.call(this, msg);
  ...
}
SpecialError.prototype = Object.create(Error.prototype);

// add SpecialError to superglue.errors
superglue.addError(SpecialError);

superglue.subscribe("build-name")
  .then(function () {
    var SpecialError = superglue.errors.SpecialError;
    if (!this.first || !this.last) {
      return new SpecialError("missing name");
    }
  });

superglue.publish("build-name")
  .then(function (err) {

    // .name - if SpecialError was a "defined function"
    // .failedOn - task name that created the error
    if (err.name === "SpecialError" && err.failedOn === "build-name") {
      // now we have a pretty good idea about what happened...
    }

  });
```

*Please Note: If your constructor does not extend an Error (either as a parent, grandparent, or somewhere along your prototype chain), then it will be ignored when a task returns it.*


API
---

**This section will be fixed soon, as right now it's not very useful.**

### Subscriber API

`superglue.subscribe(task1 [, task2, ...])` creates a fresh subscriber instance listening to whatever task names passed in.

`superglue.subscribe(...).replace` flushes out any susbcribers & groups with the same task names, allowing this subscriber to *replace* the existing subscribers/groups. `.replace` **must** be called immediately after `subscribe()` in order to work properly.

`superglue.subscribe(...).filter(filterFn, ...)` invokes the `filterFn` and if the returned value is truthy, the subscriber's logic is also invoked.

`superglue.subscribe(...).require(reqFn, ...)` invokes the `reqFn` and if the returned value is truthy, the subscriber's logic is invoked; if the returned value is falsy, a `ContextError` is generated and subsequent tasks are not triggered.

`superglue.subscribe(...).then(fn, ...)` invokes the `fn`. If errors are returned, subsequent tasks are not triggered.

`.filter()`, `.require()`, and `.then()` can all be given multiple functions as their arguments.

Even though it is not required (except for `.replace`), it is useful to order method invocation in the same order it is processed internally, which is:

```js
superglue.subscribe("namespace:task")
  .replace  // if needed
  .filter(function () {})
  .require(function () {})
  .then(function () {})
```


### Group-Subscriber API

`superglue.group(groupName1 [, groupName2, ...])` creates a fresh subscriber-group instance listening to whatever group-names are passed in.

`superglue.group(...).replace` is identical to `.subscribe().replace`.

`superglue.group(...).events(name1 [, name2, ...])` will group all event/task names passed in.

`superglue.group(...).event` alias for `.events`.

`superglue.group(...).tasks(namespace, tasks)` will prepend tasks with the namespace and then fire them when the group name is triggered. `tasks` can either be a string if it is a single task name, or an array of task names.

`superglue.group(...).task` alias for `.tasks`.


### Publisher API

`superglue.publish([context, taskName1, ...])` creates a fresh publisher instance. If you pass in an object, it will be set as the context. If you pass in a string, it will be fired as a task name. You can pass in as many contexts and task names as you would like. However, the order is significant&mdash;if you invoke `superglue.publish("task1", {name:"Julie"}, "task2")`, only `task2` had the context with `this.name`, since the context was set after `task1` was triggered.

`superglue.publish().context(cxt)` sets the `cxt` object as the context for subsequent tasks fired. The context can be fired more than once if you desire to change the context for subsequent tasks.

`superglue.publish().events(task1 [, task2, ...])` fires the tasks in the order provided.

`superglue.publish().event` alias for `.events`.

`superglue.publish().tasks(namespace, tasks)` will prepend tasks with the namespace and then fire them. `tasks` can either be a string if it is a single task name, or an array of task names.

`superglue.publish().task` alias for `.tasks`.

Remember that order is important. Tasks are triggered the moment their task-name is received, which means that tasks are fired in the order they are received, and contexts are only available to tasks fired after the context is set.


Road Map
--------

Adding test coverage stats soon. Let me know what else you'd like to see!


Feedback
--------

I would love feedback! Let me know what parts are confusing or what could be improved. Easiest way to discuss it is to submit an issue :)


License
-------

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014 David Chubbuck
