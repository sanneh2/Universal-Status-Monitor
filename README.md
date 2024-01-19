# 🚀 Universal Status Monitor

**A versatile Node.js server for monitoring various services and automatically updating Atlassian Status Page components.**

## Overview

This Node.js server is designed to be a universal status monitor, providing a flexible solution for monitoring different services and updating the Atlassian Status Page component accordingly. It supports templating, allowing you to easily adapt it to monitor various services of your choice.

## Prerequisites

Before using the monitor, ensure you have the following:

- Node.js installed
- API credentials for the services you want to monitor
- Atlassian Status Page API key and page ID

## Getting Started

1. Clone this repository:

```bash
   git clone https://github.com/sanneh2/universal-status-monitor.git
```

2. Navigate to the project directory:

```bash
cd universal-status-monitor
```

3. Install dependencies:

```bash
npm install
```

4. Create a .env file in the project root and set the following environment variables:

```env
STATUSPAGE_API_KEY=your_atlassian_statuspage_api_key
PAGE_ID=your_atlassian_statuspage_page_id
SERVICE_API_URL=your_service_api_url
```

Replace placeholders with your actual values.

5. Run the server:

```bash
npm start
```

The server will start running on http://localhost:3000.

## Configuration

`STATUSPAGE_API_KEY`: Your Atlassian Status Page API key.
`PAGE_ID`: Your Atlassian Status Page ID.
`SERVICE_API_URL`: The URL of the service API you want to monitor.

## Templating and Extending

This monitor is highly extensible and can be easily templated to monitor various services. Simply modify the updateStatuspageIncident function in server.js to adapt it to your specific service's API response.

## Automation with Cron

To automate status updates, schedule a cron job to run the monitor at regular intervals:

## Contributing

Feel free to contribute to improve and extend the capabilities of this universal status monitor. Open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
