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
  id: Number,
  url: String
});

// Defines a model for the url schema
urlSchema.plugin(AutoIncrement, { inc_field: 'id' });

const Url = mongoose.model("Url", urlSchema);
// Include autoincrement plugin


async function createNewUrl(url){
  const sendingUrl = new Url({ url: `${url}`});
  return await sendingUrl.save().then((data) => console.log(data));
}

async function getUrl(wantedId){
  console.log('getting urls...');
  const query = Url.findOne({ id: wantedId }, 'id');
  const promise = query.exec();
  console.log("promise object is: " + promise);
}

// Start endpoints


// GET endpoint for redirects using shortlinks
app.get('/api/shorturl/:shortlink', function(req, res){
  console.log('hit the shortlink...');
  const index = req.params.shortlink;
  
  //res.redirect(urlObj.url);
})

// POST endpoint for submitting a new url
app.post('/api/shorturl', function(req, res){
  if (dns.lookup(req.body.url, (err, addresses) => {
    if (err){ console.error(err); }
    else { console.log("address is valid...") }
  })){
    let returnedUrl;
    try{
      // TODO write logic for if url already exists, for completeness's sake
      returnedUrl =  createNewUrl(req.body.url);
    } catch(e){
      console.error(`Something went wrong: ${e}`);
    }
    console.log(returnedUrl);
    res.json({
      original_url: `${req.body.url}`,
      short_url: `${returnedUrl.id}`
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
