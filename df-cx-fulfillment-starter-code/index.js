'use strict';

const functions = require('firebase-functions');

// -----------------------------------------

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function runTestFunction() {
  let jsonResponse = {
    fulfillment_response: {
      messages: [
        {
          text: {
            text: ["This is a sample response."]
          }
        }
      ]
    },
    sessionInfo: {
      parameters: {
           "sample-parameter": {
               value: "sample1"
           }
      }
    }
  };
  return jsonResponse;
}

// -----------------------------------------------
// intent map
// -----------------------------------------------

const tagMap = new Map();
tagMap.set('test-value', runTestFunction);

// -----------------------------------------------
// app
// -----------------------------------------------

app.post('/', async (req, res) => {
  const { tag } = req.body.fulfillmentInfo;
  let result = {};
  if (tagMap.get(tag)) {
    result = await tagMap.get(tag).call(this);
  }
  res.send(result);
});
// -----------------------------------------

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);