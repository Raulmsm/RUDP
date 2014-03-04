net = require('net');
 
var BENCHMARK_PORT = 8080;

var totalRequestsReceived = 0;

function StartTCPBenchmarkServer() {
	var server = net.createServer(function(socket) { //'connection' listener
		socket.on('data', function(data) {
			totalRequestsReceived++;
		});
  	});

	server.listen(BENCHMARK_PORT);
}

function SendNonStop(client) {
	if (!client) { 
		var client = net.connect({port: BENCHMARK_PORT}, function() {
	  		client.write('test');
		});

		client.on('data', function(data) {

		});
	} 
	else {
		client.write('test');
	}

	setImmediate(function() {
		SendNonStop(client);
	});
}

function main() {
	StartTCPBenchmarkServer();
	setInterval(function () {
		console.log(totalRequestsReceived);
		totalRequestsReceived = 0;
	}, 1000); 

	SendNonStop();
}

main();
