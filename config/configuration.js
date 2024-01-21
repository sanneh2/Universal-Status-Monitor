//##############################################################################################################
//##############################################################################################################
//### CONFIGURATION \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//##############################################################################################################

// check these out:
// services/ folder -> add your own services here (e.g. MongoDB, API Example) or copy the example
const { apiExampleService } = require("../services/api-example");
const { mongoDbService } = require("../services/mongodb");

// Atlassian Statuspage: API key and page ID
const statuspageApiKey = process.env.STATUSPAGE_API_KEY;
const pageId = process.env.PAGE_ID;

// In services folder, you can add your own services
// and then import them here and add them to the array below
const servicesToMonitor = [
  // Add your services here
  // Example:
  apiExampleService,
  mongoDbService,
  // ...
];

module.exports = {
  statuspageApiKey,
  pageId,
  servicesToMonitor,
};
