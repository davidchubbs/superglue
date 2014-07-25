var should    = require("should");
var index     = require("../lib");
var Publish   = require("../lib/publish");
var Subscribe = require("../lib/subscribe");
var Group     = require("../lib/group");

describe("lib/index", function () {
  describe(".errors", function () {
    it("should be an object of error constructors", function () {
      index.errors.should.be.Object;
      index.errors.ContextError.should.be.Function;
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