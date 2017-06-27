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
import { MockBackend, MockConnection } from '@angular/http/testing';
import {
  Http,
  BaseRequestOptions,
  Response,
  ResponseOptions, RequestMethod, Headers
} from '@angular/http';

import { GCloudNLPService } from '../index';
import {
  NLPDocument,
  NLPDocumentType,
  NLPEncodingType,
  NLPFeatures,
  NLPSpeechAnalysis
} from '../../models/index';
import { environment } from '../../../environments/environment';

describe('GCloudNLPService', () => {
  let document: NLPDocument = {
    type: NLPDocumentType.PLAIN_TEXT,
    language: 'en-US',
    content: 'text'
  };
  let features: NLPFeatures = {
    extractSyntax: true,
    extractEntities: true,
    extractDocumentSentiment: true
  }
  let fakeTestObject: any = { dummy: 1 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GCloudNLPService,
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }, deps: [MockBackend, BaseRequestOptions]
        },
      ]
    });
  });

  function prepareMockBackendToReturnResponseAndExpectHTTPStuff(backend: MockBackend, method: RequestMethod, url: string, body?: any) {
    backend.connections.subscribe((connection: MockConnection) => {
      expect(connection.request.method).toBe(method);
      expect(connection.request.url).toBe(url + '?key=' + environment.gCloudProjectApiKey);
      if (body) {
        expect(connection.request.getBody()).toBe(JSON.stringify(body, null, 2));
      }

      let response = new ResponseOptions({ body: JSON.stringify(fakeTestObject) });
      connection.mockRespond(new Response(response));
    });
  }

  function prepareMockBackendToFailAuthentication(backend: MockBackend) {
    backend.connections.subscribe((connection: MockConnection) => {
      let response = new ResponseOptions({ status: 401, statusText: 'Not Authorized' });
      connection.mockRespond(new Response(response));
    });
  }

  function prepareMockBackendToReturnError(backend: MockBackend) {
    backend.connections.subscribe((connection: MockConnection) => {
      let response = new ResponseOptions({ body: JSON.stringify(fakeTestObject) });
      connection.mockError(new Error('Error.'));
    });
  }


  describe('annotateText', () => {
    it('should query the REST endpoint successfully',
      inject([GCloudNLPService, MockBackend], fakeAsync((service: GCloudNLPService, backend: MockBackend) => {
        prepareMockBackendToReturnResponseAndExpectHTTPStuff(backend,
                                                             RequestMethod.Post,
                                                             environment.gCloudNLPApiUrl,
                                                             {document: document, features: features, encodingType: NLPEncodingType.UTF16});

        service.annotateText(document, features, NLPEncodingType.UTF16).subscribe((res) => {
          expect(res).toBeDefined();
        });
        tick();
      }))
    );

    it('should throw exception if invalid API KEY is passed or no longer valid',
      inject([GCloudNLPService, MockBackend], fakeAsync((service: GCloudNLPService, backend: MockBackend) => {
        prepareMockBackendToFailAuthentication(backend);

        service.annotateText(document, features, NLPEncodingType.UTF16).subscribe((res) => {
          expect(res.status).toBe(401);
        }, (error) => {
          expect(error.message).toBe('Not Authorized.');
        });
        tick();
      }))
    );

    it('should catch server error after enough time for retries',
      inject([GCloudNLPService, MockBackend], fakeAsync((service: GCloudNLPService, backend: MockBackend) => {
        prepareMockBackendToReturnError(backend);

        let errorCaught = false;
        service.annotateText(document, features, NLPEncodingType.UTF16).subscribe((res) => {
          expect(1).toBe(2); // this should never happen
        }, (error) => {
          expect(error.message).toBe('Error.');
          errorCaught = true;
        });

        expect(errorCaught).toBeTruthy();
      }))
    );
  });

});
