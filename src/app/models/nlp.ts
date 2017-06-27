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

export enum NLPDocumentType {
  TYPE_UNSPECIFIED,
  PLAIN_TEXT,
  HTML
}

export enum NLPEncodingType {
  NONE,
  UTF8,
  UTF16,
  UTF32
}

export class NLPDocument {
  type: NLPDocumentType;
  language: string;
  content: string;
}

export class NLPFeatures {
  extractSyntax: boolean;
  extractEntities: boolean;
  extractDocumentSentiment: boolean;
}

export class NLPSpeechAnalysis {
  json: string;
  tags: NLPSpeechAnalysisTag[];
  sentiment: NLPSpeechAnalysisSentiment;

  constructor(data: any) {
    this.json = JSON.stringify(data, null, 2);
    this.sentiment = {
      score: data.documentSentiment.score,
      magnitude: data.documentSentiment.magnitude
    }
    this.tags = [];

    for (let entity of data.entities) {
      if (entity.name !== 'name') {
        this.tags.push(<NLPSpeechAnalysisTag>{
          name: entity.name,
          type: entity.type,
          wikipedia_url: entity.metadata.wikipedia_url
        });
      }
    }
  }
}

export class NLPSpeechAnalysisTag {
  name: string;
  type: string;
  wikipedia_url: string;
}

export class NLPSpeechAnalysisSentiment {
  score: number;
  magnitude: number;
}
