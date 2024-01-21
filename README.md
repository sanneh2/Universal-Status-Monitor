# 🚀 Universal Status Monitor

**This Node.js application serves as a service status monitor, allowing you to check the status of various services, including APIs and MongoDB. It interacts with Atlassian Statuspage to report service incidents.**

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Configuration](#configuration)
- [Endpoints](#endpoints)
- [Server Health Check](#server-health-check)
- [License](#license)

## Overview

This service status monitor is built using Node.js and Express. It checks the status of configured services, such as APIs and MongoDB, and reports incidents to Atlassian Statuspage. The monitoring can be triggered through a cron job.

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)
- Atlassian Statuspage account with API key and page ID
- MongoDB URI (if monitoring MongoDB)

### Installation

1. Clone the repository:

```bash
git clone <repository_url>
```

## Install dependencies:

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

## Configuration

# Services To Monitor

Edit the config/configuration.js file to add or remove services to monitor.
Each service configuration includes a checkFunction for custom status checks.

# Services

The services themselves can be found in the services/ folder. There are a few examples there

- API / web endpoint (GET request to URL with a status code 200 response)
- API with credentials and Authorization headers (optional headers)
- MongoDB connection with URI and ping the connection

## Atlassian Statuspage

Ensure you have a valid Atlassian Statuspage account and obtain the API key and page ID. Set these values in the .env file.

These functions interact with Atlassian Statuspage using the provided API key, page ID, and axios for making HTTP requests.

# Core Functionality

The core functionality of this service status monitor includes creating, resolving, and handling incidents on Atlassian Statuspage. It provides the following key features:

# Incident Handling

handleServiceStatus(status, service): Universal function that handles multiple service incidents by IDs. It can create new incidents and resolve existing ones based on the provided status and service information.

# Incident Creation and Resolution

createNewIncident(title, status, componentStatus, componentId): Creates a new incident on Atlassian Statuspage with the specified title, status, component status, and component ID.

resolveExistingIncident(incidentId, componentId): Resolves an existing incident on Atlassian Statuspage with the given incident ID and component ID.

createAllSystemsOperationalIncident(componentIds, body): Creates a special incident named "All Systems Operational" with a detailed status report for each specified component ID.

## Server Implementation

The server implementation uses Express.js to handle endpoints for service monitoring and system health checks.

# Endpoints

/cron: Endpoint for the cron job to trigger service monitoring. Recommended every 10-15 minutes.

/daily: Endpoint for the daily system health check. Posts an incident report saying "All Systems Operational." (Recommended every 24 hours at a set time)

/health: Endpoint for the server health check.

# Middleware

monitorMiddleware(req, res, next): Middleware function for monitoring service status. Checks the status of configured services and reports incidents to Atlassian Statuspage.

dailyReportMiddleware(req, res, next): Middleware function for the daily system health check. Posts an incident report saying "All Systems Operational" if all services are operational.

## Environment Variables:

Set the necessary environment variables in the .env file, including the Atlassian Statuspage API key, page ID, and MongoDB URI (if applicable).

# Server Health Check

Visit /health to check the health of the server. It should respond with "OK" if the server is running.

## License

This project is licensed under the MIT License.
