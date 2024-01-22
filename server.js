const express = require("express");
const { connectToMongoDB } = require("./lib/mongodb");
const { servicesToMonitor } = require("./config/configuration");
const {
  handleServiceStatus,
  createAllSystemsOperationalIncident,
} = require("./lib/statuspage-api");

require("dotenv").config(); // Load environment variables from .env file

//##############################################################################################################
//##############################################################################################################
//### SERVER \\\\\\\
//##############################################################################################################

const router = express.Router();
const app = express();
const port = process.env.PORT || 3000;

// /cron - Endpoint for cronjob (This is where the monitoring happens) recommended 10-15 minutes
// /daily - Endpoint for daily system health check (Post a daily incident report saying "All Systems Operational") When you cron at 24hours
// /health - Endpoint for server health check (Is the server running?)

// Visit your server at /cron to trigger the middleware
// It's best to utilize a free online cron service so you can host this on a free server and keep it alive

// ### /cron MIDDLEWARE: MONITORING
// Your middleware function to monitor service status
async function monitorMiddleware(req, res, next) {
  try {
    // ###### servicesToMonitor ######
    // config/configuration.js
    const services = servicesToMonitor; // Edit the array in configuration to add or remove services to monitor

    // Loop through services and check status
    for (const service of services) {
      console.info(`Checking ${service.name} status`);
      const status = await service.checkFunction(); // Runs the dedicated check function for the service
      // Handle service status
      // ? see lib/statuspage-api.js #Handler, but you dont need to change anything here
      handleServiceStatus(status, service);
    }
    // done
    res.status(200).send("mOniToRed"); // Send a response to the client
    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
}

// ##### DAILY SYSTEM HEALTH
// This posts a new incident  saying "All Systems Operational" if there is no incident ongoing
// This is to show that the system is healthy and operational and not just "no incidents" on the statuspage

async function dailyReportMiddleware(req, res, next) {
  console.log("####################################################");
  console.log(" Performing independent daily system health check ");
  console.log("#####################################################");

  let serviceStatusReport = []; // Array to store service status

  try {
    // Loop through the configured services and check status
    // Loop through services and check status
    for (const service of servicesToMonitor) {
      console.info(`Checking ${service.name} status`);
      const status = await service.checkFunction(); // Runs the dedicated check function for the service

      // we don't need to handle the status, but report it
      // We combine the Service Name (e.g. API Example) with the status (e.g. 200)
      serviceStatusReport.push({
        name: service.name,
        status: status,
        componentId: service.componentId,
      });
    }

    // Report the status of the services
    // Log the service status report
    console.log("Service Status Report:");
    serviceStatusReport.forEach(({ name, status }) => {
      console.log(`${name}: ${status}`);
    });

    // Check if all services are operational (status 200)
    const allServicesOperational = serviceStatusReport.every(
      ({ status }) => status === 200
    );

    // IF they are, create a new incident saying "All Systems Operational"
    // with a detailed status report for each component
    if (allServicesOperational) {
      console.info("All systems operational");

      // Format the body of the incident
      const body = serviceStatusReport
        .map(({ name, status }) => `${name}: ${status + " OK"}`)
        .join("\n");
      const componentIds = serviceStatusReport.map(
        ({ componentId }) => componentId
      );
      // Create the incident
      const response = await createAllSystemsOperationalIncident(
        componentIds,
        body
      );
      // Clear array
      serviceStatusReport = [];
      console.log("Daily status report complete and published successfully");

      res.status(200).send("Daily incident report performed gracefully"); // Send a response to the client
      next(); // Move to the next middleware or route handler
    } else {
      console.info("Not all systems operational");
      console.info("No incident created, please resolve issues first ");
      // Clear array
      serviceStatusReport = [];
      res.status(200).send("Daily incident report performed gracefully"); // Send a response to the client
      next(); // Move to the next middleware or route handler
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
    next(); // Move to the next middleware or route handler
  }
}

// ##############################################################################################################
// ##############################################################################################################
// ### ROUTER \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// ##############################################################################################################

// Use the router for the "cron" route
// When you visit or ping your server at /cron, it will trigger the middleware ( run the monitor )

// #### MONITOR ROUTE ####
router.use("/cron", monitorMiddleware);

// #### DAILY SYSTEM STATUS ROUTE ####
router.use("/daily", dailyReportMiddleware);

// This is for some jokesters out there
router.get("/", (req, res) => {
  res.send(
    "<div style='display:flex; flex-direction:column;'><h1 style='color: #FF6EC7; font-size: 3rem;'>Turn back. Nothing to see here. Move along. Move along.</h1><ul style='font-size:2rem'> <li><a href='/cron'> /cron Monitoring (set a 15 minute cron to this route) </a></li> <li> <a href='/health'> /health This server health </a> </li> <li> <a href='/daily'> /daily Share an incident report saying 'All Systems Operational' (set a cron once a day) </a> </li> </ul> </div>"
  );
});

// ### SERVER Health check
router.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Use the router for the server
app.use(router);
// Start the server and connect to MongoDB on startup
app.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}`);
  if(process.env.MONGODB_URI) { // If using MongoDB tracking service
  connectToMongoDB();
  }
});
