import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import { HomeComponent } from './components/home/home.component';
import { DetailsComponent} from './components/details/details.component';
import {PortfolioComponent} from './components/portfolio/portfolio.component';


const routes: Routes = [
  {
    path:'',component:HomeComponent
  },
  {
    path:'watchlist', component: WatchlistComponent
  },
  {
    path:'details/:ticker', component: DetailsComponent
  },
  {
    path:'portfolio', component: PortfolioComponent
  },
  // if no route was found, re-direct to home page
  {
    path:'**', /*any route*/
    redirectTo:'',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
