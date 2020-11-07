import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  sections = document.getElementsByTagName('li');
  constructor() {
  }
  ngOnInit(): void {
    this.sections[0].id = 'act';
  }
  click(e, key: any): void {
    // tslint:disable-next-line:prefer-for-of
     for (let i = 0; i < this.sections.length; i++){
       this.sections[i].id = null;
     }
     this.sections[key].id = 'act';
  }
}
