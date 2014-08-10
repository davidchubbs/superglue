var should    = require("should"),
    index     = require("../lib"),
    Publish   = require("../lib/Publish"),
    Subscribe = require("../lib/Subscribe"),
    Group     = require("../lib/Group");

describe("lib/index", function () {
  describe(".errors", function () {
    it("should be an object of error constructors", function () {
      index.errors.should.be.Object;
      index.errors.ContextError.should.be.Function;
    });
  });

  describe(".addError", function () {
    it("should exist and be a function", function () {
      index.addError.should.be.a.Function;
    });

    it("should not add to .errors if defined function not given or if anonymous function given without a name", function () {
      var startLen = Object.keys(index.errors).length;

      index.addError("StringArg");
      index.addError(function () {});

      Object.keys(index.errors).should.have.length(startLen);
    });

    it("should add the constructor to .errors if defined function", function () {
      function DefinedName () {}
      index.addError(DefinedName);
      index.errors["DefinedName"].should.be.a.Function.and.equal(DefinedName);
    });

    it("should allow an anonymous function if given a name", function () {
      index.addError(function () {}, "HardName");
      index.errors["HardName"].should.be.a.Function;
    });

    it("should overwrite the name of a defined function if provided one", function () {
      function DefinedFunc () {}
      index.addError(DefinedFunc, "BetterName");
      index.errors["BetterName"].should.equal(DefinedFunc);
    });
  });

  describe(".subscribe", function () {
    it("should return a new instance of Subscribe", function () {
      index.subscribe().should.be.instanceOf(Subscribe);
    });
    it("should pass on arguments to Subscribe", function () {
      index.subscribe("event:1", "event:2")._sub.eventNames.should.containDeep(["event:1", "event:2"]);
    });
  });

  describe(".group", function () {
    it("should return a new instance of GroupSubscribe", function () {
      index.group().should.be.instanceOf(Group);
    });
    it("should pass on arguments to GroupSubscribe", function () {
      index.group("event:1", "event:2")._group.eventNames.should.containDeep(["event:1", "event:2"]);
    });
  });

  describe(".publish", function () {
    it("should return a new instance of Publish", function () {
      index.publish().should.be.instanceOf(Publish);
    });
    it("should pass on arguments to Publish", function () {
      var name  = "event",
          cxt   = {count:0},
          count = 0,
          pub;
      
      index.subscribe(name).then(function () {
        // how many times the function has been invoked
        count++;
        // how many times the function has been invoked with a context
        if (typeof this.count === "number") {
          this.count++;
        }
      });
      
      pub = index.publish(name, cxt, name);

      count.should.equal(2);
      pub._cxt.count.should.equal(1);
    });
  });
});