require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs/promises");
const api_token = process.env.API_TOKEN;
const url = `https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=${api_token}`;
const finalUrl = `https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=${api_token}`;

// This is the Fetch code that can be used for a live API demonstration
/*
// Do initial GET
fetch(url, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then(async (data) => {
    if (data.events) {
        await fs.writeFile("events.json", JSON.stringify(data));
    }
    return createSessionsByUser(data);
  });
*/

// Using async with saved API data
(async () => {
  try {
    const eventsBuffer = await fs.readFile("events.json");
    const sessionsByUser = createSessionsByUser(
      JSON.parse(eventsBuffer.toString())
    );
    const response = await submit(sessionsByUser);
    console.log("res", response);
    const json = await response.json();
    console.log("res json", json);
  } catch (error) {
    console.error(error);
  }
})();

// The Post
const submit = (sessionsByUser) => {
  return fetch(finalUrl, {
    method: "post",
    body: JSON.stringify({ sessionsByUser }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Put together session information per user
function createSessionsByUser(data) {
  console.log(data);

  // Group all events by visitorId
  let eventsByUser = {};
  for (let x = 0; x < data.events.length; x++) {
    let event = data.events[x];
    const { url, visitorId, timestamp } = event;
    console.log(url);
    if (!(visitorId in eventsByUser)) {
      // Create empty events array for new user
      eventsByUser[visitorId] = [];
    }
    // Push the event to correct visitorId array
    eventsByUser[visitorId].push(event);
  }

  // Create sessions with events by 10-minute segments (10 minutes from the preceding session)
  const sessionsByUser = {};
  // Loop through each user's events
  for (const visitorId in eventsByUser) {
    // Get all events for this user
    const events = eventsByUser[visitorId];
    // Order events in the chronological order by timestamp using sort
    eventsByUser[visitorId].sort(function (a, b) {
      return a.timestamp - b.timestamp;
    });

    // Create session list to store session data for this user
    let sessionsList = [];

    // Loop through all events for this user
    for (let x = 0; x < events.length; x++) {
      const event = events[x];
      // If it's the first event, then create a new session for this user
      if (x === 0) {
        const newSession = {
          duration: 0,
          pages: [event.url],
          startTime: event.timestamp,
        };

        // Push first session to the list of sessions
        sessionsList.push(newSession);
        continue;

      // Get the previous event
      const prevEvent = events[x - 1];

      // Calculate durations for rest of items, then push those items as well
      const timestampToMinutes = (timestamp) => timestamp / 1000 / 60;
      const timeDiff =
        timestampToMinutes(event.timestamp) -
        timestampToMinutes(prevEvent.timestamp);
      const didTenMinutePass = timeDiff > 10;

      // Create a new session every 10 minutes
      if (didTenMinutePass) {
        const newSession = {
          duration: 0,
          pages: [event.url],
          startTime: event.timestamp,
        };

        // Add a new session after 10 minutes has passed
        sessionsList.push(newSession);
      } else {
        // Get current active session
        const currentTempSession = sessionsList[sessionsList.length - 1];
        // Use duration and timestamp to calc new duration
        const newDuration =
          currentTempSession.duration + (event.timestamp - prevEvent.timestamp);

        currentTempSession.pages.push(event.url);
        currentTempSession.duration = newDuration;
      }
    }
    sessionsByUser[visitorId] = sessionsList;
  }

  console.dir(sessionsByUser, { depth: null, colors: true });
  return sessionsByUser;
}
