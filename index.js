/**
 * (c) 2017 Radio France
 * This program is free software: you can redistribute it and/or modify it under the terms of the CeCILL-B license
 */

/* eslint-disable no-console */
const Forwarder = require('./lib/Forwarder')
const config = require('./config.json');

function printDate() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
}

const server = new Forwarder({
    // The servers to forward the request to
    targets: config.targets,
    // Define the forwarder response statusCode (default: 200)
    responseStatusCode: 200
})

server.listen(config.port)

console.log(`[${printDate()}] listening on port ${config.port}`)
console.log(`[${printDate()}] targets : ${config.targets}`)
if (Array.isArray(config.allowedEndpoints) && config.allowedEndpoints.length) {
    console.log(`[${printDate()}] allowed endpoints : ${config.allowedEndpoints}`)
} else {
    console.warn(`[${printDate()}] all endpoints are allowed`)
}

server.on('request', (inc, resp) => {
    if (Array.isArray(config.allowedEndpoints) && config.allowedEndpoints.length) {
        const isAllowed = config.allowedEndpoints.find(function (endpoint) {
            return inc.url.includes(endpoint);
        })
        if (!isAllowed) {
            console.log(`[${printDate()}] Request not allowed : ${inc.url}}`)
            resp.end()
        }
    }
})

server.on('requestContents', (inc, payload) => {
    console.log(`[${printDate()}] Request method : ${inc.method}`)
    console.log(`[${printDate()}] Request url : ${inc.url}}`)
    console.log(`[${printDate()}] Request payload : ${payload}`)
})

// Capture responses from each of the targets
server.on('forwardResponse', (req, inc) => {
    console.log(`[${printDate()}] ${req.getHeader('host')} responded: ${inc.statusCode} : ${inc.statusMessage}`)
})

// Capture errors in any of the targets
server.on('forwardRequestError', (err, req) => {
    console.log(`[${printDate()}] ${req.getHeader('host')} failed: ${err.code} ${err.message}`)
})
