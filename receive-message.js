var azure = require("azure-sb");

module.exports = function (RED) {
  function ReceiveMessage(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    var d = new Date().toISOString();

    var serviceBusService = azure.createServiceBusService(
      config.connectionString
    );

    var state = { isClosed: false };

    node.on("close", function (done) {
      state.isClosed = true;
      done();
    });

    var checkForMessage = function () {
      if (state.isClosed) {
        return;
      }

      serviceBusService.receiveSubscriptionMessage(
        config.topic,
        config.subscription,
        { timeoutIntervalInS: 180 },
        function (error, receivedMessage) {
          if (error) {
            if (error == "No messages to receive") {
              node.status({ fill: "green", shape: "dot", text: "connected" });
              checkForMessage();
            } else {
              node.error(error);
              node.status({
                fill: "red",
                shape: "ring",
                text: "error, see debug or output",
              });

              setTimeout(checkForMessage, 60000);
            }
          } else {
            var msg = receivedMessage;
            var enqueueTime = new Date(
              receivedMessage.brokerProperties.EnqueuedTimeUtc
            );
            receivedMessage.brokerProperties.EnqueuedTimeUtc = enqueueTime;

            try {
              msg = JSON.parse(msg);
            } catch (err) {}

            node.status({ fill: "blue", shape: "ring", text: "got a message" });

            node.send(msg);

            setTimeout(() => {
              node.status({ fill: "green", shape: "dot", text: "connected" });
            }, 2000);

            checkForMessage();
          }
        }
      );
    };

    if (!node.listen) {
      node.listen = true;
      checkForMessage();
    }
  }
  RED.nodes.registerType("receive-message-topic", ReceiveMessage);
};
