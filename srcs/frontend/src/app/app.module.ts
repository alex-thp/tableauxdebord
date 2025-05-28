import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GraphCandidatsComponent } from './graph-candidats/graph-candidats.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DateSearchComponent } from './date-search/date-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './connection/login/login.component';
import { AuthInterceptor } from './auth.interceptor';
import { ConnectionComponent } from './connection/connection.component';


@NgModule({
declarations: [
    AppComponent,
    GraphCandidatsComponent,
    DateSearchComponent,
    LoginComponent,
    ConnectionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }