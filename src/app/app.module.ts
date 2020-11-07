import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// 双向数据绑定
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import {HttpClientModule} from '@angular/common/http';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import {ServiceService} from './services/service.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { DetailsComponent } from './components/details/details.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { PortfolioComponent } from './components/portfolio/portfolio.component';

import { HighchartsChartModule } from 'highcharts-angular';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    FooterComponent,
    WatchlistComponent,
    DetailsComponent,
    PortfolioComponent,
  ],
  imports: [
    HighchartsChartModule,
    FontAwesomeModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    NgbModule
  ],
  providers: [ServiceService,],
  bootstrap: [AppComponent]
})
export class AppModule { }
