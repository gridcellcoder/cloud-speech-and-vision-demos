/**
Copyright 2017 GridCell Ltd

Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

import { environment } from './environment';
import * as Speech from '@google-cloud/speech';
import * as binaryjs from 'binaryjs';

// Instantiates the speech client and binary websocket server
const speechClient = Speech({
  projectId: environment.gCloudProjectId
});
const port = Number(process.env.PORT || 8000);
const server = new binaryjs.BinaryServer({
  port: port
});

// The audio file's encoding, sample rate in hertz, and BCP-47 language code
let options = {
  config: {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
    sampleRateHertz: 16000
  },
  singleUtterance: false,
  interimResults: false,
  verbose: true
};

// handle client connections
server
.on('error', (error) => { console.log('Server error:' + error); })
.on('close', () => { console.log('Server closed'); })
.on('connection', (client) => {
  client
  .on('error', (error) => { console.log('Client error: ' + error); })
  .on('close', () => { console.log('Client closed.'); })
  .on('stream', (clientStream, meta) => {
    console.log('New Client: ' + JSON.stringify(meta));

    if (meta.type === 'speech') {
      handleSpeechRequest(client, clientStream, meta);
    } else {
      handleRandomUtteranceRequest(client);
    }
  });
});

function handleSpeechRequest(client, clientStream, meta) {
  options.config.sampleRateHertz = meta.sampleRate;

  let speechStream = speechClient.createRecognizeStream(options)
  .on('error', (data) => { handleGCSMessage(data, client, speechStream); })
  .on('data', (data) => { handleGCSMessage(data, client, speechStream); })
  .on('close', () => { client.close(); });

  clientStream.pipe(speechStream);
}

function handleRandomUtteranceRequest(client) {
  let data = getRandomSentence();
  console.log(data);

  try {
    client.send(data);
  } catch (ex) {
    console.log('Failed to send message back to client...Closed?');
  }
}

function handleGCSMessage(data, client, speechStream) {
  if (client && client.streams[0] &&
      client.streams[0].writable && !client.streams[0].destroyed) {
    try {
      console.log(data);

      client.send(data);
    } catch (ex) {
      console.log('Failed to send message back to client...Closed?');
    }
    if (data.error || data.Error) {
      try {
        speechStream.end();
        speechStream = null;
        client.close();
        client = null;
      } catch (ex) {
        console.log('ERROR closing the streams after error!');
      }
    }
  }
}

function getRandomSentence(): any {
  let random = Math.round(Math.random() * 10);
  switch (random) {
    case 0:
      return {
        text: 'The old apple revels in its authority.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Male'
      };
    case 1:
      return {
        text: 'Don\'t step on the broken glass.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Male'
      };
    case 2:
      return {
        text: 'I will never be this young again. Ever. Oh damn… I just got older.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Male'
      };
    case 3:
      return {
        text: 'There was no ice cream in the freezer, nor did they have money to go to the store.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Male'
      };
    case 4:
      return {
        text: 'I think I will buy the red car, or I will lease the blue one.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Male'
      };
    case 5:
      return {
        text: 'He didn’t want to go to the dentist, yet he went anyway.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Male'
      };
    case 6:
      return {
        text: 'We have never been to Asia, nor have we visited Africa.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Female'
      };
    case 7:
      return {
        text: 'How was the math test?',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Female'
      };
    case 8:
      return {
        text: 'Tom got a small piece of pie.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Female'
      };
    case 9:
      return {
        text: 'The book is in front of the table.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Female'
      };
    case 10:
      return {
        text: 'Check back tomorrow; I will see if the book has arrived.',
        lang: 'en-US', pitch: 1, rate: 1, volume: 1, voiceName: 'Google UK English Female'
      };
  }
}

