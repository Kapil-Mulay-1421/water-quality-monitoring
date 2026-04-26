#!/bin/sh
# Start the MQTT Ingestion Service in the background
node services/mqttIngestion.js &

# Start the Next.js application in the foreground
node server.js
