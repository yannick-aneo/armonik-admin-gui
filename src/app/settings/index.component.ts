import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import { PageHeaderComponent } from '@components/page-header.component';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-settings-index',
  template: `
<app-page-header>
  <mat-icon matListItemIcon aria-hidden="true" fontIcon="settings"></mat-icon>
  <span matListItemTitle> Settings </span>
</app-page-header>

<section class="storage">
  <h2>
    <mat-icon matListItemIcon aria-hidden="true" fontIcon="storage"></mat-icon>
    Storage
  </h2>

  <p>
    Delete data stored in your browser by this application. This will reset behavior and settings to their default values.
  </p>

  <form (submit)="onSubmitStorage($event)">
    <ul *ngIf="keys.size">
      <li *ngFor="let key of keys; trackBy:trackByKey">
        <mat-checkbox [name]="key">
          {{ key }}
        </mat-checkbox>
      </li>
    </ul>

    <div class="actions">
      <button mat-stroked-button type="reset">Reset</button>
      <button mat-flat-button color="warn" type="submit">Clear</button>
    </div>
  </form>
</section>

<section class="export">
  <h2>
    <mat-icon matListItemIcon aria-hidden="true" fontIcon="file_download"></mat-icon>
    <span>Export your data</span>
  </h2>

  <p>
    Export your settings as a JSON file. This file can be imported later to restore your settings.
  </p>

  <div class="actions">
    <button mat-flat-button color="primary" (click)="exportData()">Export</button>
  </div>
</section>

<section class="import">
  <h2>
    <mat-icon matListItemIcon aria-hidden="true" fontIcon="file_upload"></mat-icon>
    <span>Import your data</span>
  </h2>

  <p>
    Import your settings from a JSON file. This will overwrite your current settings.
  </p>

  <form (submit)="onSubmitImport($event)">
    <div class="file">
      <label for="file">File</label>
      <input id="file" type="file" accept="application/json" required>
    </div>

    <div class="actions">
      <button mat-stroked-button type="reset">Reset</button>
      <button mat-flat-button color="primary" type="submit">Import</button>
    </div>
  </form>
</section>
  `,
  styles: [`
h2 {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.storage .search {
  margin-top: 1rem;
}

.storage ul {
  list-style-type: none;
  padding: 0;
  margin: 0;

  display: grid;
  grid-template-columns: min-content min-content min-content;
  column-gap: 0.5rem;
}

.storage .actions {
  margin-top: 1rem;

  display: flex;
  flex-direction: row;
  gap: 1rem;
}

section + section {
  margin-top: 2rem;
}

.export .actions {
  margin-top: 1rem;
}

.import .file {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.import .actions {
  margin-top: 1rem;

  display: flex;
  flex-direction: row;
  gap: 1rem;
}
  `],
  standalone: true,
  providers: [
    StorageService
  ],
  imports: [
    NgFor,
    NgIf,
    PageHeaderComponent,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class IndexComponent implements OnInit {
  keys: Set<string>;

  constructor(
    private _storageService: StorageService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.keys = this.#sortKeys(this._storageService.keys);
  }

  onSubmitStorage(event: SubmitEvent): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    if (!form) {
      return;
    }

    const checkboxes = form.querySelectorAll('input[type="checkbox"]');

    const checkboxesArray = Array.from(checkboxes) as HTMLInputElement[];
    const keys = [];

    for (const checkbox of checkboxesArray) {
      if (checkbox.checked) {
        keys.push(checkbox.name);
      }
    }

    for (const key of keys) {
      this.keys.delete(key);
      this._storageService.removeItem(key);
    }
  }

  exportData(): void {
    const data = this._storageService.exportData();

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const id = new Date().getTime();

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${date}-${id}-settings.json`;
    anchor.click();

    this._snackBar.open('Settings exported', 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'end',
      panelClass: 'success'
    });
  }

  onSubmitImport(event: SubmitEvent): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    if (!form) {
      return;
    }

    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;

    if (!fileInput) {
      return;
    }

    const file = fileInput.files?.[0];

    if (!file) {
      this._snackBar.open('No file selected', 'Dismiss', {
        duration: 3000,
        horizontalPosition: 'end',
        panelClass: 'error'
      });
      return;
    }

    if( file.type !== 'application/json' ) {
      this._snackBar.open(`'${file.name}' is not a JSON file`, 'Dismiss', {
        duration: 3000,
        horizontalPosition: 'end',
        panelClass: 'error'
      });
      form.reset();
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const data = reader.result as string;
      this._storageService.importData(data);
      this.keys = this.#sortKeys(this._storageService.keys);

      this._snackBar.open('Settings imported', 'Dismiss', {
        duration: 3000,
        horizontalPosition: 'end',
        panelClass: 'success'
      });

      form.reset();
    };

    reader.readAsText(file);
  }

  trackByKey(index: number, key: string): string {
    return key;
  }

  #sortKeys(keys: Set<string>): Set<string> {
    const keysArray = Array.from(keys);
    const sortedKeys = keysArray.sort();

    return new Set(sortedKeys);
  }
}
