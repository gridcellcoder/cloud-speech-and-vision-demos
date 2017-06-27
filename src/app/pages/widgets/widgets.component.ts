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

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DialogAlertComponent } from '../../components/index';
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import {
  WebSpeechService,
  GCloudSpeechService,
  GCloudNLPService,
  GCloudVisionService
} from '../../services/index';
import {
  NLPDocument,
  NLPDocumentType,
  NLPEncodingType,
  NLPFeatures,
  NLPSpeechAnalysis,
  VisionFeatureType,
  VisionFeature
} from '../../models/index';


@Component({
  selector: 'page-widgets',
  templateUrl: './widgets.component.html'
})
export class PageWidgetsComponent implements OnInit, OnDestroy {

  webSpeechSubscription: Subscription;
  webSpeechTranscript: string;
  webSpeechAnalysis: NLPSpeechAnalysis;

  gCloudSpeechSubscription: Subscription;
  gCloudSpeechTranscript: string;
  gCloudSpeechAnalysis: NLPSpeechAnalysis;

  gCloudVisionSubscription: Subscription;
  gCloudVisionAnalysis: string;
  gCloudVisionLocation: any;

  selectedVisionFeatures: string[];

  constructor(
    private webSpeechService: WebSpeechService,
    private gCloudSpeechService: GCloudSpeechService,
    private gCloudNLPService: GCloudNLPService,
    private gCloudVisionService: GCloudVisionService,
    private dialog: MdDialog) { }

  ngOnInit() {
    this.selectedVisionFeatures = [];
  }

  ngOnDestroy() {
    this.stopWebSpeech();
    this.stopGCloudSpeech();
  }

  toggleWebSpeech() {
    if (this.webSpeechService.isRecognizing()) {
      this.stopWebSpeech();
    } else {
      this.startWebSpeech();
    }
  }

  toggleGCloudSpeech() {
    if (this.gCloudSpeechService.isRecognizing()) {
      this.stopGCloudSpeech();
    } else {
      this.startGCloudSpeech();
    }
  }

  startWebSpeech() {
    this.webSpeechTranscript = null;
    this.webSpeechAnalysis = null;
    this.webSpeechSubscription = this.webSpeechService.start().subscribe((data: any) => {
      console.log('WebSpeechAPI: ' + JSON.stringify(data));
      if (data.type === 'tag') {
        this.webSpeechTranscript = data.value;
        this.stopWebSpeech(); // we want to get the first result and stop listening...

        this.webSpeechAnalyseTranscript();
      }
    }, (error: any) => {
      console.log('WebSpeechAPI: ' + JSON.stringify(error));
      this.stopWebSpeech();
      this.showAlert('Oops! Something wrong happened:', error.value, this.startWebSpeech.bind(this));
    });
  }

  startGCloudSpeech() {
    this.gCloudSpeechTranscript = null;
    this.gCloudSpeechAnalysis = null;
    this.gCloudSpeechSubscription = this.gCloudSpeechService.start().subscribe((data: any) => {
      console.log('GCloudSpeechAPI: ' + JSON.stringify(data));
      if (data.type === 'tag') {
        this.gCloudSpeechTranscript = data.value;
        this.stopGCloudSpeech(); // we want to get the first result and stop listening...

        this.gCloudSpeechAnalyseTranscript();
      }
    }, (error: any) => {
      console.log('GCloudSpeechAPI: ' + JSON.stringify(error));
      this.stopGCloudSpeech();
      this.showAlert('Oops! Something wrong happened:', error.value, this.startGCloudSpeech.bind(this));
    });
  }

  stopWebSpeech() {
    this.webSpeechService.stop();
    if (this.webSpeechSubscription) {
      this.webSpeechSubscription.unsubscribe();
      this.webSpeechSubscription = null;
    }
  }

  stopGCloudSpeech() {
    this.gCloudSpeechService.stop();
    if (this.gCloudSpeechSubscription) {
      this.gCloudSpeechSubscription.unsubscribe();
      this.gCloudSpeechSubscription = null;
    }
  }

