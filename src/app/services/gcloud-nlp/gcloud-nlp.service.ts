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

import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseOptions  } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { NLPDocument, NLPFeatures, NLPEncodingType } from '../../models/index';
import { environment } from '../../../environments/environment';

@Injectable()
export class GCloudNLPService {

  constructor(public http: Http) { }

  /**
   * Ask google to do a Natural Language Processing / Analysis of the document passed
   * @param document Contains the text to be processed / analysed.
   * @param features What exactly do we want to analyse the document for (specific features? or all?)
   * @param encodingType The text encoding type
   * @returns { Observable } Response from Google Cloud
   */
  annotateText(document: NLPDocument, features: NLPFeatures, encodingType: NLPEncodingType): Observable<any> {
    return this.http.post(environment.gCloudNLPApiUrl + '?key=' + environment.gCloudProjectApiKey,
                          { document: document, features: features, encodingType: encodingType})
            .map((res: Response) => {
              if (res.status === 401) {
                throw Error('Not Authorized.');
              } else {
                return res.json();
              }
            });
  }
}
