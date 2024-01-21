# 🚀 Universal Status Monitor

**A versatile Node.js server for monitoring various services and automatically updating Atlassian Status Page components.**

## Overview

This Node.js server is designed to be a universal status monitor, providing a flexible solution for monitoring different services and updating the Atlassian Status Page component accordingly. It supports templating, allowing you to easily adapt it to monitor various services of your choice.

<p align="center">
  <img src="https://raw.githubusercontent.com/sanneh2/Universal-Status-Monitor/main/img/1.png" alt="Status Monitor">
</p>

The monitoring can be triggered through a cron job with a free independent service. See endpoints below

## Features

Create an incident automatically for the Statuspage component you are monitoring.
Keep a track of the incidents and resolve them automatically if the service comes back in the next periodic check.
Create a daily "Full System Report" incident with the status "Resolved" and "All Systems Operational" title and detailed report in the body (as in the image)
Add a lot of your own services quickly into the automated flow and restart the server

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)
- Atlassian Statuspage account with API key and page ID
- MongoDB URI (if monitoring MongoDB)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/sanneh2/universal-status-monitor.git
```

### Install dependencies:

```bash
cd universal-status-monitor
npm install
```

Create a .env file in the project root and set the necessary environment variables:

```env
STATUSPAGE_API_KEY=<your_statuspage_api_key> #required for Atlassian Statuspage
PAGE_ID=<your_statuspage_page_id> # Your Statuspage ID
MONGODB_URI=<your_mongodb_uri> # (if monitoring MongoDB)
```

Usage
To run the service status monitor, use the following command:

```bash
npm start
```

This will start the server and connect to MongoDB (if applicable).

### Configuration

Start your configuration in the `config/configurations.js` file.
Add or edit the example services in `services/` for example `services/api-example.js`
It takes just the url of your API service and filling up the `.env` file to get up and running

### Services To Monitor

Edit the config/configuration.js file to add or remove services to monitor.
Each service configuration includes a checkFunction for custom status checks.

### Services

The services themselves can be found in the services/ folder. There are a few examples there

- API / web endpoint (GET request to URL with a status code 200 response)
- API with credentials and Authorization headers (optional headers)
- MongoDB connection with URI and ping the connection

### Atlassian Statuspage

Ensure you have a valid Atlassian Statuspage account and obtain the API key and page ID. Set these values in the .env file.

These functions interact with Atlassian Statuspage using the provided API key, page ID, and axios for making HTTP requests.

### Incident Handling

handleServiceStatus(status, service): Universal function that handles multiple service incidents by IDs. It can create new incidents and resolve existing ones based on the provided status and service information.

### Incident Creation and Resolution

createNewIncident(title, status, componentStatus, componentId): Creates a new incident on Atlassian Statuspage with the specified title, status, component status, and component ID.

resolveExistingIncident(incidentId, componentId): Resolves an existing incident on Atlassian Statuspage with the given incident ID and component ID.

createAllSystemsOperationalIncident(componentIds, body): Creates a special incident named "All Systems Operational" with a detailed status report for each specified component ID.

### Endpoints

/cron: Endpoint for the cron job to trigger service monitoring. Recommended every 10-15 minutes.

/daily: Endpoint for the daily system health check. Posts an incident report saying "All Systems Operational." (Recommended every 24 hours at a set time)

/health: Endpoint for the server health check.

### License

This project is licensed under the MIT License.
