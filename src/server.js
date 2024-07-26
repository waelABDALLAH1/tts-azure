const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const utils = require('./utils');
const { textToSpeech } = require('./azure-cognitiveservices-speech');

// fn to create express server
const create = async () => {

    // server
    const app = express();
    app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
    
    // Log request
    app.use(utils.appLogger);

    // root route - serve static file
    app.get('/api/hello', (req, res) => {
        res.json({hello: 'goodbye'});
        res.end();
    });

    // root route - serve static file
    app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/client.html')));

    // creates a temp file on server, the streams to client
/* eslint-disable no-unused-vars */
app.get('/text-to-speech', async (req, res, next) => {
    
    const { key, region, phrase, file } = req.query;
    
    if (!key || !region || !phrase) res.status(404).send('Invalid query string');
    
    let fileName = null;
    
    // stream from file or memory
    if (file && file === true) {
        // eslint-disable-next-line no-undef
        fileName = `./temp/stream-from-file-${timeStamp()}.mp3`;
    }
    
    const audioStream = await textToSpeech(key, region, phrase, fileName);
    res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked'
    });
    audioStream.pipe(res);
});

    // Catch errors
    app.use(utils.logErrors);
    app.use(utils.clientError404Handler);
    app.use(utils.clientError500Handler);
    app.use(utils.errorHandler);

    return app;
};

module.exports = {
    create
};
