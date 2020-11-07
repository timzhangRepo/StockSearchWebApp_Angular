import { Component, OnInit , OnDestroy} from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import {ServiceService} from '../../services/service.service';
import {MatTabsModule} from '@angular/material/tabs';
import {interval, Subscription} from 'rxjs';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import vbp from 'highcharts/indicators/volume-by-price';
import * as Highcharts from 'highcharts/highstock.src';
import {chart, Options} from 'highcharts';
import more from 'highcharts/highcharts-more';
import IndicatorsCore from 'highcharts/indicators/indicators';
import HC_stock from 'highcharts/modules/stock';

more(Highcharts);
IndicatorsCore(Highcharts);
vbp(Highcharts);
HC_stock(Highcharts);
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit,OnDestroy {

  subscription: Subscription;
  ticker: string = undefined;
  lastRecord: any = {0: 'temp'}; // Pre-filled words to avoid error call.
  genRecord: any = {0: 'temp'};
  newsRecord: Array<any>;
  lastSaleTimestamp: string;
  marketOpen = true;
  change: string;
  changePercentage: string;
  stockWentUp = false; // boolean variable true iff stock goes up
  newsIdxClicked: number; // variable for tracking which news user clicked.

  resultsFound = true;

  watchListStar = false; // false is star borer, true is star :)
  stockAddedSign = false;
  closeResult = '';
  total = 1;
  watchListdata: any[] = [];
  portFoliodata: any = [];
  boughtsucessful = false;
  // variables for highcharts

  chart;
  chart2;
  updateFromInput = false;
  updateFromInput2 = false;
  chartConstructor = 'stockChart';
  chartConstructor2 = 'stockChart';
  chartCallback;
  chartCallback2;
  Highcharts = Highcharts;
  Highcharts2 = Highcharts;
  chartOptions: Options = {
    title: {
      text: 'loading'
    },
    series: [],
    exporting: {
      enabled: true
    },
    rangeSelector:{
      enabled: false
    },
  };

  groupingUnits: any = [[
    'week',             // unit name
    [1]               // allowed multiples
  ], [
    'month',
    [1, 2, 3, 4, 6]
  ]];

  chartOptions2: Options = {
    rangeSelector: {
      selected: 2
    },

    title: {
      text: 'AAPL Historical'
    },

    subtitle: {
      text: 'With SMA and Volume by Price technical indicators'
    },

    yAxis: [{
      startOnTick: false,
      endOnTick: false,
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'OHLC'
      },
      height: '60%',
      lineWidth: 2,
      resize: {
        enabled: true
      }
    }, {
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'Volume'
      },
      top: '65%',
      height: '35%',
      offset: 0,
      lineWidth: 2
    }],

    tooltip: {
      split: true
    },

    plotOptions: {
      series: {
        dataGrouping: {
          units: this.groupingUnits
        }
      }
    }
  };

  constructor(public route: ActivatedRoute, public service: ServiceService, public modalService: NgbModal) {
    const self = this;
    this.chartCallback = chart => {
      self.chart = chart;
    };
    this.chartCallback2 = chart2 =>{
      self.chart2 = chart2;
    };
  }

  ngOnInit(): void {
    const source = interval(15000); // Every 15s; !!!!!!15000 when pushed to restfulServer
    this.route.paramMap.subscribe(params => {
      this.ticker = params.get('ticker');
      this.chartOptions.title.text = this.ticker;
    });
    this.service.search(this.ticker, 'daily').subscribe(data => {
      this.genRecord = data;
      if (data.detail === 'Not found.') {
        this.resultsFound = false;
      }
    });
    this.updatePriceFromServer();
    this.service.search(this.ticker, 'news').subscribe(data => {
      this.newsRecord = data.articles.slice(0, 20);
    });
    this.subscription = source.subscribe(val => this.updatePriceFromServer());
    // 更新本地储存数据
    const searchWatchListFromLocalStroage: any = this.service.get('watchlist');
    if (searchWatchListFromLocalStroage) {
      this.watchListdata = searchWatchListFromLocalStroage;
      const check = this.watchListdata.some(item => item.ticker === this.ticker);
      if (check) {
        this.watchListStar = true;
      }
    }


    const portFolioListFromLocalStorage: any = this.service.get('portfolio');
    if (portFolioListFromLocalStorage) {
      this.portFoliodata = portFolioListFromLocalStorage;
    }
    const standard = new Date();
    const twoYearsFromToday = new Date(standard.getUTCFullYear()-2,standard.getMonth(),standard.getDay());
    const requestDate2 = this.formatDate(twoYearsFromToday);
    this.service.search(this.ticker, 'hist/'+requestDate2).subscribe(data =>{
      let ohlc = [];
      let volume = [];
      for(let i=0; i<data.length; i++){
        const d = data[i].date;
        const date = Date.UTC(d.substring(0, 4), d.substring(5, 7) - 1, d.substring(8, 10));
        ohlc.push([
          date, // the date
          data[i].open,
          data[i].high,
          data[i].low,
          data[i].close
        ]);
        volume.push([
          date, // the date
          data[i].volume
        ]);
      }
      this.onInitChart2(ohlc, volume, this.ticker);
    });


  }

  ngOnDestroy(): void {
    // For method 1
    this.subscription.unsubscribe();
  }

  public checkMarketIsOpen(): void {
    // test open: 'November 2, 2020 09:30:00'
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const day = currentDate.getDay();
    const min = currentDate.getMinutes();
    if (day === 6 || day === 7) {
      this.marketOpen = false;
    } else if (hours < 8 || hours >= 16) {
      this.marketOpen = false;
    } else if (hours === 8 && min < 30) {
      this.marketOpen = false;
    } else {
      this.marketOpen = true;
    }
  }

  public updatePriceFromServer(): void {
    this.service.search(this.ticker, 'price').subscribe(data => {
      this.lastRecord = data;
      this.lastSaleTimestamp = this.lastRecord[0].lastSaleTimestamp;
      // calcualte change
      const c: number = this.lastRecord[0].last - this.lastRecord[0].prevClose;
      if (c > 0) {
        this.stockWentUp = true;
      }
      this.change = c.toFixed(2);
      this.changePercentage = ((c * 100) / (this.lastRecord[0].prevClose)).toFixed(2);
    });
    const standard = new Date();
    const requestDate = this.formatDate(standard);
    this.service.search(this.ticker, 'prices/'+requestDate).subscribe(data => {
      const lastpricedata = [];
      const dif = standard.getTimezoneOffset()*60000;
      for (let i = 0; i < data.length; i++) {
        const d = data[i].date;
        const date = Date.UTC(d.substring(0, 4), d.substring(5, 7) - 1, d.substring(8, 10),d.substring(11,13),d.substring(14,16))-(dif);
        const point = [date, data[i].close];
        lastpricedata.push(point);
      }
      this.onInitChart(lastpricedata);
    });
    this.checkMarketIsOpen();
  }
   formatDate(date): string{
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    const year = date.getFullYear();

    if (month.length < 2){
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    return [year, month, day].join('-');
  }

  // Modal for news
  public open(content, id): void {
    this.newsIdxClicked = id;
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  // Modal for purchase
  public buy(purchase, id): void {
    this.total = 1;
    this.modalService.open(purchase, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

  /**
   *
   * @param actionValue 0 = add, 1 = remove
   */
  public watchListAddRemove(actionValue, ticker): void {
    const temp = {
      ticker: this.genRecord.ticker,
      name: this.genRecord.name
    };
    if (actionValue === '0') {
      if (!this.watchListdata.some(item => item.ticker === this.genRecord.ticker)) {
        this.watchListdata.push(temp);
        this.watchListdata.sort((a, b) => (a.ticker > b.ticker) ? 1 : ((b.ticker > a.ticker) ? -1 : 0));
        this.service.set('watchlist', this.watchListdata);
      }
      this.watchListStar = true;
      this.stockAddedSign = true;
    } else {
      this.watchListdata = this.watchListdata.filter(
        data => data.ticker !== ticker
      );
      this.watchListdata.sort((a, b) => (a.ticker > b.ticker) ? 1 : ((b.ticker > a.ticker) ? -1 : 0));
      this.service.set('watchlist', this.watchListdata);
      this.watchListStar = false;
      this.stockAddedSign = false;
    }
    // add to watch list and remove to watchlist local memory
  }

  // add total of purchased stok to portfolio
  public portFolioAdd(): void {
    this.modalService.dismissAll('user bought stock');
    this.boughtsucessful = true;
    // 这里需要写如果数据库有这个stock的情况
    if (this.portFoliodata.some(item => item.ticker === this.genRecord.ticker)) {
      const temp = this.portFoliodata.find(item => item.ticker === this.genRecord.ticker);
      temp.quantity += this.total;
      temp.totalCost += (this.total * this.lastRecord[0].last);
      this.portFoliodata = this.portFoliodata.filter(
        data => data.ticker !== this.genRecord.ticker
      );
      this.portFoliodata.push(temp);
      this.portFoliodata.sort((a, b) => (a.ticker > b.ticker) ? 1 : ((b.ticker > a.ticker) ? -1 : 0));
      this.service.set('portfolio', this.portFoliodata);
    } else {
      // 这个是数据库压根没有这个stock的情况
      const data = {
        ticker: this.ticker,
        name: this.genRecord.name,
        quantity: this.total,
        totalCost: this.lastRecord[0].last * this.total,
        currentPrice: this.lastRecord[0].last,
      };
      this.portFoliodata.push(data);
      this.portFoliodata.sort((a, b) => (a.ticker > b.ticker) ? 1 : ((b.ticker > a.ticker) ? -1 : 0));
      this.service.set('portfolio', this.portFoliodata);
    }
  }

  public onInitChart(DATA): void {
    const self = this,
      chart = this.chart;

    chart.showLoading();
    setTimeout(() => {
      chart.hideLoading();
      self.chartOptions.series = [
        {
          tooltip:{
            valueDecimals:2
          },
          data: DATA,
          name: 'AAPL',
          type: 'line'
        },
      ];
      self.updateFromInput = true;
    }, 2000);
  }

  public onInitChart2(ohlc, volume, ticker: string): void{
    const self = this,
      chart = this.chart2;
    chart.showLoading();
    setTimeout(()=>{
      chart.hideLoading();
      self.chartOptions2.series = [
        {
          type: 'candlestick',
          name: ticker,
          id: 'aapl',
          zIndex: 2,
          data: ohlc
        },{
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: volume,
          yAxis: 1
        }, {
          type: 'vbp',
          linkedTo: 'aapl',
          params: {
            volumeSeriesID: 'volume'
          },
          dataLabels: {
            enabled: false
          },
          zoneLines: {
            enabled: false
          }
        }, {
          type: 'sma',
          linkedTo: 'aapl',
          zIndex: 1,
          marker: {
            enabled: false
          }
        }
      ];
      self.updateFromInput2 = true;
    },2000);
  }
}
