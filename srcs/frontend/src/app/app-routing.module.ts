import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalViewComponent } from './global-view/global-view.component';
import { CardComponent } from './card/card.component';
import { GraphCandidatsComponent } from './graph-candidats/graph-candidats.component';
import { PoleViewComponent } from './pole-view/pole-view.component';

export const appRouteList: Routes = [
    { path: 'home', component: GlobalViewComponent },
    { path: 'view/:i', component: PoleViewComponent},
    { path: 'search', component: CardComponent },
    { path: 'graph', component: GraphCandidatsComponent },
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [RouterModule.forRoot(appRouteList)], // ✅ Vérifie que `forRoot` est bien utilisé
    exports: [RouterModule] // ✅ Vérifie que `RouterModule` est bien exporté
})
export class AppRoutingModule { }
