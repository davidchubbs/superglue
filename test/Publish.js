var should       = require("should"),
    Publish      = require("../lib/Publish"),
    subscribe    = require("../lib").subscribe,
    ContextError = require("../lib/errors/ContextError");

describe("Publish", function () {

  var p         = new Publish();
  var eventName = "default";
  var fn        = function () {};
  function Context () {
    // :simple
    this.counter = 0;
    // :predicates
    this.filter  = 0;
    this.then    = 0;
    this.fail    = false;
    // :dependencies
    this.depend  = true;
    this.test    = 0;
    this.pass    = true;
    this.continued = false;
  }

  /*
   * Lets you test how firing occurs
   */
  subscribe(eventName + ":simple")
    .then(function () {
      this.counter++;
    });
  subscribe(eventName).then(function () { this.then++; });
  subscribe(eventName).then(function () { this.then++; });
  subscribe(eventName + ":predicates")
    .filter(function () {
      this.filter++;
      return true;
    })
    .filter(function () {
      this.filter++;
      return this.fail !== true;
    })
    .then(function () {
      this.then++;
    });
  subscribe(eventName + ":predicates")
    .then(function () {
      //this makes sure that the subscriber above only skips and not stops
      this.then++;
    });
  subscribe(eventName + ":dependencies")
    .filter(function () {
      return this.pass;
    })
    .require(function () {
      this.test++;
      return "depend" in this;
    })
    .require(function () {
      this.test++;
      return true;
    })
    .then(function () {
      this.then++;
    });
  subscribe(eventName + ":dependencies")
    .then(function () {
      // make sure this isn't called when error is already set
      this.continued = true;
    });
  subscribe(eventName + ":task")
    .then(function () {
      this.counter++;
    });
  subscribe(eventName + ":1")
    .then(function () {
      this.counter++;
    });
  subscribe(eventName + ":task:subtask")
    .then(function () {
      this.counter++;
    });
  subscribe(eventName + ":error")
    .then(function () {
      this.counter++;
      return Error("msg");
    });


  it("should be a function", function () {
    Publish.should.be.a.Function;
  });

  it("should have ._cxt & ._err property", function () {
    p.should.have.properties("_cxt", "_err");
    (p._cxt === null).should.be.true;
    (p._err === null).should.be.true;
  });

  it("should allow you to set ._cxt and fire events upon construction", function () {
    var cxt = new Context(),
        oneOfEach,
        twoEvents;

    oneOfEach = new Publish([cxt, eventName + ":simple"])
    oneOfEach._cxt.should.equal(cxt);
    oneOfEach._cxt.counter.should.equal(1);

    twoEvents = new Publish([cxt, eventName + ":simple", eventName + ":simple"]);
    twoEvents._cxt.should.equal(cxt);
    twoEvents._cxt.counter.should.equal(3);
  });

  describe(".context()", function () {
    var cxt = new Context();
    var p   = new Publish().context(cxt);
    
    it("should set the ._cxt property", function () {
      p._cxt.should.be.equal(cxt);
    });

    it("should be chainable", function () {
      p.context(cxt).should.be.equal(p);
    });
  });

  describe(".event()", function () {
    it("should be an alias of .events()", function () {
      p.event.should.equal(p.events);
    });
  });

  describe(".events()", function () {

    var test;

    it("should be chainable", function () {
      p.events().should.be.equal(p);
    });

    it("should extract matching subscribers && invoke logic-functions", function () {
      new Publish()
        .context(new Context())
        .events(eventName)
        ._cxt.then.should.equal(2);
    });

    it("should invoke predicates", function () {
      test = new Publish()
        .context(new Context())
        .events(eventName + ":predicates")

      test._cxt.filter.should.equal(2);
    });

    it("should invoke the subscriber logic-functions when predicates return true", function () {
      test._cxt.then.should.equal(2);
    });

    it("should skip the subscriber when a predicate returns false", function () {
      var cxt = new Context();
      cxt.fail = true;

      new Publish()
        .context(cxt)
        .events(eventName + ":predicates")
        ._cxt.then.should.equal(1);
    });

    it("should invoke dependencies", function () {
      new Publish()
        .context(new Context())
        .events(eventName + ":dependencies")
        ._cxt.test.should.equal(2);
    });

    it("should not invoke dependencies if predicates return false", function () {
      var cxt = new Context();
      cxt.pass = false;

      new Publish()
        .context(cxt)
        .events(eventName + ":dependencies")
        ._cxt.test.should.equal(0);
    });

    it("should set an error & stop when dependency returns false", function () {
      var cxt = new Context();
      delete cxt.depend;

      test = new Publish()
              .context(cxt)
              .events(eventName + ":dependencies");
      
      test._cxt.test.should.equal(1);
      test._cxt.then.should.equal(0);
      test._err.should.be.Object;
    });

    it("should return a ContextError when a dependency fails", function () {
      test._err.should.be.instanceof(ContextError);
    });

    it("should not invoke future subscribers when error is set", function () {
      test._cxt.continued.should.be.false;
    });
    
    it("should set the error & stop subscribers when error is returned", function () {
      test = new Publish()
              .context(new Context())
              .events(eventName + ":simple", eventName + ":error", eventName + ":simple");

      test._cxt.counter.should.equal(2);
      test._err.should.be.instanceOf(Error);
    });

  });

  describe(".task()", function () {
    it("should be an alias of .tasks()", function () {
      p.task.should.equal(p.tasks);
    });
  });

  describe(".tasks()", function () {
    it("should be chainable", function () {
      p.tasks().should.be.equal(p);
    });

    it("should put together the right event name & invoke it", function () {
      new Publish()
        .context(new Context())
        .tasks(eventName, ["simple", "task"])
        ._cxt.counter.should.equal(2);
    });

    it("should accept a string as an array alternative", function () {
      new Publish()
        .context(new Context())
        .tasks(eventName, "simple")
        ._cxt.counter.should.equal(1);
    });

    it("should allow tasks to contain colons", function () {
      new Publish()
        .context(new Context())
        .tasks(eventName, "task:subtask")
        ._cxt.counter.should.equal(1);
    });

    it("should ignore ':' in tasks if character [0]", function () {
      new Publish()
        .context(new Context())
        .tasks(eventName, [":simple", ":task"])
        ._cxt.counter.should.equal(2);
    });
  });

  describe(".then()", function () {
    it("should invoke functions given, with context", function () {
      new Publish()
        .context(new Context())
        .then(function () {
          this.counter++;
        })
        ._cxt.counter.should.equal(1);
    });

    it("should have the ability to accept multiple functions", function () {
      new Publish()
        .context(new Context())
        .then(function () {
          this.counter++;
        },
        function () {
          this.counter++;
        })
        ._cxt.counter.should.equal(2);
    });

    it("should set the error when an error is returned", function () {
      new Publish().then(function () {
        return Error("msg");
      })._err.should.be.instanceOf(Error);
    });

    it("should invoke only functions that expect an error if an error has already been set", function () {
      new Publish()
        .context(new Context())
        .events(eventName + ":error")
        .then(function () {
          this.counter++;
        })
        .then(function (err) {
          this.counter++;
        })
        ._cxt.counter.should.equal(2);
    });

    it("should allow the error message to be reset if a new error is returned", function () {
      var e = new Error("msg");

      new Publish()
        .context(new Context())
        .events(eventName + ":error")
        .then(function (err) {
          // return new error
          return e;
        },
        function (err) {
          err.should.equal(e);
        });
    });
  });


});