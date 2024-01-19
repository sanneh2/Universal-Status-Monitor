const express = require("express");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

// Atlassian Statuspage API key and page ID
const statuspageApiKey = process.env.STATUSPAGE_API_KEY;
const pageId = process.env.PAGE_ID;

const magicBellApiUrl = "https://api.magicbell.com/metrics";
const magicBellComponentId = "cmjt8jfdfc9s";
const headers = {
  "X-MAGICBELL-API-SECRET": process.env.MAGICBELL_API_SECRET,
  "X-MAGICBELL-API-KEY": process.env.MAGICBELL_API_KEY,
};

// Function to get the current date in the required format (YYYY-MM-DD)
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Function to update Statuspage incident
async function updateStatuspageIncident(status, components) {
  const patchData = {
    component: {
      description: "Intervalno posodabljanje stanja naročniškega sistema",
      status: status, // Use a dynamic status
      name: "Stanje naročniškega sistema je bilo posodobljeno",
      only_show_if_degraded: true,
      group_id: null,
      showcase: true,
      start_date: getCurrentDate(), // Use the current date in the correct format
    },
  };
  try {
    const response = await axios.put(
      `https://api.statuspage.io/v1/pages/${pageId}/components/${magicBellComponentId}`,
      patchData,
      {
        headers: {
          Authorization: `OAuth ${statuspageApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Statuspage Incident Updated:", response.data);
  } catch (error) {
    console.error("Error updating Statuspage Incident:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
  }
}

// Middleware to monitor Magic Bell API status
app.use(async (req, res, next) => {
  try {
    const magicBellResponse = await axios.get(magicBellApiUrl, {
      headers,
    });

    // Check the response status and components as needed
    const magicBellStatus =
      magicBellResponse.status === 200 ? "operational" : "major_outage";
    const magicBellComponents = [
      { id: magicBellComponentId, status: magicBellStatus },
    ];

    // Update Statuspage incident based on Magic Bell API status
    updateStatuspageIncident(magicBellStatus, magicBellComponents);

    res.sendStatus(200);
  } catch (error) {
    console.error("Error checking Magic Bell API status:", error.message);
    res.sendStatus(500);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
