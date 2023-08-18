
import { NgForOf, NgIf } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnKey, FieldKey } from '@app/types/data';
import { FiltersDialogData } from '@app/types/dialog';
import { Filter, FilterEvent, FilterField, FilterFieldSelect, FilterInput, FilterInputDate, FilterInputSelect, FilterInputText, FilterInputType } from '@app/types/filters';
import { IconsService } from '@services/icons.service';
import { FiltersDialogInputComponent } from './filters-dialog-input.component';


@Component({
  selector: 'app-filters-dialog',
  template: `
    <h2 mat-dialog-title i18n="Dialog title">Filters</h2>

    <mat-dialog-content>
      <p i18n="Dialog description">Build your filters</p>

      <div class="filters">
        <div class="filter" *ngFor="let filter of filters; let index = index; trackBy:trackByFilter">
          <span *ngIf="index === 0" i18n="Filter condition">Where</span>
          <span *ngIf="index > 0" i18n="Filter condition">And</span>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label i18n="Label input">Column</mat-label>
            <input type="text" 
                  matInput 
                  (input)="filterValue(filter, $event)" 
                  [matAutocomplete]="auto" 
                  [value]="filter.field" 
                  [(ngModel)]="filter.field" 
                  required>
            <mat-error *ngIf="!filter.field">
               A value is <strong>required</strong>
            </mat-error>
              <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onFieldChange(filter, $event)">
              <mat-option *ngFor="let column of filterOption(filter); trackBy: trackByField" [value]="column" [disabled]="disableField(column)">
                {{ columnToLabel(column) }}
              </mat-option>
             </mat-autocomplete>
        
          </mat-form-field>

          <span i18n>is</span>

          <app-filters-dialog-input [input]="findInput(filter)" (valueChange)="onInputValueChange(index, $event)" ></app-filters-dialog-input>

          <button mat-icon-button aria-label="More options" mat-tooltip="More options" [matMenuTriggerFor]="menu">
            <mat-icon aria-hidden="true" [fontIcon]="getIcon('more')"></mat-icon>
          </button>

          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="onClear(filter)">
              <mat-icon aria-hidden="true" [fontIcon]="getIcon('clear')"></mat-icon>
              <span i18n>Clear</span>
            </button>
            <button mat-menu-item (click)="onRemove(index)" [disabled]="filters.length === 1 && index === 0">
              <mat-icon aria-hidden="true" [fontIcon]="getIcon('delete')"></mat-icon>
              <span i18n>Remove</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <button class="add-filter" mat-button (click)="addFilter()">
        <mat-icon aria-hidden="true" [fontIcon]="getIcon('add')"></mat-icon>
        <span i18n>Add a filter rule</span>
      </button>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()" i18n="Dialog action"> Cancel </button>
      <button mat-flat-button [mat-dialog-close]="filters" color="primary" i18n="Dialog action"> Confirm </button>
    </mat-dialog-actions>
    `,
  styles: [`
  .filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filter {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .filter > span:first-child {
    min-width: 3rem;
    text-align: end;
  }

  .add-filter {
    margin-top: 1rem;
  }

  app-filters-dialog-input {
    flex: 1;
  }
  `],
  standalone: true,
  imports: [
    MatAutocompleteModule,
    NgForOf,
    NgIf,
    FormsModule,
    FiltersDialogInputComponent,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
  ],
})
export class FiltersDialogComponent<T extends object> implements OnInit {
  #iconsService = inject(IconsService);

  filters: Filter<T>[] = [];
  columnsLabels: Record<ColumnKey<T>, string> | null = null;

  constructor(public dialogRef: MatDialogRef<FiltersDialogComponent<T>>, @Inject(MAT_DIALOG_DATA) public data: FiltersDialogData<T>){}

  ngOnInit(): void {
    this.columnsLabels = this.data.columnsLabels;
    

    if (this.data.filters.length === 0) {
      this.addFilter();
    } else {
      // Avoid to mutate original data
      this.filters = this.data.filters.map(filter => ({ ...filter }));
    }
  }


  stringifyFilterField(value: Filter<T>) : string {
    return value.field?.toString() ?? ''; 
  }

  filterOption(value: Filter<T> ) : (keyof T)[] {
    const filterValue = this.stringifyFilterField(value).toLowerCase(); 
    const options = [...this.availableFiltersFields()].map(option => option.field);

    return options.filter(option => option.toString().toLowerCase().includes(filterValue));
  }

  getIcon(name: string): string {
    return this.#iconsService.getIcon(name);
  }

  filterValue( filter: Filter<T>, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    filter.field = value as keyof T;  // not a permanent solution
  }

  /**
   * Get the available field (all the field that can be added)
   * Sort the field alphabetically
   */
  availableFiltersFields(): FilterField<T>[] {
    return this.data.availableFiltersFields.sort((a, b) => (a.field as string).localeCompare(b.field as string));
  }

  columnToLabel(column: keyof T): string {
    if (this.columnsLabels === null)
      return column.toString();
    else
      return this.columnsLabels[column];
  }

  addFilter(): void {
    this.filters.push({
      field: null,
    });
  }

  onFieldChange(filter: Filter<T>, selection: MatAutocompleteSelectedEvent): void {
    filter.field = selection.option.value ;
  }

  onInputValueChange(index: number, event: FilterEvent): void {
    if (event.type === 'text')
      this.filters[index].value = event.value;
    else if (event.type === 'number')
      this.filters[index].value = event.value;
    else if (event.type === 'date-start')
      this.filters[index].value = { start: event.value?.toISODate() ?? null, end: (this.filters[index].value as {end: string | null })?.end };
    else if (event.type === 'date-end')
      this.filters[index].value = { start: (this.filters[index].value as {start: string | null })?.start, end: event.value?.toISODate() ?? null };
  }

  onValueChange(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    this.filters[index].value = value;
  }

  onClear(filter: Filter<T>): void {
    filter.field = null;
    delete filter.value;
  }

  onRemove(index: number): void {
    this.filters.splice(index, 1);
  }

  selectedField(filterName: FilterField<T>, field: FilterField<T>): boolean {
    return filterName === field;
  }

  disableField(field: keyof T): boolean {
    const usedFields = this.filters.map(filter => filter.field);
    return usedFields.includes(field); 
  }

  findType(field: FieldKey<T> | null): FilterInputType {
    if (!field) {
      return 'text';
    }

    const filter = this.data.availableFiltersFields.find(filter => filter.field === field);

    return filter?.type ?? 'text';
  }

  findInput(filter: Filter<T>): FilterInput {
    const type = this.findType(filter.field);

    if (type === 'number') {
      return {
        type: 'number',
        value: Number(filter.value) || null,
      };
    }

    if (type === 'date') {
      return {
        type: 'date',
        value: filter.value as FilterInputDate['value'] || { start: null, end: null }
      };
    }

    if (type === 'select') {
      const options = (this.data.availableFiltersFields.find(f => f.field === filter.field) as FilterFieldSelect<T>).options;
      return {
        type: 'select',
        value: filter.value as FilterInputSelect['value'] || null,
        options,
      };
    }

    return {
      type: 'text',
      value: filter.value as FilterInputText['value'] || null,
    };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  trackByFilter(index: number) {
    return index;
  }

  trackByField(_: number, field: keyof T) {
    return field;
  }
}
