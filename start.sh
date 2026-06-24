#!/bin/sh

# Ensure prisma client is generated
npx prisma generate

# Start the MQTT background service in the background
node services/mqttIngestion.js &

# Start the Next.js standalone server
HOSTNAME="0.0.0.0" node server.js
