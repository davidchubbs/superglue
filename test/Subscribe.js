var should    = require("should"),
    Subscribe = require("../lib/Subscribe");

describe("Subscribe", function () {

  var storage   = require("../lib/storage"),
      Listener  = storage.Listener,
      eventName = "default-event-name",
      fn        = function () {},
      s         = new Subscribe(eventName);

  it("should be a constructor", function () {
    Subscribe.should.be.a.Function;
  });

  it("should have a property ._sub with instance of Listener", function () {
    s.should.have.property("_sub").instanceof(Listener);
  });

  it("should register the event name to listen for as a constructor argument", function () {
    s._sub.eventNames[0].should.equal(eventName);
  });

  describe(".replace", function () {
    it("should flush all pre-existing listeners & groups with the same event-names", function () {
      var flushName = "flush:subscribe:test",
          test;

      new Subscribe(flushName).then(fn);
      new Subscribe(flushName).then(fn);

      storage.match(flushName).should.have.length(2);
      test = new Subscribe(flushName).replace;
      storage.match(flushName).should.have.length(0);
      test.then(fn);
      storage.match(flushName).should.have.length(1);
    });
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