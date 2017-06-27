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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { AgmCoreModule } from '@agm/core';
import { BusyModule, BusyConfig } from 'angular2-busy';
import { PageWidgetsComponent } from './widgets.component';
import { WebSpeechService,
  GCloudSpeechService,
  GCloudNLPService,
  GCloudVisionService } from '../../services/index';

class MockWebSpeechService {
  start() { }
  stop() { }
  isRecognizing() { };
}
class MockGCloudSpeechService {
  start() { }
  stop() { }
  isRecognizing() { };
}
class MockGCloudNLPService {
  annotateText() { }
}
class MockGCloudVisionService {
  annotateImage() { }
}

describe('PageWidgetsComponent', () => {
  let component: PageWidgetsComponent;
  let fixture: ComponentFixture<PageWidgetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PageWidgetsComponent,
      ],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        MaterialModule,
        AgmCoreModule.forRoot(),
        BusyModule
      ],
      providers: [
        {provide: WebSpeechService, useClass: MockWebSpeechService},
        {provide: GCloudSpeechService, useClass: MockGCloudSpeechService},
        {provide: GCloudNLPService, useClass: MockGCloudNLPService},
        {provide: GCloudVisionService, useClass: MockGCloudVisionService},
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle web speech', () => {
    let result = true;
    let spy1 = spyOn((<any>component).webSpeechService, 'isRecognizing').and.callFake(() => { return result; });
    let spy2 = spyOn(component, 'stopWebSpeech');
    let spy3 = spyOn(component, 'startWebSpeech');

    component.toggleWebSpeech();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();

    result = false;
    component.toggleWebSpeech();
    expect(spy1).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });
});
