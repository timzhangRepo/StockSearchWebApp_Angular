import { Component, OnInit } from '@angular/core';
import {ServiceService} from '../../services/service.service';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  public showOverlay = true;


  portFolioList: any; // a copy of list from the localMeory onInit, and updated to the screen.
  isEmpty = true; // true iff localMemory have  record

  private closeResult: string; // close results for modal.
  currentPrice = -1; // used for updating price when user click to purchase.
  totalOfStockToPurchase = 0;
  totalOfStockToSell = 0; // used for selling stock
  constructor(public service: ServiceService, public modalService: NgbModal) { }

  ngOnInit(): void {
    const localList = this.service.get('portfolio');
    if (typeof localList!=='undefined' && localList.length!==0) {
      // 本地有数据
      this.isEmpty = false;
      this.portFolioList = localList;
      this.updatePriceForAll();
    } else {
      // 本地无数据
      this.isEmpty = true;
    }
  }
  /**
   * update currentPrice for all items in portFolioList;
   */
  public updatePriceForAll(): void{
    for(const item of this.portFolioList){
      this.service.search(item.ticker, 'price').subscribe(data=>{
        const curPrice = data[0].last;
        item.currentPrice = curPrice;
      });
    }
  }
  /**
   * divides a by b in input
   * returns a string of two decimal palce
   */
  public divide(a,b): string{
    return (a/b).toFixed(2);
  }

  /**
   * get the change of value by
   * currentPrice - avg.cost/share
   *
   */
  public getChange(quantity, totalCost, currentPrice, key): string{
    return (currentPrice-(totalCost/quantity)).toFixed(2);
  }

  /**
   * Change color based on change
   * which is total/quantity - currentPrice
   * for colun with key accordingly.
   * @param quantity
   * @param totalCost
   * @param currentPrice
   * @param key
   */
  public setColor(quantity, totalCost, currentPrice, key): void{
    const change = currentPrice-(totalCost/quantity);
    const tag1 = document.getElementById('c'+key);
    const tag2 = document.getElementById('p'+key);
    const tag3 = document.getElementById('v'+key);
    if(change>0.0001){
      tag1.className = 'green col-6';
      tag2.className = 'green col-6';
      tag3.className = 'green col-6';
    }else if(change<-0.001){
      tag1.className = 'red col-6';
      tag2.className = 'red col-6';
      tag3.className = 'red col-6';
    }
  }
  /**
   * buy x amount of stock
   */
  public buy(ticker, purchase): void{
    this.service.search(ticker,'price').subscribe(data=>{
      this.currentPrice = data[0].last;
      this.modalService.open(purchase, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.totalOfStockToPurchase = 0;
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    });
  }
  /**
   * After user clicks the buy button,
   * the window open, now this function is to confirm user bought the stock
   * for amount use totalOfStockToPurchase
   */
  public confirmBuy(ticker): void{
    this.modalService.dismissAll('user bought');
    const temp = this.portFolioList.find(item=>item.ticker===ticker);
    temp.quantity+=this.totalOfStockToPurchase;
    temp.totalCost+=(this.totalOfStockToPurchase*this.currentPrice);
    this.portFolioList = this.portFolioList.filter(
      data=>data.ticker !== ticker
    );
    this.portFolioList.push(temp);
    // sort Alphabetically
    this.portFolioList.sort((a,b)=>(a.ticker>b.ticker)?1:((b.ticker>a.ticker)?-1:0));
    this.service.set('portfolio', this.portFolioList);
  }
  /**
   * Dismiss reason fo modal
   * @param reason
   * @private
   */

  public sell(ticker, sale): void{
    this.service.search(ticker,'price').subscribe(data=>{
      this.currentPrice = data[0].last;
      this.modalService.open(sale, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.totalOfStockToSell = 0;
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    });
  }

  public confirmSell(ticker): void{
    const temp = this.portFolioList.find(item=>item.ticker===ticker);
    const quanRecord = temp.quantity;
    if(quanRecord<this.totalOfStockToSell){
      // 库存比卖的数量少
      console.log('not enough to sell');
    }else if(quanRecord === this.totalOfStockToSell){
      this.portFolioList = this.portFolioList.filter(
        data=>data.ticker !== ticker
      );
      this.service.set('portfolio', this.portFolioList);
      if(this.portFolioList.length===0){this.isEmpty = true;}
      this.modalService.dismissAll('user sold');
    }else{
      const temp = this.portFolioList.find(item=>item.ticker===ticker);
      temp.quantity-=this.totalOfStockToSell;
      temp.totalCost-=(this.totalOfStockToSell*this.currentPrice);
      this.portFolioList = this.portFolioList.filter(
        data=>data.ticker !== ticker
      );
      this.portFolioList.push(temp);
      // sort Alphabetically
      this.portFolioList.sort((a,b)=>(a.ticker>b.ticker)?1:((b.ticker>a.ticker)?-1:0));
      this.service.set('portfolio', this.portFolioList);
      this.modalService.dismissAll('user sold');
    }
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }



}
