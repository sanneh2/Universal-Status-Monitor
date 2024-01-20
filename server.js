const express = require("express");
const axios = require("axios");
const cron = require("node-cron");

require("dotenv").config(); // Load environment variables from .env file
const router = express.Router();
const app = express();
const port = process.env.PORT || 3000;

// ##############################################################################################################
// ##############################################################################################################
// ### HELPER FUNCTIONS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// ##############################################################################################################

// Get the current date in the required format (YYYY-MM-DD)
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

//##############################################################################################################
//##############################################################################################################
//### CONFIGURATION \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//##############################################################################################################

// Atlassian Statuspage: API key and page ID
const statuspageApiKey = process.env.STATUSPAGE_API_KEY;
const pageId = process.env.PAGE_ID;

// The component ID of the component to update
const myComponentId = process.env.COMPONENT_ID;

// Magic Bell API: API key and secret
const magicBellApiUrl = "https://api.magicbell.com/metrics";
const magicBellHeaders = {
  "X-MAGICBELL-API-SECRET": process.env.MAGICBELL_API_SECRET,
  "X-MAGICBELL-API-KEY": process.env.MAGICBELL_API_KEY,
};

//##############################################################################################################
//##############################################################################################################
//### BEGIN \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//##############################################################################################################

// Create new incident on Statuspage
// We need the usual information
// ! Warning Dinosaur Age Docs:
// ? https://developer.statuspage.io/#operation/postPagesPageIdIncidents
// Who wants to build a better status page? - I do!

