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

import { Component, OnInit, Inject } from '@angular/core';
import { MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-alert',
  templateUrl: 'dialog-alert.component.html',
})
export class DialogAlertComponent {
  title = 'Alert'
  text = 'Oops! Something wrong happened...';

  constructor(public dialogRef: MdDialogRef<DialogAlertComponent>,
              @Inject(MD_DIALOG_DATA) private data: any) {
    if (data) {
      this.title = data.title;
      this.text = data.text;
    }
  }
}
