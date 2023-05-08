import { NgFor } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatGridListModule } from "@angular/material/grid-list";
import { ModifyColumnsDialogData, ApplicationColumn } from "../types";

@Component({
  selector: 'app-add-columns-dialog',
  template: `<h2 mat-dialog-title>Modify Columns</h2>

  <mat-dialog-content>
    <p>Check box to add or remove a column</p>

    <div class="columns">
      <ng-container *ngFor="let column of availableColumns(); let index = index; trackBy:trackByColumn">
          <mat-checkbox [value]="column" (change)="updateColumn($event, column)" [checked]="isSelected(column)">{{ column }}</mat-checkbox>
      </ng-container>
    </div>
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-button (click)="onNoClick()">Cancel</button>
    <button mat-flat-button [mat-dialog-close]="columns" color="primary">Valider</button>
  </mat-dialog-actions>
  `,
  styles: [`
  .columns {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  `],
  standalone: true,
  imports: [
    NgFor,
    MatGridListModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule
  ]
})
export class ModifyColumnsDialogComponent implements OnInit {
  columns: ApplicationColumn[] = [];

  constructor(public dialogRef: MatDialogRef<ModifyColumnsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ModifyColumnsDialogData){}

  ngOnInit(): void {
    // Create a copy in order to not modify the original array
    this.columns = Array.from(this.data.currentColumns);
  }

  /**
   * Get the available columns (all the columns that can be added)
   * Sort the columns alphabetically
   */
  availableColumns(): ApplicationColumn[] {
    return this.data.availableColumns.sort();
  }

  /**
   * Update the columns array when a checkbox is checked or unchecked
   */
  updateColumn({ checked }: MatCheckboxChange, column: ApplicationColumn): void {
    if (checked) {
      this.columns.push(column);
    } else {
      this.columns = this.columns.filter(c => c !== column);
    }
  }

  /**
   * Check if a column is selected
   */
  isSelected(column: ApplicationColumn): boolean {
    return this.data.currentColumns.includes(column);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  trackByColumn(_: number, column: ApplicationColumn): string {
    return column;
  }
}