  webSpeechAnalyseTranscript() {
    if (this.webSpeechTranscript) {
      this.webSpeechSubscription = this.analyseSpeech(this.webSpeechTranscript).first().subscribe((speechAnalysis: any) => {
        this.webSpeechAnalysis = new NLPSpeechAnalysis(speechAnalysis);
        console.log('WebSpeechAPI: ' + this.webSpeechAnalysis.json);

        this.webSpeechSubscription.unsubscribe();
        this.webSpeechSubscription = null;
      }, (error: any) => {
        console.error('WebSpeechAPI: ' + error);
      });
    } else {
      this.webSpeechAnalysis = null;
    }
  }

  gCloudSpeechAnalyseTranscript() {
    if (this.gCloudSpeechTranscript) {
      this.gCloudSpeechSubscription = this.analyseSpeech(this.gCloudSpeechTranscript).first().subscribe((speechAnalysis: any) => {
        this.gCloudSpeechAnalysis = new NLPSpeechAnalysis(speechAnalysis);
        console.log('GCloudSpeechAPI: ' + this.gCloudSpeechAnalysis.json);

        this.gCloudSpeechSubscription.unsubscribe();
        this.gCloudSpeechSubscription = null;
      }, (error: any) => {
        console.error('GCloudSpeechAPI: ' + error);
      });
    } else {
      this.gCloudSpeechAnalysis = null;
    }
  }

  speechAnalysisSave(speechAnalysis: NLPSpeechAnalysis) {
    alert('Not implemented.');
  }

  fileChange(event: any) {
    this.gCloudVisionAnalysis = null;
    this.gCloudVisionLocation = null;

    this.readFileInputAsBase64(event.target).first().subscribe(
      (base64: string) => {
        let features: VisionFeature[] = this.selectedVisionFeatures.map((feature: string) => {
          return <VisionFeature>{
            type: VisionFeatureType[feature],
            maxResults: 3
          };
        });
        this.gCloudVisionSubscription = this.gCloudVisionService.annotateImage(base64, features).first().
          subscribe((response: any) => {
            this.gCloudVisionAnalysis = JSON.stringify(response, null, 2);
            // Check if a landmark location was return...if so, display it on a map
            if (response.responses[0].landmarkAnnotations && response.responses[0].landmarkAnnotations[0].locations) {
              this.gCloudVisionLocation = response.responses[0].landmarkAnnotations[0].locations[0].latLng;
            }

            this.gCloudVisionSubscription.unsubscribe();
            this.gCloudVisionSubscription = null;
          });
      },
      (error: any) => {
        console.log('VISION: ' + error);
      }
    );
  }

  /**
   * Convert VisionFeatureType enum into an array to be used by the template (select options)
   */
  getVisionFeatureKeys(): string[] {
    let keys = Object.keys(VisionFeatureType);
    // a enum has both numeric and string keys and we only want the latter
    return keys.slice(keys.length / 2);
  }

  private analyseSpeech(text: string): Observable<any> {
    let document: NLPDocument = {
      type: NLPDocumentType.PLAIN_TEXT,
      language: 'en-US',
      content: text
    };
    let features: NLPFeatures = {
      extractSyntax: true,
      extractEntities: true,
      extractDocumentSentiment: true
    }

    return this.gCloudNLPService.annotateText(document, features, NLPEncodingType.UTF16);
  }

  private showAlert(title: string, text: string, retryCallback: Function) {
    let dialogRef = this.dialog.open(DialogAlertComponent, {
      data: {
        title: title,
        text: text
      }
    });
    dialogRef.afterClosed().subscribe((retry) => {
      if (retry) {
        retryCallback();
      }
    });
  }

  private readFileInputAsBase64(input: any): Observable<string> {
    return new Observable((observer: Observer<any>) => {
      let file: File = input.files[0];
      if (file) {
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
          let base64 = myReader.result.substring(myReader.result.indexOf(',') + 1);
          observer.next(base64);
          observer.complete();
        }
        myReader.readAsDataURL(file);
      } else {
        observer.error('No file selected.');
      }
    });
  }
}
