import { Injectable, inject } from '@angular/core';
import { StorageService } from '@services/storage.service';
import { Line, TasksStatusesGroup } from '../types';

@Injectable()
export class DashboardStorageService {

  #storageService = inject(StorageService);

  saveLine(line: Line) {
    this.#storageService.setItem('dashboard-lines', line);
  }

  restoreLines(): Line[] | null {
    const line = this.#storageService.getItem<Line[]>('dashboard-lines', true);

    if (line) {
      return line as Line[]
    }
    return null;
  }

}
