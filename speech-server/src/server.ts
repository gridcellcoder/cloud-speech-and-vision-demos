/*
 * Copyright (c) 2017. GridCell Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
    options.config.sampleRateHertz = meta.sampleRate;

    let speechStream = speechClient.createRecognizeStream(options)
    .on('error', (data) => { handleGCSMessage(data, client, speechStream); })
    .on('data', (data) => { handleGCSMessage(data, client, speechStream); })
    .on('close', () => { client.close(); });

    clientStream.pipe(speechStream);
  });
});

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

