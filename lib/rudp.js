var net = require('dgram');
var MessageControl = require('./messageControl');
var util = require('./util');

(function(globalenv) {

	function RUDPServer() {
		this.connection = net.createSocket("udp4");	
	}

	RUDPServer.prototype.listen = function(port, address, callback) {
		this.connection.bind(port, address, callback);
	}

	function RUDP() {
		this.messagesPendingAck = [];
		this.messageControl = new MessageControl();
	}

	RUDP.prototype.createServer = function (callback) {
		callback = callback || util.noop;
		var rudpServer = new RUDPServer();
		
		rudpServer.connection.on("message", function (msg, rinfo) {
		  var seqNo = msg.readUInt32BE(0, true);
		  var msg = msg.toString("utf-8", 4);
		  this.messageControl.sendACK(rudpServer.connection, rinfo.address, rinfo.port, seqNo, callback(msg));
		}.bind(this));

		return rudpServer;
	}

	RUDP.prototype.send = function (address, port, message, callback) {
		this.messageControl.send(message, address, port, callback);
	}

	// Expose API
	module.exports = new RUDP();

})(this);