// ? @param title - The title of the incident
// ? @param status - The status of the incident (investigating, identified, monitoring, resolved)
// ? @param componentStatus - The status of the component (operational, degraded_performance, partial_outage, major_outage)
// ? @param componentId - The ID of the component to update
// create new incident on Statuspage
async function createNewIncident(title, status, componentStatus, componentId) {
  const incidentData = {
    incident: {
      name: title,
      status: status,
      metadata: {},
      components: {
        [componentId]: componentStatus,
      },
      component_ids: [componentId],
    },
  };

  // Perform the POST request to the api endpoint with the data and authorization headers for your page
  try {
    const response = await axios.post(
      `https://api.statuspage.io/v1/pages/${pageId}/incidents`,
      incidentData,
      {
        headers: {
          Authorization: `OAuth ${statuspageApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error updating Statuspage Incident:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
  }
}

// UPDATE EXISTING INCIDENT
// ? @param incidentId - The ID of the incident to update
// ? @param componentId - The ID of the component to update

// Resolve existing incident on Statuspage
async function resolveExistingIncident(incidentId, componentId) {
  if (!incidentId) {
    console.error("No incident ID provided");
    return;
  }
  const updateIncidentData = {
    incident: {
      status: "resolved", // RESOLVED
      metadata: {},
      components: {
        [componentId]: "operational", // OPERATIONAL
      },
      component_ids: [componentId],
    },
  };

  try {
    const response = await axios.patch(
      `https://api.statuspage.io/v1/pages/${pageId}/incidents/${incidentId}`,
      updateIncidentData,
      {
        headers: {
          Authorization: `OAuth ${statuspageApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return "Statuspage incident resolved successfully:", response.data;
  } catch (error) {
    return (
      "Error resolving Statuspage incident:",
      error.response ? error.response.data : error.message
    );
  }
}

// ALL SYSTEMS OPERATIONAL
async function createAllSystemsOperationalIncident(componentId) {
  const incidentData = {
    incident: {
      name: "All Systems Operational",
      status: "resolved",
      body: "All systems have been checked and are operational.",
      components: {
        [componentId]: "operational",
      },
    },
  };

  try {
    const response = await axios.post(
      `https://api.statuspage.io/v1/pages/${pageId}/incidents`,
      incidentData,
      {
        headers: {
          Authorization: `OAuth ${statuspageApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return "Statuspage updated successfully:", response.data;
  } catch (error) {
    return (
      "Error updating Statuspage:",
      error.response ? error.response.data : error.message
    );
  }
}

// Check status logic
// Supports headers for authentication
// ? @param apiUrl - The URL of the API to check
// ? @param headers - The headers to pass to the API // Optional: defaults to empty object if you dont provide them
// ? @returns - status code of the API
async function checkStatus(apiUrl, headers = {}) {
  try {
    const response = await axios.get(apiUrl, { headers: headers });
    console.info(`Status Check at ${apiUrl} ${response.status}`);
    return response.status;
  } catch (error) {
    console.error(`Error Checking Status at ${apiUrl} ${error.message}`);
    if (error.response) {
      console.error(`Status Response For: ${apiUrl}`, error.response.data);
    }
    return 500; // Internal server error - something went wrong
  }
}

//##############################################################################################################
//### MEMORY \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ \\\\\\\\\\
//##############################################################################################################

// Store the incident ID in memory that is available while the server is running
let incidentId = null;

//##############################################################################################################
//##############################################################################################################
//### SERVER \\\\\\\
//##############################################################################################################

// /cron - Endpoint for cronjob
// Visit your server at /cron to trigger the middleware
// It will check the status of the API and update the Statuspage accordingly

// Your middleware function to monitor API status
async function monitorApiStatusMiddleware(req, res, next) {
  // 1.) Get Status
  console.info("Checking status");
  const status = await checkStatus(magicBellApiUrl, magicBellHeaders);

  // 2.) Create new incident on Statuspage
  // Params: title, status,  componentStatus
  if (status !== 200 && status !== 500) {
    // 200 === OK, 500 === Internal Server Error
    // Service is down, Alert everyone with status "Investigating" and mark component as "Major Outage" on Statuspage
    console.info("Service is down");
    // Choose a title for your incident
    const title = process.env.INCIDENT_TITLE;

    const response = await createNewIncident(
      title,
      "investigating",
      "major_outage",
      myComponentId // your component id on Statuspage
    );
    if (response.data.incident.id) {
      console.info("Incident created");
    }
    // Capture the incident ID from the response
    else incidentId = response.data.incident.id;
  } else {
    if (status === 200) {
      // Service is up

      // Check if there is an ongoing incident
      if (incidentId) {
        console.info("Service is back up");
        // Resolve the incident
        console.info("Resolving incident");
        const response = await resolveExistingIncident(
          incidentId,
          myComponentId
        );
        console.info(response);

        // Reset the incident ID
        incidentId = null;
      } else {
        // No incident ongoing
        console.info("No incident ongoing");
        // Create a new positive incident to show operational status
        console.info("All systems operational");
      }
    }
  }
  res.status(200).send("mOniToRed"); // Send a response to the client

  next(); // Move to the next middleware or route handler
}

// ##############################################################################################################
// ##############################################################################################################
// ### CRON \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// ##############################################################################################################

// Schedule the cron job to run the monitor status check every 12 minutes
// Using node-cron
// ### MONITOR
cron.schedule("*/12 * * * *", async () => {
  console.log("#############################################");
  console.log(" Running scheduled monitoring [every 12 minutes]");
  console.log("#############################################");

  const status = await checkStatus(magicBellApiUrl, magicBellHeaders);

  // 2.) Create new incident on Statuspage
  // Params: title, status,  componentStatus
  if (status !== 200 && status !== 500) {
    // 200 === OK, 500 === Internal Server Error
    // Service is down, Alert everyone with status "Investigating" and mark component as "Major Outage" on Statuspage
    console.info(magicBellApiUrl, "Service is down");
    // Choose a title for your incident
    const title = process.env.INCIDENT_TITLE;

    const response = await createNewIncident(
      title,
      "investigating",
      "major_outage",
      myComponentId // your component id on Statuspage
    );
    if (response.data.incident.id) {
      console.info("Incident created");
    }
    // Capture the incident ID from the response
    else incidentId = response.data.incident.id;
  } else {
    if (status === 200) {
      // Service is up

      // Check if there is an ongoing incident
      if (incidentId) {
        console.info("Service is back up");
        // Resolve the incident
        console.info("Resolving incident");
        const response = await resolveExistingIncident(
          incidentId,
          myComponentId
        );
        console.info(response);

        // Reset the incident ID
        incidentId = null;
      } else {
        // No incident ongoing
        console.info("No incident ongoing");
        // Create a new positive incident to show operational status
        console.info("All systems operational");
      }
    }
  }
});

// ##### DAILY SYSTEM HEALTH
// This posts a new incident every day at 6:00 AM GMT+2 saying "All Systems Operational" if there is no incident ongoing
// This is to show that the system is healthy and operational and not just "no incidents" on the statuspage
// It must be independent of the monitor cron job
cron.schedule("0 4 * * *", async () => {
  console.log(
    "###########################################################################################"
  );

  console.log(
    " Running scheduled daily system health check [every day at 6:00 AM GMT+2]"
  );
  console.log(
    "############################################################################################"
  );

  if (incidentId) return; // If there is an ongoing incident, do nothing

  // 1.) Get Status
  console.info("Performing independent daily system health check");
  const status = await checkStatus(magicBellApiUrl, magicBellHeaders);

  // 2.) Create new incident on Statuspage
  // Params: title, status,  componentStatus
  if (status !== 200 && status !== 500) {
    // 200 === OK, 500 === Internal Server Error
    // Service is down, Alert everyone with status "Investigating" and mark component as "Major Outage" on Statuspage
    console.info(magicBellApiUrl, "Service is down");
    // Choose a title for your incident
    const title = process.env.INCIDENT_TITLE;

    const response = await createNewIncident(
      title,
      "investigating",
      "major_outage",
      myComponentId // your component id on Statuspage
    );
    if (response.data.incident.id) {
      console.info("Incident created");
    }
    // Capture the incident ID from the response
    else incidentId = response.data.incident.id;
  } else {
    if (status === 200) {
      // Service is up

      // Check if there is an ongoing incident
      if (incidentId) {
        console.info("Service is back up");
        // Resolve the incident
        console.info("Resolving incident");
        const response = await resolveExistingIncident(
          incidentId,
          myComponentId
        );
        console.info(response);

        // Reset the incident ID
        incidentId = null;
      } else {
        // No incident ongoing
        console.info("No incident ongoing");
        // Create a new positive incident to show operational status
        console.info("All systems operational");
        const response = await createAllSystemsOperationalIncident(
          myComponentId
        );
        console.info(response);
      }
    }
  }
});

// ##############################################################################################################
// ##############################################################################################################
// ### ROUTER \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// ##############################################################################################################

// Use the router for the "cron" route
// When you visit or ping your server at /cron, it will trigger the middleware ( run the monitor )
// #### MONITOR ROUTE ####
router.use("/cron", monitorApiStatusMiddleware);

// This is for some jokesters out there
router.get("/", (req, res) => {
  res.send(
    "<div style='display:flex; flex-direction:column;'><h1 style='color: #FF6EC7; font-size: 3rem;'>Turn back. Nothing to see here. Move along. Move along.</h1><ul style='font-size:2rem'> <li><a href='/cron'> /cron Monitoring </a></li> <li> <a href='/health'> /health This server health </a> </li> </ul> </div>"
  );
});

// Health check
router.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Use the router for the server
app.use(router);
// Start the server
app.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}`);
});
