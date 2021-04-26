/* Primary file*/

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
var fs = require("fs");

var config = require("./lib/config");
var _data = require("./lib/data");
var handlers = require("./lib/handlers");
var helpers = require("./lib/helpers");
// TESTING
// @TODO delete this

// _data.create("test", "newFile", { foo: "bar" }, function (err) {
//   console.log("This is an error", err);
// });

// _data.read("test", "newFile", function (err, data) {
//   console.log("This is an error", err);
//   console.log("This is a data", data);
// });

// _data.update("test", "newFile", { fizz: "buzz" }, function (err) {
//   console.log("This is an error", err);
// });

// _data.delete("test", "newFile", function (err) {
//   console.log(`This was the error ${err}`);
// });

// Instantiate the http server
var httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

// Start the http server
httpServer.listen(config.httpPort, function () {
  console.log(
    `Server started on ${config.httpPort} port in ${config.envName} mode`
  );
});

// Instantiate the https server
var httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res);
});

// Start the https server
httpsServer.listen(config.httpsPort, function () {
  console.log(
    `Server started on ${config.httpsPort} port in ${config.envName} mode`
  );
});

// All the server logic for both the http and https server
var unifiedServer = function (req, res) {
  //Get url and parsed it. True - create query string object
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, "");

  //Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get HTTP method
  var method = req.method.toLowerCase();

  // Get the header as an object
  var headers = req.headers;

  //Get payload if any
  var decoder = new StringDecoder("utf-8");
  var buffer = "";
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });
  req.on("end", function () {
    buffer += decoder.end();

    // Choose the handler this request should go on notFound handler
    var chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    // Contract the data object to send to the handler
    var data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // Route request to handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      // Use the payload called back by the handler, or default to an empty object
      payload = typeof payload == "object" ? payload : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the request path
      // console.log(`Path: ${trimmedPath}`);
      // console.log(`Method: ${method}`);
      // console.log(`Query params: `, queryStringObject);
      // console.log(`Headers: `, headers);
      // console.log(`Payload: `, buffer);
      // console.log(`Response: `, statusCode, payloadString);
    });
  });
};

// Define a request router
var router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};
