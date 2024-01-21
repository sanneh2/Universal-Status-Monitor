//##############################################################################################################
//### MEMORY === STATE \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//##############################################################################################################

// Define a map to store incident IDs for different services
// It's like a fancy array that you can treat like an object
const serviceIncidentIds = new Map();

// Function to get/set incident ID based on service name
function getServiceIncidentId(serviceName) {
  return serviceIncidentIds.get(serviceName);
}

function setServiceIncidentId(serviceName, incidentId) {
  serviceIncidentIds.set(serviceName, incidentId);
}

// Function to reset incident ID based on service name
function resetServiceIncidentId(serviceName) {
  serviceIncidentIds.delete(serviceName);
}

module.exports = {
  getServiceIncidentId,
  setServiceIncidentId,
  resetServiceIncidentId,
};
