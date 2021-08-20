require("dotenv").config();
const fetch = require("node-fetch");

const api_token = process.env.API_TOKEN;
const url = `https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=${api_token}`;

fetch(url, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    return createSessionsByUser(data);
  });

/*
const eventsByUser = {
    'd1177368-2310-11e8-9e2a-9b860a0d9039': [
        {
            "url": "/pages/a-big-river",
            "visitorId": "d1177368-2310-11e8-9e2a-9b860a0d9039",
            "timestamp": 1512754436000
        },
        {
             "url": "/pages/a-big-river",
             "visitorId": "d1177368-2310-11e8-9e2a-9b860a0d9039",
             "timestamp": 1512754583000
         },
         {
             "url": "/pages/a-small-dog",
             "visitorId": "d1177368-2310-11e8-9e2a-9b860a0d9039",
             "timestamp": 1512754631000
         },
    ]
}

*/

function createSessionsByUser(data) {
  console.log(data);

  let eventsByUser = {};
  //let eventsEvery10Mins = [];

  // Step #1 - group all events by visitorId
  for (let x = 0; x <= data.events.length; x++) {
    let event = data.events[x];
    const { url, visitorId, timestamp } = event;
    if (!(visitorId in eventsByUser)) {
      eventsByUser[visitorId] = [];
    }
    // Push the event to correct visitorId array
    eventsByUser[visitorId].push(event);
  }
  // Step #2 - order events in the chronological order by timestamp using sort
  eventsByUser[visitorId].sort(function (a, b) {
    return a.timestamp - b.timestamp;
  });

  // Step #3 - Create sessions with events by 10-minute segments (10 minutes from the preceding)

  let eventsEvery10Mins = {};
  for (const visitorId in eventsByUser) {
    const events = eventsByUser[visitorId];
    /*
        Loop through user's events
            - If it's the first event, then create a new session with it
            - If 10 minutes passed then create a new session and push it to the sessions array
            - If 10 minutes did not pass then update the current session
                + Add a new page to the session from the current event
                + Calculate duration by adding a difference between the current event and previous event
    */
    for (let x = 0; x < events.length; x++) {}
  }

  //return sessionsByUser;
}
