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
	  var seqNo = msg.readUInt32BE(0, true);
	  var msg = msg.toString("utf-8", 4);
	  this.messageControl.sendACK(server, rinfo.address, rinfo.port, seqNo, callback);
	}.bind(this));

	// server.on("listening");

	server.bind(port);

}

RUDP.prototype.send = function (address, port, message, callback) {
	this.messageControl.send(message, address, port, callback);
}


function sendMessage() {
	var sender = new RUDP();
	sender.send("127.0.0.1", 8080, "test", function() {		
		sendMessage();
	});
}