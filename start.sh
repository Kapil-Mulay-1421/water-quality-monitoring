#!/bin/sh

# Prisma client is generated at build time inside the image

# Start the MQTT background service in the background
node services/mqttIngestion.js &

# Start the sensor simulator in the background
node scripts/simulateSensors.js &

# Start the Next.js standalone server
HOSTNAME="0.0.0.0" node server.js
