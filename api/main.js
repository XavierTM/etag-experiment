console.clear();
require('dotenv').config();


const express = require('express');
const casual = require('casual');
const morgan = require('morgan')


const app = express();


function generateData() {
   return {
      name: casual.name,
      age: casual.integer(18, 30)
   }
} 


app.use(morgan('dev'))
app.use(express.json());

app.use(function(req, res, next) {
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

app.listen(PORT, function() {
   console.log('Server started at @', PORT);
})




