import { TaskStatus } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { TasksStatusesService } from '@app/tasks/services/tasks-status.service';
import { DashboardStorageService } from './dashboard-storage.service';
import { TasksStatusesGroup } from '../types';
import { TableService } from '@services/table.service';

@Injectable()
export class DashboardIndexService {

  #dashboardStorageService = inject(DashboardStorageService);
  #tasksStatusesService = inject(TasksStatusesService);

  #tableService = inject(TableService);

  readonly tableName: string = 'dashboard'


  readonly columnsLabels: Record<any, string> = {
    applications: $localize`Applications`,
    partitions: $localize`Partitions`,
    sessions: $localize`Sessions`,
    results: $localize`Results`,
  };

  readonly defaultStatusGroups: TasksStatusesGroup[] = [
    {
      name: 'Finished',
      color: '#00ff00',
      statuses: [
        TaskStatus.TASK_STATUS_COMPLETED,
        TaskStatus.TASK_STATUS_CANCELLED,
      ]
    },
    {
      name: 'Running',
      color: '#ffa500',
      statuses: [
        TaskStatus.TASK_STATUS_PROCESSING,
      ]
    },
    {
      name: 'Errors',
      color: '#ff0000',
      statuses: [
        TaskStatus.TASK_STATUS_ERROR,
        TaskStatus.TASK_STATUS_TIMEOUT,
      ]
    },
  ];

  
  readonly defaultFilters: any[] = [];
  readonly availableFiltersFields: any[] = [
    {
      field: 'applications',
      type: 'text',
    },
    {
      field: 'partitions',
      type: 'text',
    },
    {
      field: 'sessions',
      type: 'text',
    },
    {
      field: 'results',
      type: 'text',
    }
  ];

  readonly defaultOptions: any = {
    pageIndex: 0,
    pageSize: 20,
    sort: {
      active: 'submittedAt',
      direction: 'desc',
    },
  };

  readonly defaultHideGroupsHeader = false;
  readonly defaultIntervalValue = 5;

  

  // TODO: move to TasksStatusesService
  statuses(): { value: string, name: string }[] {
    const values = Object.values(this.#tasksStatusesService.statuses).sort();
    const keys = Object.keys(this.#tasksStatusesService.statuses).sort();
    const sortedKeys = values.map((value) => {
      return keys.find((key) => {
        return this.#tasksStatusesService.statuses[Number(key) as TaskStatus] === value;
      });
    });

    return (sortedKeys.filter(Boolean) as string[]).map((key) => {
      const status = Number(key) as TaskStatus;
      return {
        value: key,
        name: this.#tasksStatusesService.statusToLabel(status)
      };
    });
  }

  restoreStatusGroups(): TasksStatusesGroup[] {
    return this.#dashboardStorageService.restoreStatusGroups() ?? this.defaultStatusGroups;
  }

  saveStatusGroups(groups: TasksStatusesGroup[]) {
    this.#dashboardStorageService.saveStatusGroups(groups);
  }

  restoreIntervalValue(): number {
    const storedValue = this.#dashboardStorageService.restoreInterval();

    if(storedValue === null) {
      return this.defaultIntervalValue;
    }

    return storedValue;
  }

  saveIntervalValue(interval: number) {
    this.#dashboardStorageService.saveInterval(interval);
  }
  
  /**
   * Filters
   */

  restoreFilters(): any[] {
    return this.#tableService.restoreFilters<any>(this.tableName, this.availableFiltersFields) ?? this.defaultFilters;
  }

  saveFilters(filters: any[]): void {
    this.#tableService.saveFilters(this.tableName, filters);
  }

  resetFilters(): any[] {
    this.#tableService.resetFilters(this.tableName);

    return this.defaultFilters;
  }
 

  
  /**
   * Options
   */

  saveOptions(options: any): void {
    this.#tableService.saveOptions(this.tableName, options);
  }

  restoreOptions(): any {
    const options = this.#tableService.restoreOptions<any>(this.tableName, this.defaultOptions);

    return options;
  }



  restoreHideGroupsHeader(): boolean {
    const storedValue = this.#dashboardStorageService.restoreHideGroupsHeader();

    if(storedValue === null) {
      return this.defaultHideGroupsHeader;
    }

    return storedValue;
  }

  saveHideGroupsHeader(hide: boolean) {
    this.#dashboardStorageService.saveHideGroupsHeader(hide);
  }
}
