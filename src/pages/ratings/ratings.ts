import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserDetailsPage } from '../user-details/user-details';
import { DataProvider } from '../../providers/data/data';
import { Profile } from '../../models/Profile';
import { bounceIn } from '../../util/animations';
import { Rating, Rate } from '../../models/Ratings';

@IonicPage()
@Component({
  selector: 'page-ratings',
  templateUrl: 'ratings.html',
  animations: [bounceIn]
})
export class RatingsPage {
  usersIRated: Array<Rating> = [];
  usersRatedMe: Array<Rating> = [];
  userRatings;
  users = [];
  profile: Profile;
  ratings: string = 'ratedMe';

  RATED: 'rated';
  RATER: 'rater';
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public dataProvider: DataProvider) {
  }

  ionViewDidLoad() {
    this.profile = this.dataProvider.getProfile();
    this.users = this.dataProvider.getUsers();
    this.userRatings = this.navParams.get('ratingsData');
    this.usersRatedMe = this.mapUserRatedMe();
    this.usersIRated = this.mapUserIRated();
  }

  mapUserIRated(): any {
    let iRated = [];
    this.userRatings.iRated.forEach(rater => {
      this.users.forEach(user => {
        if (this.profile.user_id === rater.rater_id_fk && user.user_id === rater.rated_id_fk) {
          iRated.push(user);
        }
      });
    });
    return iRated;
  }

  mapUserRatedMe(): any {
    let ratedMe = [];
    this.userRatings.ratedMe.forEach(rater => {
      this.users.forEach(user => {
        if (this.profile.user_id === rater.rated_id_fk && user.user_id === rater.rater_id_fk) {
          ratedMe.push(user);
        }
      });
    });
    return ratedMe;
  }

  mapRaters(raters) {
    const users = [];
    if (raters) {
      raters.forEach(rater => {
        this.users.forEach(user => {
          if (rater.rater_id_fk === user.user_id || rater.rated_id_fk === user.user_id) {
            users.push(Object.assign(user, rater));
          }
        });
      });
    }
    return users;
  }

  getUserDetails(user) {
    this.navCtrl.push(UserDetailsPage, { user, page: 'Ratings' })
  }

  getDateRated(user) {
    return this.dataProvider.getDateTime(user.date_rated);
  }

  profilePicture(profile): string {
    return this.dataProvider.getMediaUrl() + profile.picture;
  }

  getDefaultProfilePic(profile) {
    return `${this.dataProvider.getMediaUrl()}${profile.gender}.svg`;
  }
}
