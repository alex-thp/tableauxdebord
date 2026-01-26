import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GraphCandidatsComponent } from './graphs/graph-candidats/graph-candidats.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DateSearchComponent } from './date-search/date-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './connection/login/login.component';
import { AuthInterceptor } from './auth.interceptor';
import { ConnectionComponent } from './connection/connection.component';
import { FilterObjectifPipe } from './pipes/filter-objectif.pipe';
import { FilterDatePipe } from './pipes/filter-date.pipe';
import { SortByDateFinPipe } from './pipes/sort-by-date-fin.pipe';
import { StringDateFormatPipe } from './pipes/string-date-format.pipe';

@NgModule({
  declarations: [
    AppComponent,
    GraphCandidatsComponent,
    DateSearchComponent,
    LoginComponent,
    ConnectionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FilterObjectifPipe,
    FilterDatePipe,
    SortByDateFinPipe,
    StringDateFormatPipe,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
