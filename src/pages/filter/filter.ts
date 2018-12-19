import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ViewController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';

@IonicPage()
@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html',
})
export class FilterPage {
  categories: any = [];
  constructor(
    public dataProvider: DataProvider,
    public navCtrl: NavController,
    public events: Events,
    public viewCtrl: ViewController,
  ) {
  }

  ionViewDidLoad() {
    this.dataProvider.getCategories().then(res => {
      this.categories = res;
      console.log(res);
    }).catch(err => {
      console.log(err);
    });
  }

  filter(category){
    console.log(category);

    this.viewCtrl.dismiss(category);
  }

  clearFilter() {
    this.events.publish('filter:clear');
    this.viewCtrl.dismiss();
  }

}
