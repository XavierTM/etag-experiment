

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../main');
const { default: axios } = require('axios');

chai.use(chaiHttp);

suite("chai etag support", () => {

   test("repeating a request to /data should give 304", async () => {

      let res = await chai
         .request(server)
         .get('/data');

      const etag = res.get('etag');


      res = await chai
         .request(server)
         .get('/data')
         .set('if-none-match', etag);

      assert.equal(res.status, 304);

   });

});

function behaviourTest(server, suiteName) {

   suite(suiteName, function() {

      test('Two subsequent GET /data requests should give the same etag', async () => {
         
         const firstRequest = await chai
            .request(server)
            .get('/data');

         const secondRequest = await chai
            .request(server)
            .get('/data');

         
         assert.notEqual(secondRequest.get('x-test-header'), firstRequest.get('x-test-header'), "x-test-headers should be different");
         assert.equal(secondRequest.get('etag'), firstRequest.get('etag'), "Etags should be the same");

         const etag = secondRequest.get('etag');

         const thirdRequest = await chai
            .request(server)
            .get('/data')
            .set('if-none-match', etag);

         assert.equal(thirdRequest.status, 304);
         assert.notEqual(thirdRequest.get('x-test-header'), secondRequest.get('x-test-header'), "x-test-headers should be different");

         console.log('text:', thirdRequest.text);
         console.log('text(first):', firstRequest.text);

      });
   });

}


function behaviourTestWithAxios(baseURL, suiteName) {

   axios.defaults.baseURL = baseURL;

   suite(suiteName, function() {

      test('Two subsequent GET /data requests should give the same etag', async () => {
         
         const firstResponse = await axios.get('/data');
         const secondResponse = await axios.get('/data');

         assert.notEqual(firstResponse.headers['x-test-header'], secondResponse.headers['x-test-header'], "x-test-headers should be different");
         assert.equal(firstResponse.headers['etag'], secondResponse.headers['etag'], "Etags should be the same");


         const etag = secondResponse.headers['etag'];

         let thirdResponse;

         try {   
            thirdResponse = await axios.get('/data', {
               headers: {
                  'if-none-match': etag
               }
            });
         } catch (err) {
            thirdResponse = err.response
            // console.log(thirdResponse);
         }

         assert.equal(thirdResponse.status, 304);
         assert.notEqual(secondResponse.headers['x-test-header'], thirdResponse.headers['etag'], "x-test-headers should be different");


      });
   });

}




behaviourTest(process.env.URL, 'Without reverse proxy');
behaviourTest(process.env.REVERSE_PROXY_URL, 'With reverse proxy');

behaviourTestWithAxios(process.env.URL, 'Without reverse proxy');
behaviourTestWithAxios(process.env.REVERSE_PROXY_URL, 'With reverse proxy');

// behaviourTestWithAxios(`http://localhost:${process.env.PORT}`, 'Axios against local');
