require("dotenv").config();
const fetch = require("node-fetch");

const api_token = process.env.API_TOKEN;
const url = `https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=${api_token}`;

// Do initial GET
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

// Put together session information
function createSessionsByUser(data) {
  console.log(data);

  // Step #1 - group all events by visitorId
  let eventsByUser = {};
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

  // Step #3 - Create sessions with events by 10-minute segments (10 minutes from the preceding session)
  let eventsEvery10Mins = {};
  let sessionInitTime = [];
  // Loop through each user's events
  for (const visitorId in eventsByUser) {
    const events = eventsByUser[visitorId];
    for (let x = 0; x < events.length; x++) {
      // If it's the first event, then create a new session for this user
      let sessionInitTime = null;
      let duration = null;
      if (x === 0) {
        eventsEvery10Mins[visitorId] = events;
        sessionInitTime = events.timestamp;
        duration = 0;
        console.log("first", eventsByUser[0]);
      }
      // Calculate durations for rest of items

      /* If 10 minutes passed then create a new session and push it to the sessions array
      /*

      /* If 10 minutes did not pass then update the current session
        + Add a new page to the session from the current event
        + Calculate duration by adding a difference between the current event and previous event */
    }
  }

  // Add POST fetch here along with check of status
}
