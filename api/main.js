console.clear();
require('dotenv').config();


const express = require('express');
const casual = require('casual');
const morgan = require('morgan');
const cors = require('cors');


const app = express();


function generateData() {
   return {
      name: casual.name,
      age: casual.integer(18, 30)
   }
} 



app.use(cors({
   origin: '*',
   allowedHeaders: [ 'x-test-header', 'if-none-match' ],
   exposedHeaders: [ 'x-test-header', 'etag' ],
   methods: [ 'GET', 'PUT' ],
}));


app.use(morgan('dev'))
app.use(express.static('static'));
app.use(express.json());

app.use(function(req, res, next) {

   if (process.env.NODE_ENV !== 'production') {
      console.log(req.headers['if-none-match']);
   }

   res.set('x-test-header', casual.uuid);

   next();
});

let data = generateData();

app.get('/data', function(req, res) {
   res.send(data);
});

app.put('/data', (req, res) => {
   data = generateData();
   res.send();
});

const PORT = process.env.PORT;

const server = app.listen(PORT, function() {
   console.log('Server started at @', PORT);
});


module.exports = server;




