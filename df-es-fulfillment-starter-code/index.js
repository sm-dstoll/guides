// -----------------------------------------

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------
// return object constructors
// -----------------------------------------------

function setFollowUpEvent(eventName, returnObject = {}) {
  const newEventContext = { ...returnObject };
  newEventContext.followupEventInput = {
    name: eventName,
  };
  return newEventContext;
}

function setState(state, newParams, returnObject = {}) {
  const { name } = state;
  const newStateContext = { ...returnObject };
  newStateContext.outputContexts = [
    {
      name,
      lifespanCount: 99,
      parameters: {
        ...state.parameters,
        ...newParams,
      },
    },
  ];
  return newStateContext;
}

function setMessagePayload(messagePayload, returnObject = {}) {
  // message payload = { "text": "some text", <optional>payload: some payload}
  const { text, payload } = messagePayload;
  const messagePayloadObject = { ...returnObject };
  messagePayloadObject.fulfillmentMessages = [
    {
      text: {
        text: [
          text,
        ],
      },
    },
  ];
  if (payload) {
    const soulmachinesPayload = {
      payload: {
        soulmachines: payload,
      },
    };
    messagePayloadObject.fulfillmentMessages.push(soulmachinesPayload);
  }
  return messagePayloadObject;
}

// -----------------------------------------------
// get context
// -----------------------------------------------

function getContextPath(fullContextName) {
  const fullPath = fullContextName.split('/');
  fullPath.splice(fullPath.length - 1);
  return fullPath.join('/');
}

function retrieveState(outputContexts) {
  const state = outputContexts.find((context) => {
    const contextArray = context.name.split('/');
    return contextArray[contextArray.length - 1] === 'state';
  });
  return state;
}

// -----------------------------------------------
// utils
// -----------------------------------------------

function findNoMatchCount(outputContexts) {
  const systemCounters = outputContexts.find((context) => {
    const contextPath = context.name.split('/');
    return contextPath[contextPath.length - 1] === '__system_counters__';
  });
  return systemCounters.parameters['no-match'];
}

// -----------------------------------------------
// intent map functions
// -----------------------------------------------

// -----------------------------------------------
//  fallback / repeat
// -----------------------------------------------

function processFallback(state, outputContexts) {
  const noMatchCount = findNoMatchCount(outputContexts);
  let text = '';
  if (noMatchCount > 2) {
    const returnObject = agentEscalation(state);
    returnObject.fulfillmentMessages[0].text.text[0] = `Hmm. It seems like we may be having communication errors. ${returnObject.fulfillmentMessages[0].text.text[0]}`;
    return returnObject;
  } if (noMatchCount === 2) {
    text = 'I\'m so sorry, I couldn\'t understand that. If you aren\'t already, could you please type your response?';
  } else {
    text = 'Sorry, I didn\'t quite catch that. Could you repeat?';
  }
  return setMessagePayload({ text });
}

function repeat(state) {
  const { conv_id } = state.parameters;
  if (!conv_id) {
    const text = 'Hmm, I don\'t know where to go from here.';
    return setMessagePayload({ text });
  }
  return setFollowUpEvent(conv_id);
}

// -----------------------------------------------
// intent map
// -----------------------------------------------

const intentMap = new Map();
intentMap.set('fallback', processFallback);
intentMap.set('repeat', repeat);

// -----------------------------------------------
// app
// -----------------------------------------------

app.post('/', async (req, res) => {
  const { outputContexts } = req.body.queryResult;
  const state = retrieveState(outputContexts);
  const intentDisplayName = req.body.queryResult.intent.displayName;
  let result = {};
  if (intentDisplayName === 'fallback') {
    result = await intentMap.get(intentDisplayName).call(this, state, outputContexts);
  } else {
    const intentBase = intentDisplayName.split(' ')[0];
    if (intentMap.get(intentBase)) {
      result = await intentMap.get(intentBase).call(this, state);
    }
  }
  console.log('--------------------');
  console.log(JSON.stringify(result));
  res.send(result);
});

// _____________________________________________________

app.get('/', (request, response) => {
  response.send('hi');
});

app.listen('3003', () => {
  console.log('listening yo - 3003');
});

// -----------------------------------------
