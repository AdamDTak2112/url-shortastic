require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('node:dns');
const mongoose = require('mongoose');

const AutoIncrement = require('mongoose-sequence')(mongoose);

// Connect mongoose
mongoose.connect(process.env.MONGO_URI);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Defines a schema for storing urls
const urlSchema = new mongoose.Schema({
  url: String
});
// Defines a model for the url schema
urlSchema.plugin(AutoIncrement, { inc_field: 'id' });

const Url = mongoose.model("Url", urlSchema);
// Include autoincrement plugin


//TODO write functions for Url creation
async function createNewUrl(url){
  const sendingUrl = new Url({ url: `${url}`});
  const promise = await sendingUrl.save();
  return promise;
};

// Start endpoints

// POST endpoint for submitting a new url
app.post('/api/shorturl', function(req, res){
  if (dns.lookup(req.body.url, (err, addresses) => {
    if (err){ console.error(err); }
    else { console.log(addresses) }
  })){
    try{
      createNewUrl(req.body.url);
    } catch(e){
      console.error(`Something went wrong: ${e}`);
    }
    
    res.json({
      original_url: `${req.body.url}`
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
