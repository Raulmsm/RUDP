var SeqNo = require('./seqno');
var udp = require('dgram');

(function(globalenv) {
	var ACK_PORT = 16407;
	var ACKED = 0; 
	var RESEND_TIME_WINDOW = 5000;

	var seqManager = new SeqNo();
	var highestAckedPosition = 0;
	var messagesPendingAck = [];

	function noop() {

	}

	function MessageControl() {
		
	}

	function addRUDPheaders(message) { 
		return JSON.stringify({
			seqno : seqManager.genSeqNo(),
			data : message 
		});
	}

	function ackReceived(seqNo) {
		var msgCallback = messagesPendingAck[seqNo];
		messagesPendingAck[seqNo] = ACKED;

		if (seqNo === highestAckedPosition + 1) {
			highestAckedPosition = seqNo;
		}

		msgCallback();
	}

	function waitForACK(socket) {
		socket.addListener("message", function (msg, rinfo) {
		    ackReceived(JSON.parse(msg.toString()).seqno);
		});
	}

	function isMessageWaitingAck(seqNo) {
		return messagesPendingAck[seqNo] !== ACKED; 
	}

	function ensureDelivery(seqNo, bufferedMessage, address, port, socket) {
		if (isMessageWaitingAck(seqNo)) {
			if (!socket) {
				socket = udp.createSocket("udp4");
				waitForACK(socket);
			}

			socket.send(bufferedMessage, 0, bufferedMessage.length, port, address, function () {
				setTimeout(function() {
					ensureDelivery(seqNo, bufferedMessage, address, port, socket);
				}, RESEND_TIME_WINDOW);
			});
		}
	}

	MessageControl.prototype.send = function(message, address, port, callback) {
		var rudpMessage = addRUDPheaders(message);
		var bufferedMessage = new Buffer(rudpMessage);
		var seqNo = seqManager.getLastSeqNo();

		messagesPendingAck[seqNo] = callback || noop;

		ensureDelivery(seqNo, bufferedMessage, address, port);
	}

	// Expose API
	module.exports = MessageControl;

})(this);