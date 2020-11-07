import {Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ServiceService} from '../../services/service.service';
import {interval, Subscription} from 'rxjs';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit,OnDestroy {
  watchList: any[] = [];
  isEmpty = true;
  lastRecord: any[];
  changeList: any[] = [];
  sortedChangeList: any[] = [];

  constructor(public service: ServiceService, private renderer: Renderer2, @Inject(DOCUMENT) private document) {

  }


  ngOnInit(): void {
    const source = interval(15000); // Every 15s; !!!!!!15000 when pushed to restfulServer
    const localList = this.service.get('watchlist');
    if (typeof localList!=='undefined' && localList.length!==0) {
      this.watchList = localList;
      this.getPriceInfo();
      this.isEmpty = false;
    } else {
      console.log('no data');
      this.isEmpty = true;
    }
  }
  ngOnDestroy(): void {

  }
  public deleteFromList(key): void{
    this.sortedChangeList.splice(key,1);
    this.watchList.splice(key,1);
    this.service.set('watchlist',this.watchList);
    if(this.watchList.length===0){
      this.isEmpty=true;
    }
  }
  public getPriceInfo(): void {

    let nameList = '';
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.watchList.length; i++) {
      if (i === (this.watchList.length - 1)) {
        nameList += this.watchList[i].ticker;
      } else {
        nameList += this.watchList[i].ticker + ',';
      }
    }
    this.service.search(nameList, 'price').subscribe(data => {
      this.lastRecord = data;
      this.updateChanges();
    });
  }

  // tslint:disable-next-line:typedef
  public updateChanges() {
    for (let i = 0; i < this.lastRecord.length; i++) {
      const c: number = this.lastRecord[i].last-this.lastRecord[i].prevClose;
      const change = c.toFixed(2);
      const changePercentage = ((c*100)/(this.lastRecord[i].prevClose)).toFixed(2);
      const temp = {
        a: change,
        b: changePercentage,
        c: this.lastRecord[i].ticker,
        d: this.lastRecord[i].last
      };
      this.changeList.push(temp);
    }
    for (let i = 0; i < this.watchList.length; i++) {
      this.sortedChangeList.push((this.changeList.find(e=>e.c===this.watchList[i].ticker)));
    }
    for (let i = 0; i < this.sortedChangeList.length; i++) {
      const h: HTMLHeadingElement = this.renderer.createElement('h3');
      const p: HTMLParagraphElement = this.renderer.createElement('p');
      const change = this.sortedChangeList[i].a;
      const changePercentage = this.sortedChangeList[i].b;
      h.innerText = change;
      p.innerText = '('+changePercentage+')'+'%';
      h.className = (change>=0)?'green':'red';
      p.className = (change>=0)?'green':'red';
      const tag = document.getElementById(String(i));
      tag.appendChild(h);
      tag.appendChild(p);
    }
  }




}
