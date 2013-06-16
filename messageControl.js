var SeqNo = require('./seqno');
var udp = require('dgram');

(function(globalenv) {
	var PACKET_HEADER_SIZE = 4;
	var RESEND_TIME_WINDOW = 50;
	var ACK_PORT = 16407;
	var ACKED = 0; 

	var seqManager = new SeqNo();
	var highestAckedPosition = 0;
	var messagesPendingAck = [];

	function noop() {

	}

	function MessageControl() {
		
	}

	function createRUDPPacket(message) {
		var msgSize = Buffer.byteLength(message, 'utf8');
		var seqno = seqManager.genSeqNo();
		var packet = new Buffer(PACKET_HEADER_SIZE + msgSize);

		packet.writeUInt32BE(seqno, 0, true);
		packet.write(message, PACKET_HEADER_SIZE, msgSize);
		return packet;
	}

	function ackReceived(socket, seqNo) {
		if (isMessageWaitingAck(seqNo)) {
			socket.close();
			var msgCallback = messagesPendingAck[seqNo];
			messagesPendingAck[seqNo] = ACKED;

			if (seqNo === highestAckedPosition + 1) {
				highestAckedPosition = seqNo;
			}

			msgCallback();
		}
	}

	function waitForACK(socket) {
		socket.addListener("message", function (msg, rinfo) {
		    ackReceived(socket, msg.readUInt32BE(0, true));
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

	MessageControl.prototype.sendACK = function(socket, address, port, seqno, callback) { 
		var ack = seqno;
		var response = new Buffer(4);
		response.writeUInt32BE(ack, 0, true);
		socket.send(response, 0, response.length, port, address, callback);
	}

	MessageControl.prototype.send = function(message, address, port, callback) {
		var rudpMessage = createRUDPPacket(message);
		var seqNo = seqManager.getLastSeqNo();

		messagesPendingAck[seqNo] = callback || noop;

		ensureDelivery(seqNo, rudpMessage, address, port);
	}

	// Expose API
	module.exports = MessageControl;

})(this);
