const { checkMongoDBStatus } = require("../lib/fetchers");

const mongoDbServiceName = "MongoDB Example";

const mongoDbIncidentTitle = "MongoDB Example is down";

const mongoDbComponentId = "bx55ff85b5gq"; // Go to Atlassian Statuspage -> Components -> Click on the component you want to update -> The component ID is in the page

const mongoDbService = {
  name: mongoDbServiceName,
  title: mongoDbIncidentTitle,
  checkFunction: checkMongoDBStatusFunction(), // A simple function that uses the MongoDB client to check the status of your database
  componentId: mongoDbComponentId,
};

// Function that returns an async function that can be awaited in the server
// Just leave it as it is
function checkMongoDBStatusFunction() {
  // This is a wrapper
  return async function () {
    const response = await checkMongoDBStatus(); // This is the function that checks the status of your MongoDB database
    return response;
  };
}

// ? @param name - The name of the service
// ? @param title - The title of the incident to create if the service is down
// ? @param checkFunction - The function that will check the status of the service and return 200 or 500 (OK OR ERROR)
// ? @param componentId - The component ID of the component to update on Statuspage

module.exports = {
  mongoDbService,
};
