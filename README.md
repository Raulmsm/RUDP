RUDP
====

## Description

RUDP is a javascript implementation of "reliable" UDP for node.js. It aims to provide a solution where UDP is too primitive because realiable packet delivery is desirable, but TCP adds too much overhead. In order for RUDP to gain higher Quality of Service, RUDP implements features that are similar to TCP with less overhead.

For now the only feature it adds on top of UDP is just guaranteed packet delivery. This is good enough if you wish to send requests where the only thing that matters is guaranteed delivery with no duplicates, i.e. order of arrival does not matter.

Ideally it will progress towards the classical features described in http://en.wikipedia.org/wiki/Reliable_User_Datagram_Protocol and might add other useful features while being faster than TCP.

Depending on the usefulness/interest this gets I will consider implementing this as proper protocol in C and exposing to node via bindings.

## Usage Example

```javascript
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
	var req = rudp.send('127.0.0.1', BENCHMARK_PORT, 'test'); 

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
```


