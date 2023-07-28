import { TaskStatus } from '@aneoconsultingfr/armonik.api.angular';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { AddNameLineDialogComponent } from './components/add-new-line-dialog.component';
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
<section class="add-lines">
    <div class="example-button-container">
          <button mat-fab color="primary" aria-label="Button that displays a form for adding a new line on dashboard" aria-hidden="true" (click)="onAddNewLineDialog()" matTooltip="Add a new line">
              <mat-icon  matTooltip="add a new line"> add a new line </mat-icon>
          </button>
      </div>
</section>
<span *ngIf="lines.length === 0"> You have no lines displayed.</span>
<ng-container *ngFor="let line of lines" >
      <app-page-section>
        <app-page-section-header icon="adjust">
            <span i18n="Section title">{{ line.name }}</span>
        </app-page-section-header>
        <app-line [line]="line"  (lineChange)="onSaveChange()" (lineDelete)="onDeleteLine($event)"></app-line>
   </app-page-section>
</ng-container>
  `,
  styles: [
    `

    .add-lines {
      display: flex; 
      justify-content: flex-end;
    } 
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
    IconsService
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
    MatDialogModule,
    MatMenuModule,
    MatCardModule,
    MatTooltipModule,
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
    private _autoRefreshService: AutoRefreshService,
    private _dialog: MatDialog,
    private _iconsService: IconsService
  ) {}

  ngOnInit(): void {
    this.lines = this._dashboardIndexService.restoreLines();
    this.sharableURL = this._shareURLService.generateSharableURL(null, this.filters);
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getIcon(name: string): string {
    return this._iconsService.getIcon(name);
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

  onAddNewLineDialog() {
    const dialogRef = this._dialog.open(AddNameLineDialogComponent, {
      data: {
        lines: this._dashboardIndexService.restoreLines(),
      }
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (!result || result.trim() === '') return;
      
      if (result) {
        this.lines.push({ 
          name: result, 
          interval: 5,
          hideGroupsHeader: false,
          filters: [],
          taskStatusesGroups: [
            {
              name: 'Finished',
              color: '#00ff00',
              statuses: [
                TaskStatus.TASK_STATUS_COMPLETED,
                TaskStatus.TASK_STATUS_CANCELLED,
              ], 
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
          ],  
        });
        this.onSaveChange(); 
      }
    });
    
  }

  onDeleteLine( value: Line) {
    const index = this.lines.indexOf(value);
    if (index > -1) {
      this.lines.splice(index, 1);
    }
    this.onSaveChange(); 
  }

  onSaveChange() {
    this._dashboardIndexService.saveLines(this.lines);
  }

}
