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

export enum VisionFeatureType {
  // TYPE_UNSPECIFIED = 0,
  FACE_DETECTION = 1,
  LANDMARK_DETECTION = 2,
  LOGO_DETECTION = 3,
  LABEL_DETECTION = 4,
  TEXT_DETECTION = 5,
  DOCUMENT_TEXT_DETECTION = 6,
  SAFE_SEARCH_DETECTION = 7,
  IMAGE_PROPERTIES = 8,
  CROP_HINTS = 9,
  WEB_DETECTION = 10
}

export class VisionAnnotateRequest {
  requests: VisionRequest[];
}

export class VisionRequest {
  image: VisionImageContent;
  features: VisionFeature[];
}

export class VisionImageContent {
  content: string;
  // source: any;
}

export class VisionFeature {
  type: VisionFeatureType;
  maxResults: number;
}
