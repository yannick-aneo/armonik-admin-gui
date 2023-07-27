import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AddNameLineDialogData } from '@app/types/dialog';
import { FormNameLineComponent } from './form-name-line.component';

@Component({
  selector: 'app-add-line-dialog',
  template: `
<h2 mat-dialog-title i18n="Dialog title">Add a new line</h2>

<app-form-name-line
  [line]="null"
  (cancelChange)="onNoClick()"
  (submitChange)="onSubmit($event)"
></app-form-name-line>
  `,
  styles: [`
  `],
  standalone: true,
  providers: [],
  imports: [
    MatDialogModule,
    FormNameLineComponent
  ]
})
export class AddNameLineDialogComponent implements OnInit { 
  name: string;

  constructor(
    public _dialogRef: MatDialogRef<AddNameLineDialogComponent, string>,
    @Inject(MAT_DIALOG_DATA) public data: AddNameLineDialogData,
  ) {}

  ngOnInit(): void {
    this.name = this.data.name;
  }

  onSubmit(result: string) {
    this._dialogRef.close(result);
  }

  onNoClick(): void {
    this._dialogRef.close();
  }
}
