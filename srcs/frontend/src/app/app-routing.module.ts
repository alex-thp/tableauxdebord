import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalViewComponent } from './global-view/global-view.component';
import { CardComponent } from './card/card.component';
import { GraphCandidatsComponent } from './graph-candidats/graph-candidats.component';
import { PoleViewComponent } from './pole-view/pole-view.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ConnectionComponent } from './connection/connection.component';

export const appRouteList: Routes = [
    { path: 'login', component: ConnectionComponent },
    { path: 'home', component: GlobalViewComponent, canActivate: [AuthGuard] },
    { path: 'view/:i', component: PoleViewComponent, canActivate: [AuthGuard] },
    { path: 'search', component: CardComponent, canActivate: [AuthGuard] },
    { path: 'graph', component: GraphCandidatsComponent, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
    //{ path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
    { path: '**', redirectTo: 'login' }
];

@NgModule({
    imports: [RouterModule.forRoot(appRouteList)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
