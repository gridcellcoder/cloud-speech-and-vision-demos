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

import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BinaryClient } from 'binaryjs-client';
import { IEvent } from '../../models/index';
import { environment } from '../../../environments/environment';

// Extend the Window class with the Web Audio API -> SpeechSynthesis engine
// for the different browser types
interface IWindow extends Window {
  webkitSpeechSynthesis: any;
  mozSpeechSynthesis: any;
  msSpeechSynthesis: any;
  speechSynthesis: any;
}

@Injectable()
export class WebSynthService {

  private engine: any = null;
  private utterThis: SpeechSynthesisUtterance;

  private speechServerClient: any = null;
  private speechServerStream: any = null;

  private busy = false;
  private observer: Observer<IEvent>;

  constructor(private zone: NgZone) {
    this.create();
  }

  /**
   * Starts the speech synthetiser engine. First asks server for random sentence and speaks it out loud.
   * @returns {Observable<IEvent>} Observable that emits any event related to the speech synth,
   * including the utterance to be spoken and any error that might occur...
   */
  start(): Observable<IEvent> {
    if (!this.isSpeaking()) {
      this.getUtteranceAndSpeak();
    }
    return new Observable((observer: Observer<IEvent>) => { this.observer = this.observer || observer; });
  }

  /**
   * Stops the speech synthetiser engine removing any utterances from the queue.
   */
  stop() {
    this.engine.cancel();

    if (this.speechServerClient) {
      this.speechServerClient.close();
      this.speechServerClient = null;
      this.speechServerStream = null;
    }

    if (this.observer) {
      // Give it some time to any additional event to propragate to subscribers...
      setTimeout(() => { this.observer = null; }, 100);
    }
  }

  /**
   * Returns true if a utterance is being spoken; false, otherwise.
   * @returns {boolean}
   */
  isSpeaking(): boolean {
    return this.busy || this.engine.speaking;
  }

  /**
   * Helper function to create SpeechSynthetiser engine and bind relevant events.
   */
  private create() {
    this.engine = this.createSynth();
    this.utterThis = new SpeechSynthesisUtterance();

    this.utterThis.onstart = this.onstart.bind(this);
    this.utterThis.onend = this.onend.bind(this);
    this.utterThis.onerror = this.onerror.bind(this);
  }

  private getUtteranceAndSpeak() {
    // connect to the speech server and get stream ready for send / receive data...
    this.speechServerClient = new BinaryClient(environment.speechServerUrl)
    .on('error', this.onerror.bind(this))
    .on('open', () => {
      // special initial message to request random utterance.
      this.speechServerStream = this.speechServerClient.createStream({ type: 'random_utterance' });
    })
    .on('stream', (serverStream) => {
      serverStream
      .on('data', this.onutterance.bind(this))
      .on('error', this.onerror.bind(this))
      .on('close', this.onerror.bind(this))
    });
  }

  /**
   * Helper function to create SpeechSynthetiser object supporting multiple browsers' engines.
   */
  private createSynth(): SpeechSynthesis {
    const win: IWindow = <IWindow>window;
    return (win.webkitSpeechSynthesis ||
            win.mozSpeechSynthesis ||
            win.msSpeechSynthesis ||
            win.speechSynthesis);
  };

  private onstart() {
    this.busy = false;

    this.zone.run(() => {
      this.observer.next({
        type: 'start',
        value: 'Speaking utterance...'
      });
    });
  }

  private onend() {
    this.zone.run(() => {
      this.observer.next({
        type: 'end',
        value: 'Finished speaking.'
      });
    });
  }

  private onerror(event: any) {
    this.zone.run(() => {
      this.observer.error({
       type: 'error',
       value: 'Failed to get utterance from speech server.'
      });
    });

    this.stop();
  }

  private onutterance(utterance: any) {
    Object.assign(this.utterThis, utterance);
    let voice = (<SpeechSynthesis>this.engine).getVoices().find((v: SpeechSynthesisVoice) => {
      return v.name === utterance.voiceName;
    });
    this.utterThis.voice = voice;

    this.engine.speak(this.utterThis);

    this.zone.run(() => {
      this.observer.next({
        type: 'tag',
        value: utterance.text
      });
    });
  }
}
