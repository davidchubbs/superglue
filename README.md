Superglue
=========

[![Build](https://travis-ci.org/davidchubbs/superglue.png)](https://travis-ci.org/davidchubbs/superglue)

No dependencies.


**Superglue is inspired by a few different design patterns and attempts to consolidate some of their benefits.** Read the examples to learn more...


Quick Start
-----------

Subscribe logic to an event-name:

```js
superglue.subscribe("event-name").then(function () {
  // do something
});
```

Now you can trigger the event using:

```js
superglue.publish("event-name");
// or
superglue.publish().event("event-name");
```

##### Publishers can provide subscribers context

To give context to your subscribers:

```js
superglue.subscriber("event-name").then(function () {
  // context is bound to `this`
  this.name = this.first + " " + this.last;
});

superglue.publish({first: "Julie", last: "Chubbs"}, "event-name");
// or
superglue.publish()
  .context({first: "Julie", last: "Chubbs"})
  .event("event-name");
```

If your subscribers depend on elements of the context to exist, you can say so:

```js
superglue.subscriber("event-name")
  .require(function () {
    return "first" in this && "last" in this;
  })
  .then(...);
```

##### Errors can be used to halt event-execution

If the `.require`'s function returns false, a `ContextError` is thrown.


Feedback
--------

I would love feedback! Let me know what parts are confusing or what could be improved. Easiest way to discuss it is to submit an issue :)


License
-------

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014 David Chubbuck