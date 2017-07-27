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

import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BinaryClient } from 'binaryjs-client';
import { IEvent } from '../../models/index';
import { environment } from '../../../environments/environment';

// Extend the Window class with the Web Audio API -> AudioContext
// for the different browser types
interface IWindow extends Window {
  webkitAudioContext: any;
  mozAudioContext: any;
  AudioContext: any;
}

// Extend the Navigator class with the MediaStream API -> GetUserMedia
// for the different browser types
interface INavigator extends Navigator {
  webkitGetUserMedia: any;
  mozGetUserMedia: any;
  GetUserMedia: any;
}

@Injectable()
export class GCloudSpeechService {

  private audioContext: AudioContext = null;
  private scriptProcessor: ScriptProcessorNode = null;
  private audioInput: MediaStreamAudioSourceNode = null;

  private userMediaStream: MediaStream = null;

  private speechServerClient: any = null;
  private speechServerStream: any = null;

  private recognizing = false;
  private observer: Observer<IEvent>;

  constructor(private zone: NgZone) {
    this.audioContext = this.createAudioContext();
    this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
  }

  /**
   * Starts the audio capture and sets up a streaming connection to the speech-server, sending the audio
   * for speech recognition on Google Cloud platform.
   * @returns {Observable<IEvent>} Observable that emits any event related to the speech recognition,
   * including the resulting transcript and any error that might occur...
   */
  start(): Observable<IEvent> {
    if (!this.recognizing) {
      this.getUserMedia(this.onaudiostart.bind(this), this.onerror.bind(this));
      this.recognizing = true;
    }

    return new Observable((observer: Observer<IEvent>) => { this.observer = this.observer || observer; });
  }

  /**
   * Stops the audio capture and speech recognition engine.
   */
  stop() {
    // dispose of audio inputs / streams and speech server client
    if (this.audioInput) {
      this.audioInput.disconnect();
    }

    if (this.userMediaStream) {
      this.userMediaStream.getTracks().map((track: any) => {
        track.stop();
      });
    }

    if (this.speechServerClient) {
      this.speechServerClient.close();
      this.speechServerClient = null;
      this.speechServerStream = null;
    }

    if (this.observer) {
      // Give it some time to any additional event to propragate to subscribers...
      setTimeout(() => { this.observer = null; }, 500);
    }

    this.recognizing = false;
  }

  /**
   * Returns true if audio capture is in progress; false, otherwise.
   * @returns {boolean}
   */
  isRecognizing(): boolean {
    return this.recognizing;
  }

  /**
   * Helper function to create AudioContext object supporting multiple browsers' engines.
   */
  private createAudioContext(): any {
    let win: IWindow = <IWindow>window;
    return new (win.AudioContext ||
                win.mozAudioContext ||
                win.webkitAudioContext)();
  };

  /**
   * Helper function to create GetUserMedia object supporting multiple browsers' engines.
   */
  private getUserMedia(successFn: Function, errorFn: Function): any {
    let nav: INavigator = <INavigator>navigator;
    let getUserMedia = nav.GetUserMedia || nav.mozGetUserMedia || nav.webkitGetUserMedia;
    return getUserMedia.call(navigator,
                            { audio: true },
                            successFn,
                            errorFn
    );
  };

  /**
   * Event triggered when the audio capture is under way.
   * This is where the connection to the speech server is established and the
   * input audio stream is piped to the server
   */
  private onaudiostart(stream: any) {
    this.userMediaStream = stream;

    // get all the audio capture, processing and streaming ready to go...
    this.userMediaStream.getTracks().forEach((track: any) => {
        track.onended = this.onaudioend.bind(this);
      }
    );

    this.audioInput = this.audioContext.createMediaStreamSource(this.userMediaStream);
    this.audioInput.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination)
    this.scriptProcessor.onaudioprocess = (event: any) => {
      // we're only using one audio channel here...
      let leftChannel = event.inputBuffer.getChannelData(0);

      if (this.speechServerStream) {
        this.speechServerStream.write(this.convertFloat32ToInt16(leftChannel));
      }
    }

    // connect to the speech server and get stream ready for send / receive data...
    this.speechServerClient = new BinaryClient(environment.speechServerUrl)
    .on('error', this.onerror.bind(this))
    .on('open', () => {
      // pass the sampleRate as a parameter to the server and get a reference to the communication stream.
      this.speechServerStream = this.speechServerClient.createStream({
        type: 'speech',
        sampleRate: this.audioContext.sampleRate
      });
    })
    .on('stream', (serverStream) => {
      serverStream
      .on('data', this.onresult.bind(this))
      .on('error', this.onerror.bind(this))
      .on('close', this.onerror.bind(this))
    });

    // let the subscribers know we're ready!
    this.zone.run(() => {
      this.observer.next({
        type: 'hint',
        value: 'Capturing audio...'
      });
    });
  }

  private onaudioend() {
    this.zone.run(() => {
      this.observer.next({
       type: 'hint',
       value: 'Stopped capturing audio.'
      });
    });
  }

  private onerror(error: any) {
    this.zone.run(() => {
      this.observer.error({
      type: 'error',
      value: typeof(error) === 'string' ? error : 'Couldn\'t connect to speech server.'
      });
    });

    this.stop();
  }

  private onresult(event: any) {
    if (event.error && event.error.message) {
      this.onerror(event.error.message);
    } else {
      this.zone.run(() => {
        this.transcriptText(event);
      });
    }
  }

  /**
   * Basic parsing of the speech recognition result object, emitting 'tag' event for subscribers.
   * @param event The onresult event returned by the SpeechRecognition engine
   */
  private transcriptText(event: any) {
    for (let i = 0; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        this.observer.next({
          type: 'tag',
          value: event.results[i].transcript
        });
      }
    }
  }

  private convertFloat32ToInt16 (buffer) {
    let l = buffer.length;
    let buf = new Int16Array(l);
    while (l >= 0) {
      buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
      l = l - 1;
    }
    return buf.buffer;
  }

}
