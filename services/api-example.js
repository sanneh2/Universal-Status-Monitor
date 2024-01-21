const { checkStatus } = require("../lib/fetchers");

const exampleApiUrl = "https://google.com";
const exampleComponentId = "bx55ff85b5gq";

const exampleServiceName = "API Example";

const exampleIncidentTitle = "API Example is down";

const apiExampleService = {
  name: exampleServiceName,
  title: exampleIncidentTitle,
  checkFunction: checkStatusFunction(exampleApiUrl), // use await here
  componentId: exampleComponentId,
};

// ? @param name - The name of the service
// ? @param title - The title of the incident to create if the service is down
// ? @param checkFunction - The function that will check the status of the service and return 200 or 500 (OK OR ERROR)
// ? @param componentId - The component ID of the component to update on Statuspage

// Works out of the box when you change the URL and the component ID

// To add more services, just copy this file and change the URL and the component ID
// And add it to the array in config/configuration.js

// Function that returns a function with parameters when you call services.checkFunction
// This is so it can be awaited in the server
function checkStatusFunction(url) {
  // Wrapper
  return async function () {
    const response = await checkStatus(url); // The fetcher function
    return response;
  };
}

module.exports = {
  apiExampleService,
};
