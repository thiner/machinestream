var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;

app.listen(port);

console.log('Server started on: ' + port);

/**
 * A super simple KV store to provide machine status. machine_id is the key
 */
const cache = {}

// connect to WS endpoint
const WebSocket = require('ws');
// init WS connections
const ws = wireWS();

// build the api
app.get("/machines", (req, res, next) => {
  if(ws.readyState > 1) {
    ws = wireWS();
  }
  let machines = [];
  let mId;
  for (mId in cache) {
    console.log('key=' + mId)
    if (cache.hasOwnProperty(mId)) {
      machines.push(cache[mId]);
    }
  }
  res.json(machines);
});

function wireWS() {
  let ws = new WebSocket('ws://machinestream.herokuapp.com/ws');
  ws.on('open', function open() {
    console.log('connected');
    console.log('ready state: ' + ws.readyState);
    setInterval(function() {
      ws.ping();
    }, 10000);
  });

  ws.on('close', function close() {
    console.log('disconnected, trying to reconnect');
  });

  ws.on('message', function incoming(data) {
    console.log(data)
    
    var info = JSON.parse(data);
    let key = info['payload']['machine_id'];
    cache[key] = info;
  });

  ws.on('pong', function () {
    console.log('pong');
  });

  return ws;
}