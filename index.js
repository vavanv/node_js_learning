/* Primary file*/

// Dependencies
const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;

var server = http.createServer(function (req, res) {
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
      payload: buffer,
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
      console.log(`Path: ${trimmedPath}`);
      console.log(`Method: ${method}`);
      console.log(`Query params: `, queryStringObject);
      console.log(`Headers: `, headers);
      console.log(`Payload: `, buffer);
      console.log(`Response: `, statusCode, payloadString);
    });
  });
});

server.listen(3000, function () {
  console.log("Server started on 3000 port");
});

// Define handlers

var handlers = {};

handlers.sample = function (data, callback) {
  // Callback a http status code, and  a payload object
  callback(406, { name: "sample handler" });
};

handlers.notFound = function (data, callback) {
  callback(404);
};

// Define a request router

var router = {
  sample: handlers.sample,
};
