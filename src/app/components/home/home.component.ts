import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ServiceService} from '../../services/service.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {debounceTime, finalize, switchMap, tap} from 'rxjs/operators';
import { filter } from 'rxjs/operators';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  stockResults: any;
  searchForm: FormGroup;
  isLoading = false;
  constructor(public  http: HttpClient, public service: ServiceService, private fb: FormBuilder, public router: Router) {

  }
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      userInput: null,
    });
    this.searchForm
      .get('userInput')
      .valueChanges
      .pipe(
        filter(value => value),
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => this.service.search(value,'search')
          .pipe(
            finalize(() => this.isLoading = false),
          )
        )
      )
      .subscribe(users => this.stockResults = users);
  }
  doSearch(): void{
    let stockQuery = this.searchForm.get('userInput').value;
    if(!(typeof stockQuery === 'string')){
      stockQuery = stockQuery.ticker;
    }
    this.router.navigate(['/details',stockQuery] );
  }

  displayFn(stock: any): any {
    if (stock) { return stock.ticker; }
  }
}
