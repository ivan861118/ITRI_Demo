var express = require('express')
var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
  
app.use(express.static('public'));

app.listen((process.env.PORT || 3000), () => {
  console.log('Listening on port 3000');
});