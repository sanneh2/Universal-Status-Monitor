const { checkStatus } = require("../lib/fetchers");

// Magic Bell API: API key and secret
const exampleApiUrl = "https://google.com";

// Authorization headers if you need to authenticate
const exampleApiHeaders = {
  "API-API-SECRET": process.env.MAGICBELL_API_SECRET,
  "API-API-KEY": process.env.MAGICBELL_API_KEY,
};

const exampleComponentId = "bx55ff85b5gq";

const exampleServiceName = "API Example";

const exampleIncidentTitle = "API Example is down";

const apiHeadersExampleService = {
  name: exampleServiceName,
  title: exampleIncidentTitle,
  checkFunction: checkStatusFunction(exampleApiUrl, exampleApiHeaders), // 2nd param is OPTIONAL, you can remove it if you dont need it
  componentId: exampleComponentId,
};

// Function that returns a function with parameters when you call services.checkFunction with headers support
function checkStatusFunction(url, headers) {
  return async function () {
    const response = await checkStatus(url, headers);
    return response;
  };
}
// ? @param name - The name of the service
// ? @param title - The title of the incident to create if the service is down
// ? @param checkFunction - The function that will check the status of the service and return 200 or 500 (OK OR ERROR)
// ? @param componentId - The component ID of the component to update on Statuspage

module.exports = {
  apiHeadersExampleService,
};
