import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable, Subject, Subscription, catchError, map, merge, of, startWith, switchMap, tap } from 'rxjs';
import { TasksGrpcService } from '@app/tasks/services/tasks-grpc.service';
import { TasksStatusesService } from '@app/tasks/services/tasks-status.service';
import { StatusCount } from '@app/tasks/types';
import { Page } from '@app/types/pages';
import { ActionsToolbarGroupComponent } from '@components/actions-toolbar-group.component';
import { ActionsToolbarComponent } from '@components/actions-toolbar.component';
import { AutoRefreshButtonComponent } from '@components/auto-refresh-button.component';
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
import { UtilsService } from '@services/utils.service';
import { ManageGroupsDialogComponent } from './components/manage-groups-dialog.component';
import { StatusesGroupCardComponent } from './components/statuses-group-card.component';
import { DashboardIndexService } from './services/dashboard-index.service';
import { DashboardStorageService } from './services/dashboard-storage.service';
import { TasksStatusesGroup } from './types';
import { FiltersToolbarComponent } from "../components/filters-toolbar.component";
import { TableService } from '@services/table.service';
import { TableURLService } from '@services/table-url.service';
import { TableStorageService } from '@services/table-storage.service';
import { NotificationService } from '@services/notification.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
    selector: 'app-dashboard-index',
    template: `
<app-page-header [sharableURL]="sharableURL">
  <mat-icon matListItemIcon aria-hidden="true" [fontIcon]="getPageIcon('dashboard')"></mat-icon>
  <span i18n="Page title"> Dashboard </span>
</app-page-header>

<app-page-section>
  <app-page-section-header icon="adjust">
    <span i18n="Section title"> Tasks by status </span>
  </app-page-section-header>

  <mat-toolbar>
    <mat-toolbar-row>
      <app-actions-toolbar>
        <app-actions-toolbar-group>
          <app-refresh-button [tooltip]="autoRefreshTooltip()" (refreshChange)="onRefresh()"></app-refresh-button>
          <app-spinner *ngIf="loadTasksStatus"></app-spinner>
        </app-actions-toolbar-group>

        <app-actions-toolbar-group>
          <app-auto-refresh-button [intervalValue]="intervalValue" (intervalValueChange)="onIntervalValueChange($event)"></app-auto-refresh-button>

          <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Show more options">
            <mat-icon aria-hidden="true" [fontIcon]="getIcon('more')"></mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="onToggleGroupsHeader()">
              <mat-icon aria-hidden="true" [fontIcon]="hideGroupHeaders ? getIcon('view') : getIcon('view-off')"></mat-icon>
              <span i18n>
                Toggle Groups Header
              </span>
            </button>
            <button mat-menu-item (click)="onManageGroupsDialog()">
              <mat-icon aria-hidden="true" [fontIcon]="getIcon('tune')"></mat-icon>
              <span i18n>
                Manage Groups
              </span>
            </button>
          </mat-menu>
        </app-actions-toolbar-group>
      </app-actions-toolbar>
    </mat-toolbar-row>
    
    <mat-toolbar-row>
    <app-filters-toolbar [filters]="filters" [filtersFields]="availableFiltersFields" [columnsLabels]="columnsLabels()" (filtersChange)="onFiltersChange($event)"></app-filters-toolbar>
  </mat-toolbar-row>
  </mat-toolbar>

  <div class="groups">
    <app-statuses-group-card
      *ngFor="let group of statusGroups"
      [group]="group"
      [data]="data"
      [hideGroupHeaders]="hideGroupHeaders"
    ></app-statuses-group-card>
  </div>
  <mat-paginator [length]="total" [pageIndex]="options.pageIndex" [pageSize]="options.pageSize" [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of tasks" i18n-aria-label>
    </mat-paginator>
</app-page-section>
  `,
    styles: [
        `
app-actions-toolbar {
  display: block;
  width: 100%;
}

.groups {
  margin-top: 1rem;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1rem;
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
        DashboardIndexService, 
        NotificationService
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
        StatusesGroupCardComponent,
        MatDialogModule,
        MatIconModule,
        MatPaginatorModule,
        MatSortModule,
        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        MatCardModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        FiltersToolbarComponent,
    ]
})
export class IndexComponent implements OnInit, AfterViewInit, OnDestroy {
  #iconsService = inject(IconsService); 


  options: any = [] // Need to type-hint it
  

  

  hideGroupHeaders: boolean;
  statusGroups: TasksStatusesGroup[] = [];
  data: StatusCount[] = [];
  total: number;

  intervalValue = 0;
  sharableURL = '';

  isLoading: boolean = true; 

  loadTasksStatus = true;
  refresh: Subject<void> = new Subject<void>();
  stopInterval: Subject<void> = new Subject<void>();
  interval: Subject<number> = new Subject<number>();
  interval$: Observable<number> = this._autoRefreshService.createInterval(this.interval, this.stopInterval);

  subscriptions: Subscription = new Subscription();
  filters: any[] = [];
  availableFiltersFields: any[] = []; // Need to type-hint it
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  

  constructor(
    private _dialog: MatDialog,
    private _shareURLService: ShareUrlService,
    private _taskGrpcService: TasksGrpcService,
    private _dashboardIndexService: DashboardIndexService,
    private _autoRefreshService: AutoRefreshService,
    private _notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.statusGroups = this._dashboardIndexService.restoreStatusGroups();

    this.options = this._dashboardIndexService.restoreOptions();

    this.availableFiltersFields = this._dashboardIndexService.availableFiltersFields;
    this.filters = this._dashboardIndexService.restoreFilters();

    this.intervalValue = this._dashboardIndexService.restoreIntervalValue();
    this.hideGroupHeaders = this._dashboardIndexService.restoreHideGroupsHeader();
    this.sharableURL = this._shareURLService.generateSharableURL(null, null);
  }

  ngAfterViewInit() {
    const sortSubscription = this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    const mergeSubscription = merge(this.sort.sortChange, this.paginator.page, this.refresh, this.interval$).pipe(
      startWith(0),
      tap(() => (this.loadTasksStatus = true)),
      switchMap(() => {
        const options: any = {
          pageIndex: this.paginator.pageIndex,
          pageSize: this.paginator.pageSize,
          sort: {
            active: this.sort.active as any,
            direction: this.sort.direction,
          }
        };
        const filters = this.filters;

        this.sharableURL = this._shareURLService.generateSharableURL(options, filters);
        this._dashboardIndexService.saveOptions(options);
      
       
       return  this._taskGrpcService.countByStatu$(options, filters).pipe(
        catchError((error) => {
          console.error(error);
          this._notificationService.error('Unable to fetch tasks');
          return of(null);
        }),
       )
      }),
  
    ).subscribe((data) => {
      if (!data?.status) {
        return;
      }

      this.data = data.status;
      this.total = data.status.reduce((acc, curr) => acc + curr.count, 0);

      this.loadTasksStatus = false; 
    });

    this.subscriptions.add(sortSubscription);
    this.subscriptions.add(mergeSubscription);
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
  
  onFiltersChange(value: unknown[]) {
    this.filters = value as any[]; // Need to type-hint it

    this._dashboardIndexService.saveFilters(this.filters);
    this.paginator.pageIndex = 0;
    this.refresh.next();
  }
  onIntervalValueChange(value: number) {
    this.intervalValue = value;

    if (value === 0) {
      this.stopInterval.next();
    } else {
      this.interval.next(value);
      this.refresh.next();
    }

    this._dashboardIndexService.saveIntervalValue(value);
  }
  
  columnsLabels(): Record<any, string> {
    return this._dashboardIndexService.columnsLabels;
  }

  onToggleGroupsHeader() {
    this.hideGroupHeaders = !this.hideGroupHeaders;

    this._dashboardIndexService.saveHideGroupsHeader(this.hideGroupHeaders);
  }

  onManageGroupsDialog() {
    const dialogRef = this._dialog.open(ManageGroupsDialogComponent, {
      data: {
        groups: this.statusGroups,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.statusGroups = result;
      this._dashboardIndexService.saveStatusGroups(this.statusGroups);
    });
  }

}
