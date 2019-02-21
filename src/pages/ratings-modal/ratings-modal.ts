import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';

@IonicPage()
@Component({
  selector: 'page-ratings-modal',
  templateUrl: 'ratings-modal.html',
})
export class RatingsModalPage {

  rating: number = 0;
  user;
  constructor(
    public navParams: NavParams,
    public dataProvider: DataProvider,
    public viewController: ViewController) {
  }

  ionViewDidLoad() {
    this.user = this.navParams.get('user');
    console.log(this.user);

  }

  rateUser(rating) {
    if (rating > 0) {
      this.rating = rating;
    }
  }

  dismiss() {
    this.viewController.dismiss();
  }
  completeRating() {
    this.user.ratings.rating = this.user.ratings.rating > 0 ? (this.rating + this.user.ratings.rating) / 2 : this.rating;
    this.viewController.dismiss(this.user);
  }

  profilePicture(): string {
    return this.dataProvider.getMediaUrl() + this.user.picture;
  }

  get updateUserRate() {
    const rate = this.rating > 0 ? (this.user.ratings.rating + this.rating) / 2 : this.user.ratings.rating;
    return (Math.floor(rate * 100) / 100).toFixed(1);
  }

}
