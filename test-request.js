const Request = require('request');
const Config = require('./config');

var data = {};
data.json = {
    "@username": "test",
    "@password": "test"
};

console.log('Sending request...');
Request.post('http://localhost:' + Config.PORT + "/api/spUserAuthenticate/", data, function (error, response, body) {
    console.log('Started');
  if (!error && response.statusCode == 200) {
    console.log(':)');
    console.log(body);
    // console.log(response);
    // console.log(error);
  } else {
    console.log(':(');
    console.log(body);
    // console.log(response.statusCode);
    console.log(error);
  }
});