var should    = require("should");
var Subscribe = require("../lib/subscribe");

describe("Subscribe", function () {

  var Listener  = require("../lib/storage").Listener;
  var eventName = "default-event-name";
  var fn        = function () {};
  var s         = new Subscribe(eventName);

  it("should be a constructor", function () {
    Subscribe.should.be.a.Function;
  });

  it("should have a property ._sub with instance of Listener", function () {
    s.should.have.property("_sub").instanceof(Listener);
  });

  it("should register the event name to listen for as a constructor argument", function () {
    s._sub.eventNames[0].should.equal(eventName);
  });

  describe(".then()", function () {

    it("should add functions to invoke", function () {
      s.then(fn);
      s._sub.logic[0].should.be.equal(fn);
    });

    it("should be chainable", function () {
      s.then(fn).should.be.equal(s);
    });

  });

  describe(".require()", function () {

    it("should add dependency-functions to invoke", function () {
      s.require(fn);
      s._sub.dependencies[0].should.be.equal(fn);
    });

    it("should be chainable", function () {
      s.require(fn).should.be.equal(s);
    });

  });

  describe(".filter()", function () {

    it("should add filter-functions to invoke", function () {
      s.filter(fn);
      s._sub.predicates[0].should.be.equal(fn);
    });

    it("should be chainable", function () {
      s.filter(fn).should.be.equal(s);
    });

  });

});