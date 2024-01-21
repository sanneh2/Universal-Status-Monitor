//##############################################################################################################
//##############################################################################################################
//### CORE \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//##############################################################################################################

const { pageId, statuspageApiKey } = require("../config/configuration");
const {
  getServiceIncidentId,
  resetServiceIncidentId,
  setServiceIncidentId,
} = require("./state");
const axios = require("axios");

// You don't need to edit this, unless you want to read the docs and customize it

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
async function createAllSystemsOperationalIncident(componentIds, body) {
  // Component IDs are passed as an array
  // Prepare the components object with each status as operational
  const components = {};
  componentIds.forEach((componentId) => {
    components[componentId] = "operational";
  });

  const incidentData = {
    incident: {
      name: "All Systems Operational",
      status: "resolved",
      body: `All systems have been checked and are operational.\nReport for services:\n${body}`,
      components: components,
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
    console.log("Daily Incident created successfully!");

    return "Statuspage updated successfully:", response.status;
  } catch (error) {
    return (
      "Error updating Statuspage:",
      error.response ? error.response.data : error.message
    );
  }
}

//##############################################################################################################
//##############################################################################################################
//### HANDLER \\\\\\\\\ \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//##############################################################################################################

// Universal function that handles multiple service incident by Ids
// and can handle creating new incidents and resolving existing ones
async function handleServiceStatus(status, service) {
  // get these out
  const name = service.name;
  const componentId = service.componentId;
  const title = service.title;

  if (status !== 200) {
    // Service is down, alert everyone
    console.info(`${name} is down`);

    // Check if there is an ongoing incident for the specific service
    if (!getServiceIncidentId(name)) {
      // Create a new incident for the specific service
      const incidentResponse = await createNewIncident(
        title,
        "investigating",
        "major_outage",
        componentId
      );
      if (!incidentResponse?.data) {
        console.error(`Error creating ${name} incident`);
        return;
      }
      const incidentId = incidentResponse.data.id;
      setServiceIncidentId(name, incidentId);
      console.info(`${name} incident created`);
    }
    // Incident already ongoing for the specific service
    else {
      console.info(`${name} incident ongoing`);
    }
  } else {
    if (status === 200) {
      // Service is up
      console.log(`${name} is up`);

      // Check if there is an ongoing incident for the specific service
      const incidentId = getServiceIncidentId(name);

      if (incidentId) {
        console.info(`${name} is back up`);
        // Resolve the incident for the specific service
        console.info(`Resolving ${name} incident`);
        resolveExistingIncident(incidentId, componentId);
        console.info(`${name} incident resolved`);

        // Reset the incident ID for the specific service
        resetServiceIncidentId(name);
      } else {
        // No incident ongoing for the specific service
        console.info(`No ${name} incident ongoing`);
        console.info(`${name} is operational`);
      }
    }
  }
}

module.exports = {
  handleServiceStatus,
  createAllSystemsOperationalIncident,
  resolveExistingIncident,
  createNewIncident,
};
