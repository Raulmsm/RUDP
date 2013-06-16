var MAX_SEQ_NO = 0x100000000;

function SeqNo() {
	this.currentSeqNo = 0;	
}

SeqNo.prototype.getLastSeqNo = function () {
	return this.currentSeqNo - 1;
}

SeqNo.prototype.genSeqNo = function() {
	return this.currentSeqNo++ % MAX_SEQ_NO;
}

module.exports = SeqNo;

