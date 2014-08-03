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
    var errorName = "TestError",
        onlyName  = "BadError",
        protoName = "ProtoErrorTest",
        ErrClass  = function () {},
        test;

    index.addError(errorName, ErrClass);
    index.addError(onlyName);
    index.addError(protoName, ErrClass, index.errors.ContextError);
    test = new index.errors[protoName]("default message");

    it("should exist and be a function", function () {
      index.addError.should.be.a.Function;
    });

    it("should not add to .errors if function not given", function () {
      (typeof index.errors[onlyName] === "undefined").should.be.true;
    });

    it("should add the constructor to .errors", function () {
      index.errors[errorName].should.be.a.Function;
    });

    it("should extend the prototype constructor if given one", function () {
      test.should.be.instanceof( index.errors.ContextError );
      test.should.be.instanceof( ErrClass );
    });

    it("should add .type to specify it's constructor's name", function () {
      test.type.should.be.equal(protoName);
    });

    it("should add .failedOn property, initially set to null", function () {
      (test.failedOn === null).should.be.true;
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