var should    = require("should");
var GroupSubscribe = require("../lib/group");

describe("GroupSubscribe", function () {

  var GroupListener  = require("../lib/storage").GroupListener;
  var eventName      = "default-group-name";
  var g              = new GroupSubscribe(eventName);

  it("should be a constructor", function () {
    GroupSubscribe.should.be.a.Function;
  });

  it("should have a property ._group with instance of GroupListener", function () {
    g.should.have.property("_group").instanceof(GroupListener);
  });

  it("should register the event name to listen for as a constructor argument", function () {
    g._group.eventNames[0].should.equal(eventName);
  });

  describe(".events()", function () {
    it("should add event-name(s) to be fired", function () {
      var test = new GroupSubscribe(eventName)
      test.events("name1")._group.fire.should.containEql("name1");
      test.events("name2", "name3")._group.fire.should.containDeep(["name1", "name2", "name3"]);
    });

    it("should be chainable", function () {
      g.events().should.be.equal(g);
    });
  });

  describe(".event()", function () {
    it("should be an alias of .events()", function () {
      g.event.should.equal(g.events);
    });
  });

  describe(".tasks()", function () {
    it("should put together the right event name & add it", function () {
      new GroupSubscribe(eventName)
        .tasks("event", ["task", "last"])
        ._group.fire.should.containDeep(["event:task", "event:last"]);
    });

    it("should accept a string as an array alternative", function () {
      new GroupSubscribe(eventName)
        .tasks("event", "task")
        ._group.fire.should.containEql("event:task");
    });

    it("should allow tasks to contain colons", function () {
      new GroupSubscribe(eventName)
        .tasks("event", "task:subtask")
        ._group.fire.should.containEql("event:task:subtask");
    });

    it("should ignore ':' in tasks if character [0]", function () {
      new GroupSubscribe(eventName)
        .tasks("event", [":first", ":task"])
        ._group.fire.should.containDeep(["event:first", "event:task"]);
    });

    it("should be chainable", function () {
      g.events().should.be.equal(g);
    });
  });

  describe(".task()", function () {
    it("should be an alias of .tasks()", function () {
      g.task.should.equal(g.tasks);
    });
  });

});