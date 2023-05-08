import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'applications',
    loadChildren: () => import('./applications/routes').then(mod => mod.APPLICATIONS_ROUTES)
  },
  {
    path: 'partitions',
    loadChildren: () => import('./partitions/routes').then(mod => mod.PARTITIONS_ROUTES)
  }
];
