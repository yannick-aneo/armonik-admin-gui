import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormNameLineComponent } from './form-name-line.component';
import { EditNameLineData, Line, StatusLabeled } from '../types';

@Component({
  selector: 'app-edit-statuses-group-dialog',
  template: `
<h2 mat-dialog-title i18n="Dialog title">Edit name line </h2>

<app-form-name-line
  [line]="line"
  (cancelChange)="onNoClick()"
  (submitChange)="onSubmit($event)"
></app-form-name-line>
  `,
  styles: [`
  `],
  standalone: true,
  providers: [
  ],
  imports: [
    FormNameLineComponent,
    MatDialogModule,
  ]
})
export class EditNameLineDialogComponent  {
  line: Line; 
  statuses: StatusLabeled[] = [];

  constructor(
    public _dialogRef: MatDialogRef<EditNameLineDialogComponent, string>,
    @Inject(MAT_DIALOG_DATA) public data: EditNameLineData,
  ) {}

  

  onSubmit(result: string) {
    this._dialogRef.close(result);
  }

  onNoClick(): void {
    this._dialogRef.close();
  }
}
