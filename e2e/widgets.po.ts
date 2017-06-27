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

import { browser, by, element } from 'protractor';

export class PageWidgetsComponent {
  readonly titles: string[] = [
    'WEB SPEECH API', 'GCLOUD SPEECH API', 'GCLOUD VISION API'
  ];

  navigateTo() {
    return browser.get('/');
  }

  getAllWidgetsTitles() {
    return element(by.css('page-widgets')).all(by.css('.title'));
  }

  shouldHaveAllWidgets() {
    let widgets = this.getAllWidgetsTitles();
    widgets.count().then((count) => {
      expect(count).toEqual(this.titles.length);
    });

    widgets.each((title, index) => {
      title.getText().then((text: string) => {
        expect(this.titles).toContain(text);
      });
    })
  }
}
