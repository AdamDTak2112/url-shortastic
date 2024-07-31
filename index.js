require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('node:dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let index = 1;

const urlArr = [];

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.post('/api/shorturl', function(req, res){
  if (dns.lookup(req.body.url, (err, addresses) => {
    if (err){ console.error(err); }
    else { console.log(addresses) }
  })){
    urlArr.push(req.body.url)
    res.json({
      original_url: `${req.body.url}`,

    })
  } else {
    res.json({
      error: 'invalid url'
    });
  }
  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
