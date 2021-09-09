var should = require("should")
var helper = require("node-red-node-test-helper");
var receiveMessageNode = require("../receive-message");

helper.init(require.resolve('node-red'));

describe('receive-message Node', function () {
  this.beforeEach(function (done) {
    helper.startServer(done);
  });

  afterEach(function (done) {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "receive-message-topic", name: "test name" }];
    helper.load(receiveMessageNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'test name');
      done();
    });
  });  
});