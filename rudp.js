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
	  // process message
	  console.log("Got a message");
	});

	server.on("listening", callback);

	server.bind(port);

}

RUDP.prototype.send = function (address, port, message, callback) {
	console.log("Sending Message");
	this.messageControl.send(message, address, port, callback); 
}

function main() {
	var protocol = new RUDP();
	protocol.listen(8080);

	var sender = new RUDP();
	sender.send("localhost", 8080, "teste", function() {
		console.log("Message arrived!");
	});
}

main();