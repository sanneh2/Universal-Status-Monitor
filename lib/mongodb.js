const { MongoClient } = require("mongodb");
require("dotenv").config(); // Load environment variables from .env file

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

function getClient() {
  return client;
}

module.exports = {
  connectToMongoDB,
  getClient,
};
