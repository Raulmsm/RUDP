var rudp = require("../lib/rudp");

/**
* Measure how fast can this machine send RUDP requests through a single connection.
*/

var BENCHMARK_PORT = 8080;

var totalRequestsReceived = 0;

function StartRUDPBenchmarkServer() {
	var rudpServer = rudp.createServer(function(msg)  {
		totalRequestsReceived++;
	}); 

	rudpServer.listen(BENCHMARK_PORT);
}

function SendNonStop() {
	var req = rudp.send('127.0.01', BENCHMARK_PORT, 'test'); 

	setImmediate(SendNonStop);
}

function main() {
	StartRUDPBenchmarkServer();
	setInterval(function () {
		console.log(totalRequestsReceived);
		totalRequestsReceived = 0;
	}, 1000); 

	SendNonStop();
}

main();