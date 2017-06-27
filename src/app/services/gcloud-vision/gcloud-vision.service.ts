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
import { VisionAnnotateRequest, VisionFeature } from '../../models/index';
import { environment } from '../../../environments/environment';


@Injectable()
export class GCloudVisionService {

  constructor(public http: Http) { }

  /**
   * Ask google process the image passed.
   * @param imageBase64 Contains the image to be processed / analysed in base64 format.
   * @param features What exactly do we want to analyse the document for (specific features? or all?)
   * @returns { Observable } Response from Google Cloud
   */
  annotateImage(imageBase64: string, features: VisionFeature[]): Observable<any> {
    let options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });

    let request: VisionAnnotateRequest = {
      requests: [
        {
          image: {
            content: imageBase64
          },
          features: features
        }
      ]
    };

    return this.http.post(environment.gCloudVisionApiUrl + '?key=' + environment.gCloudProjectApiKey,
                          request)
            .map((res: Response) => {
              if (res.status === 401) {
                throw Error('Not Authorized.');
              } else {
                return res.json();
              }
            });
  }

}
