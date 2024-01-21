const axios = require("axios");
const { getClient } = require("./mongodb");

// ############################################################################################
// ############################################################################################
// ### Fetchers
// ############################################################################################

// The fetches that can support checking your service's status
// Fundamentally this monitor works with a basic GET request to your service's API
// And Expects the usual 200 OK response, which is a HTTP status code that indicates success
// If your service does not support this, you can write your own function to check the status

// ### Check an API or a server
// This checks the status of the API that returns a status 200 (Most APIs do this)
// GET request
// Supports headers for authentication

// ? @param apiUrl - The URL of the API to check
// ? @param headers - The headers to pass to the API for authorization // Optional: defaults to empty object if you dont provide them
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

// Check a MongoDB database
// As previously we return a status code, it is a universal STATUS monitor after all hey
// Kudos to the w3c consortium for making the status codes a standard

async function checkMongoDBStatus() {
  try {
    // Get the MongoDB client
    const client = await getClient();
    // Perform a simple operation to check the database status
    const adminDb = client.db().admin();
    const result = await adminDb.ping();

    console.log("MongoDB Status:", result);
    return result.ok === 1 ? 200 : 500; // We know what the result returns, so we can check it
  } catch (err) {
    console.error("Error checking MongoDB status:", err);
    return 500; // Internal server error - something went wrong
  }
}

module.exports = {
  checkStatus,
  checkMongoDBStatus,
};
