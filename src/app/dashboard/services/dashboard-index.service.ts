import { TaskStatus } from '@aneoconsultingfr/armonik.api.angular';
import { Injectable, inject } from '@angular/core';
import { TasksStatusesService } from '@app/tasks/services/tasks-status.service';
import { DefaultConfigService } from '@services/default-config.service';
import { DashboardStorageService } from './dashboard-storage.service';
import { Line, TasksStatusesGroup } from '../types';
import { TableService } from '@services/table.service';

@Injectable()
export class DashboardIndexService {
  #defaultConfigService = inject(DefaultConfigService);
  #dashboardStorageService = inject(DashboardStorageService);
  #tasksStatusesService = inject(TasksStatusesService);
  #tableService = inject(TableService); 
  

  // readonly defaultColumns: any[] = this.#defaultConfigService.defaultDashboardConfig.columns;
  // readonly defaultFilters: any[] = this.#defaultConfigService.defaultDashboardConfig.filters;
  readonly defaultFilters: any[] = []; 
  readonly availableFiltersFields: any[] = [
   
    {
      field: 'applications',
      type: 'text'
    },
    {
      field: 'partitions',
      type: 'text',
    },
    {
      field: 'sessions',
      type: 'text',
    }
  ];
  readonly defaultLines: Line[] = this.#defaultConfigService.defaultDashboardLines;

 


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
  


  // saveOptions(options: any): void {
  //   this.#tableService.saveOptions('dashboard-config-options', options);
  // }

  // restoreOptions(): any {
  //   const options = this.#tableService.restoreOptions<any>('dashboard-config-options', this.defaultOptions);

  //   return options;
  // }


  // saveColumns(columns: any[]): void {
  //   this.#tableService.saveColumns('dashboard-config-columns', columns);
  // }

   // Something like DashboardConfigColumnKey
  // restoreColumns(): any[] {
  //   const columns = this.#tableService.restoreColumns<any[]>('dashboard-config-columns') ?? [];

  //   return [...columns];
  // }

  // resetColumns(): any[] {
  //   this.#tableService.resetColumns('dashboard-config-columns');

  //   return Array.from(this.defaultColumns);
  // }


  // type-hint with something like DashboardConfigFilter[]
  // saveFilters(filters: any[]): void {
  //   this.#tableService.saveFilters('dashboard-config-filters', filters);
  // }

  restoreFilters(): any[] {
    return this.#tableService.restoreFilters<any>('tasks-filters', this.availableFiltersFields) ?? this.defaultFilters;
  }

  // resetFilters(): any[] {
  //   this.#tableService.resetFilters('dashboard-config-filters');

  //   return this.defaultFilters;
  // }





  restoreStatusGroups(): TasksStatusesGroup[] {
    return this.#dashboardStorageService.restoreStatusGroups() ?? this.defaultStatusGroups;
  }

  saveStatusGroups(groups: TasksStatusesGroup[]) {
    this.#dashboardStorageService.saveStatusGroups(groups);
  }

  restoreIntervalValue(): number {
    const storedValue = this.#dashboardStorageService.restoreInterval();

    if(storedValue === null) {
      return this.defaultInterval;
    }

    return storedValue;
  }

  saveIntervalValue(interval: number) {
    this.#dashboardStorageService.saveInterval(interval);
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
