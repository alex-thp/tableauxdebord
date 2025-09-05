import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalViewComponent } from './global-view/global-view.component';
import { CardComponent } from './card/card.component';
import { GraphCandidatsComponent } from './graphs/graph-candidats/graph-candidats.component';
import { PoleViewComponent } from './pole-view/pole-view.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { ConnectionComponent } from './connection/connection.component';
import { MainDevViewComponent } from './pole-dev/main-dev-view/main-dev-view.component';
import { VisualisationComponent } from './pole-dev/visualisation/visualisation.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardHierarchyComponent } from './dashboard-hierarchy/dashboard-hierarchy.component';
import { AccompagnementComponent } from './objectifs/accompagnement/accompagnement.component';
import { PdfMakerComponent } from './pdf/pdf-maker/pdf-maker.component';
import { AskGeminiComponent } from './ask-gemini/ask-gemini.component';
import { SharedViewComponent } from './shared-view/shared-view.component';
import { BoussoleComponent } from './boussole/boussole.component';
import { ReservationComponent } from './reservation/reservation.component';

export const appRouteList: Routes = [
    { path: '', component: GlobalViewComponent, canActivate: [AuthGuard] },
    { path: 'login', component: ConnectionComponent },
    { path: 'home', component: GlobalViewComponent, canActivate: [AuthGuard] },
    { path: 'view/:i', component: PoleViewComponent, canActivate: [AuthGuard] },
    { path: 'search', component: CardComponent, canActivate: [AuthGuard] },
    { path: 'graph', component: GraphCandidatsComponent, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
    { path: 'dev', component: MainDevViewComponent, canActivate: [AuthGuard] },
    { path: 'visualisation/:rapport_x_indicateur', component: VisualisationComponent, canActivate: [AuthGuard] },
    { path: 'not_found', component: NotFoundComponent },
    { path: 'generateCustomPDF', component: PdfMakerComponent, canActivate: [AuthGuard] },
    { path: 'shared_link/:rapport_x_indicateur', component: SharedViewComponent },
    { path: 'boussole', component: BoussoleComponent },
    { path: 'reservation', component: ReservationComponent },
    //{ path: 'gemini', component: AskGeminiComponent },
    //{ path: 'display_card_content:localite', component: DashboardHierarchyComponent },
    //{ path: 'test', component: DashboardHierarchyComponent},
    //{ path: 'test2', component: AccompagnementComponent},
    //{ path: 'visualisation', redirectTo: '/home', pathMatch: 'full' },
    //{ path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
    { path: '**', redirectTo: 'not_found' }
];

@NgModule({
    imports: [RouterModule.forRoot(appRouteList)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
