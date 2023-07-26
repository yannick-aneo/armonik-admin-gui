import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable, Subject, Subscription } from 'rxjs';
import { TasksGrpcService } from '@app/tasks/services/tasks-grpc.service';
import { TasksStatusesService } from '@app/tasks/services/tasks-status.service';
import { StatusCount } from '@app/tasks/types';
import { Page } from '@app/types/pages';
import { ActionsToolbarGroupComponent } from '@components/actions-toolbar-group.component';
import { ActionsToolbarComponent } from '@components/actions-toolbar.component';
import { AutoRefreshButtonComponent } from '@components/auto-refresh-button.component';
import { FiltersToolbarComponent } from '@components/filters-toolbar.component';
import { PageHeaderComponent } from '@components/page-header.component';
import { PageSectionHeaderComponent } from '@components/page-section-header.component';
import { PageSectionComponent } from '@components/page-section.component';
import { RefreshButtonComponent } from '@components/refresh-button.component';
import { SpinnerComponent } from '@components/spinner.component';
import { AutoRefreshService } from '@services/auto-refresh.service';
import { IconsService } from '@services/icons.service';
import { QueryParamsService } from '@services/query-params.service';
import { ShareUrlService } from '@services/share-url.service';
import { StorageService } from '@services/storage.service';
import { TableStorageService } from '@services/table-storage.service';
import { TableURLService } from '@services/table-url.service';
import { TableService } from '@services/table.service';
import { UtilsService } from '@services/utils.service';
import { LineComponent } from './components/line.component';
import { DashboardIndexService } from './services/dashboard-index.service';
import { DashboardStorageService } from './services/dashboard-storage.service';
import { Line } from './types';


@Component({
  selector: 'app-dashboard-index',
  template: `
<app-page-header [sharableURL]="sharableURL">
  <mat-icon matListItemIcon aria-hidden="true" [fontIcon]="getPageIcon('dashboard')"></mat-icon>
  <span i18n="Page title"> Dashboard </span>
</app-page-header>
<section class="lines" *ngFor="let line of lines" >
  <app-line 
      [line]="line" 
      (saveChange)="onSaveChange()"
      (filtersChange)="onSaveChange()"
      (toggleGroupsHeaderChange)="onSaveChange()"
      (manageGroupsDialogChange)="onSaveChange()"
      (editNameLineDialogChange)="onSaveChange()"
  ></app-line>
</section>
  `,
  styles: [
    `
      app-line {
        margin: 1em; 
      }
      
      app-actions-toolbar {
        display: block;
        width: 100%;
      }
    `
  ],
  standalone: true,
  providers: [
    TasksStatusesService,
    ShareUrlService,
    QueryParamsService,
    TasksGrpcService,
    StorageService,
    DashboardStorageService,
    DashboardIndexService,
    AutoRefreshService,
    UtilsService,
    TableService,
    TableURLService,
    TableStorageService,
  ],
  imports: [
    NgFor,
    NgIf,
    JsonPipe,
    PageHeaderComponent,
    PageSectionComponent,
    SpinnerComponent,
    PageSectionHeaderComponent,
    ActionsToolbarComponent,
    ActionsToolbarGroupComponent,
    RefreshButtonComponent,
    AutoRefreshButtonComponent,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatProgressSpinnerModule,
    FiltersToolbarComponent,
    LineComponent
  ]
})
export class IndexComponent implements OnInit, OnDestroy {
  #iconsService = inject(IconsService);

  lines: Line[]; 
  total: number;
  data: StatusCount[] = []; 

  intervalValue = 0;
  sharableURL = '';

  refresh: Subject<void> = new Subject<void>();
  stopInterval: Subject<void> = new Subject<void>();
  interval: Subject<number> = new Subject<number>();
  interval$: Observable<number> = this._autoRefreshService.createInterval(this.interval, this.stopInterval);

  subscriptions: Subscription = new Subscription();
  
  
  
  availableFiltersFields: [];
  filters: [];

  constructor(
    private _shareURLService: ShareUrlService,
    private _dashboardIndexService: DashboardIndexService,
    private _autoRefreshService: AutoRefreshService
  ) {}

  ngOnInit(): void {
    this.lines = this._dashboardIndexService.restoreLines();
    this.sharableURL = this._shareURLService.generateSharableURL(null, this.filters);
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getIcon(name: string): string {
    return this.#iconsService.getIcon(name);
  }

  getPageIcon(name: Page): string {
    return this.#iconsService.getPageIcon(name);
  }

  autoRefreshTooltip(): string {
    return this._autoRefreshService.autoRefreshTooltip(this.intervalValue);
  }



  onRefresh() {
    this.refresh.next();
  }

  onSaveChange() {
    this._dashboardIndexService.saveLines(this.lines);
  }

}
