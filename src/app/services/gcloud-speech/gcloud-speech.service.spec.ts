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

import { inject, fakeAsync, tick, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { GCloudSpeechService } from '../index';

describe('GCloudNLPService', () => {
  let fakeTestObject: any = { dummy: 1 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GCloudSpeechService,
      ]
    });
  });

  describe('start', () => {
    it('should start recognizing and return observable',
      inject([GCloudSpeechService], fakeAsync((service: GCloudSpeechService) => {
        let spy = spyOn(<any>service, 'getUserMedia');
        let observable = service.start();
        tick();

        expect(spy).toHaveBeenCalled();
        expect(observable).toEqual(jasmine.any(Observable));
        expect(service.isRecognizing()).toBeTruthy();
      }))
    );
  });

});
