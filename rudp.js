var net = require('dgram');
var MessageControl = require('./messageControl');

function RUDP() {
	this.messagesPendingAck = [];
	this.messageControl = new MessageControl();
}

RUDP.prototype.listen = function (port, callback) {
	callback = callback || function() {};

	var server = net.createSocket("udp4");

	server.on("message", function (msg, rinfo) {
	  var seqNo = JSON.parse(msg.toString());
	  var source = rinfo.address;
	  var port = rinfo.port;
	  var ack = JSON.stringify({
	  	seqno : seqNo.seqno
	  });
	  var response = new Buffer(ack);
	  server.send(response, 0, response.length, port, source, function () {
	  });
	});

	server.on("listening", callback);

	server.bind(port);

}

RUDP.prototype.send = function (address, port, message, callback) {
	this.messageControl.send(message, address, port, callback);
}