var http = require("http");

/**
* Measure how fast can this machine perform HTTP transactions through a single connection.
*/

var BENCHMARK_PORT = 8080;

var totalRequestsReceived = 0;
http.globalAgent.maxSockets = 1;

function StartHTTPBenchmarkServer() {
	var httpServer = http.createServer(function (req, res) {
		totalRequestsReceived++;
		res.writeHead(200);
		res.end();
	}); 

	httpServer.listen(BENCHMARK_PORT);
}

function SendNonStop() {
	var options = {
		host: '127.0.0.1',
		path: '/',
		method: 'POST',
		port: BENCHMARK_PORT
	};

	var req = http.request(options, function(res) {
		res.on('data', function (chunk) {
    		
  		});

  		res.on('end', function () {
  			SendNonStop();
  		});		
	});

	req.end('test');
}

function main() {
	StartHTTPBenchmarkServer();
	setInterval(function () {
		console.log(totalRequestsReceived);
		totalRequestsReceived = 0;
	}, 1000); 

	SendNonStop();
}

main();