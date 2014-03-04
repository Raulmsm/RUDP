var net = require('dgram');
var events = require('events');
var util = require('util');

var MessageControl = require('./messageControl');
var common = require('./common');

(function(globalenv) {

	function RUDPServer() {
		this.messageControl = new MessageControl();		
		this.connection = net.createSocket("udp4");	

		this.connection.on("message", function (msg, rinfo) {
		  var seqNo = msg.readUInt32BE(0, true);
		  var msg = msg.toString("utf-8", 4);
		  this.emit("message", msg);
		  this.messageControl.sendACK(this.connection, rinfo.address, rinfo.port, seqNo, common.noop);
		}.bind(this));
	}

	util.inherits(RUDPServer, events.EventEmitter);

	RUDPServer.prototype.listen = function(port, address, callback) {
		this.connection.bind(port, address, callback);
	}

	function RUDP() {
		this.messagesPendingAck = [];
		this.messageControl = new MessageControl();
	}

	RUDP.prototype.createServer = function (callback) {
		callback = callback || common.noop;
		var rudpServer = new RUDPServer();
		
		rudpServer.on("message", callback);

		return rudpServer;
	}

	RUDP.prototype.send = function (address, port, message, callback) {
		this.messageControl.send(message, address, port, callback);
	}

	// Expose API
	module.exports = new RUDP();

})(this);
