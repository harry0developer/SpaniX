import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserDetailsPage } from '../user-details/user-details';
import { DataProvider } from '../../providers/data/data';
import { Profile } from '../../models/Profile';
import { bounceIn } from '../../util/animations';
import { Rating } from '../../models/Ratings';

@IonicPage()
@Component({
  selector: 'page-ratings',
  templateUrl: 'ratings.html',
  animations: [bounceIn]
})
export class RatingsPage {
  usersIRated: Array<Rating> = [];
  usersRatedMe: Array<Rating> = [];
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

    this.users = this.profile.type === this.dataProvider.USER_TYPE_CANDIDATE ? this.dataProvider.getCandidates() : this.dataProvider.getRecruiters();

    const ratingsData = this.navParams.get('ratingsData');
    console.log(ratingsData);
    this.usersRatedMe = this.mapRatersToUsers(ratingsData.ratedMe);
    this.usersIRated = this.mapRatersToUsers(ratingsData.iRated);

    this.setRatings();
  }

  mapRatersToUsers(raters) {
    let data: Array<Rating> = [];
    console.log(raters);

    raters.forEach(rater => {
      this.users.forEach(user => {
        if (rater.rated_id_fk === user.user_id) {
          data.push(user);
        }
        else if (rater.rater_id_fk === user.user_id) {
          data.push(user);
        }
      });
    });
    return data;
  }

  setRatings() {
    // const iRated = this.dataProvider.getUsersIRated(this.profile.user_id);
    // const ratedMe = this.dataProvider.getUsersRatedMe(this.profile.user_id);

    // this.usersIRated = this.mapRaters(iRated);
    // this.usersRatedMe = this.mapRaters(ratedMe);
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

  getUsersIRated() {
    // const rated = this.dataProvider.getUsersIRated(this.profile.user_id);
    // this.usersIRated = this.mapRaters(rated);
  }

  getUsersRatedMe() {
    // const rated = this.dataProvider.getUsersRatedMe(this.profile.user_id);
    // this.usersRatedMe = this.mapRaters(rated);
  }

  getUserDetails(user) {
    this.navCtrl.push(UserDetailsPage, { user })
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
