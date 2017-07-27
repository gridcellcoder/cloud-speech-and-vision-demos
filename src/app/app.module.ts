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

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '@angular/material';
import { AgmCoreModule } from '@agm/core';
import { BusyModule, BusyConfig } from 'angular2-busy';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DialogAlertComponent } from './components/index';
import { PageWidgetsComponent } from './pages/index';
import { WebSpeechService,
  WebSynthService,
  GCloudSpeechService,
  GCloudNLPService,
  GCloudVisionService } from './services/index';

import { environment } from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent,

    DialogAlertComponent,

    PageWidgetsComponent,
  ],
  entryComponents: [ DialogAlertComponent ],
  imports: [
    AppRoutingModule,

    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    AgmCoreModule.forRoot({
      apiKey: environment.gCloudProjectApiKey
    }),
    BusyModule.forRoot({
      message: '',
      backdrop: true,
      template: '<div class="loading-animation"><img src="./assets/img/loading.svg" alt="busy" /></div>',
      delay: 200,
      minDuration: 250,
      wrapperClass: 'ng-busy'
    })
  ],
  providers: [
    WebSpeechService,
    WebSynthService,
    GCloudNLPService,
    GCloudSpeechService,
    GCloudVisionService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
