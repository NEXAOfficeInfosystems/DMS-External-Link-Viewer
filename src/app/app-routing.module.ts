import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DataroomdetailsComponent } from './pages/dataroomdetails/dataroomdetails.component';
import { MainContentComponent } from './shared/components/main-content/main-content.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicRedirectComponent } from './core/helpers/PublicRedirectComponent';
import { ProfileDetailsComponent } from './pages/profile-details/profile-details.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { NotificationsListComponent } from './pages/notifications-list/notifications-list.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: MainContentComponent },
      { path: 'data-room-detail/:id', component: DataroomdetailsComponent },
      { path: 'profile', component: ProfileDetailsComponent },
      // { path: 'Dashboard', component: UserDashboardComponent }
     { path: 'notilist', component: NotificationsListComponent }

    ]
  },

  {
    path: 'p/:token',
    component: PublicRedirectComponent
  },
  // {
  //   path: '',
  //   redirectTo: 'auth',
  //   pathMatch: 'full'
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
