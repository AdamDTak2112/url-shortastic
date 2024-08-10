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
  res.sendFile(__dirname + '/views/index.html');
});

// Defines a schema for storing urls
const urlSchema = new mongoose.Schema({
  id: Number,
  url: String
});


// Include autoincrement plugin
urlSchema.plugin(AutoIncrement, { inc_field: 'id' });

// Defines a model for the url schema
const Url = mongoose.model("Url", urlSchema);


function checkProtocol(str){
  const httpRegex = /^https?:\/\/\S+(\/\S+)*(\/)?$/g;
  return httpRegex.test(str)
    ? str
    : `http://${str}`;
}


async function createNewUrl(url){
  const sendingUrl = new Url({ url: `${url}`});
  return await sendingUrl.save().then((data) => console.log(data));
}

async function getUrl(wantedId){
  console.log('getting urls...');
  try {
    const foundUrl = await Url.findOne({ id: wantedId });
    console.log('foundUrl finished... ' + foundUrl);
    return foundUrl;
  } catch(e){
    console.error('error finding that url... ' + e);
  }
}

// Start endpoints


// GET endpoint for redirects using shortlinks
app.get('/api/shorturl/:shortlink', function(req, res, next){
  console.log('hit the shortlink...');
  const index = req.params.shortlink;
  console.log('index = ' + index);
  const id = getUrl(index)
    .then(function(result, err){
      if (err){
        console.log("hit the error");
        next(err);
      } else{
        console.log(result);
        const finalUrl = checkProtocol(result.url);
        res.redirect(finalUrl);
      }
    })
    .catch(function(err){
      console.error(err);
    });
})

// POST endpoint for submitting a new url
app.post('/api/shorturl', function(req, res){
  if (dns.lookup(req.body.url, (err, addresses) => {
    if (err){ console.error(err); }
    else { console.log("address is valid...") }
  })){
    let returnedUrl;
    try{
      // TODO write logic to exclude https or http, append them later if wanted
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
