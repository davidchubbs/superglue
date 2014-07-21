var should    = require("should");
var Subscribe = require("../lib/subscribe");
var Listener  = require("../lib/storage").Listener;
var eventName = "default-event-name";
var fn        = function () {};

describe("Subscribe", function () {

  var s = new Subscribe(eventName);

  it("should be a constructor", function () {
    Subscribe.should.be.a.Function;
  });

  it("should have a property .sub with instance of Listener", function () {
    s.should.have.property("sub").instanceof(Listener);
  });

  describe(".then()", function () {

    it("should add functions to invoke", function () {
      s.then(fn);
      s.sub.logic[0].should.be.equal(fn);
    });

    it("should be chainable", function () {
      s.then(fn).should.be.equal(s);
    });

  });

  describe(".require()", function () {

    it("should add dependency-functions to invoke", function () {
      s.require(fn);
      s.sub.dependencies[0].should.be.equal(fn);
    });

    it("should be chainable", function () {
      s.require(fn).should.be.equal(s);
    });

  });

  describe(".filter()", function () {

    it("should add filter-functions to invoke", function () {
      s.filter(fn);
      s.sub.predicates[0].should.be.equal(fn);
    });

    it("should be chainable", function () {
      s.filter(fn).should.be.equal(s);
    });

  });

});