import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { bounceIn } from '../../util/animations';
import { Profile } from '../../models/Profile';
import { UserDetailsPage } from '../user-details/user-details';


@IonicPage()
@Component({
  selector: 'page-rated',
  templateUrl: 'rated.html',
  animations: [bounceIn]

})
export class RatedPage {
  usersIRated = [];
  usersRatedMe = [];
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

    this.users = this.profile.type === this.dataProvider.USER_TYPE_CANDIDATE ?
      this.dataProvider.getCandidates() : this.dataProvider.getRecruiters();

    this.setRatings();
  }

  setRatings() {
    const iRated = this.dataProvider.getUsersIRated(this.profile.user_id);
    const ratedMe = this.dataProvider.getUsersRatedMe(this.profile.user_id);

    this.usersIRated = this.mapUsersIRated(iRated);
    this.usersRatedMe = this.mapUsersRatedMe(ratedMe);
  }

  mapUsersIRated(raters): Array<any> {
    const users = [];
    if (raters) {
      raters.forEach(rater => {
        this.users.forEach(user => {
          if (rater.rated_id_fk === user.user_id) {
            users.push(Object.assign(user, rater));
          }
        });
      });
    }
    return users;
  }

  mapUsersRatedMe(raters): Array<any> {
    const users = [];
    if (raters) {
      raters.forEach(rater => {
        this.users.forEach(user => {
          if (rater.rater_id_fk === user.user_id) {
            users.push(Object.assign(user, rater));
          }
        });
      });
    }
    return users;
  }

  getUsersIRated() {
    const rated = this.dataProvider.getUsersIRated(this.profile.user_id);
    this.usersIRated = this.mapUsersIRated(rated);
  }

  getUsersRatedMe() {
    const rated = this.dataProvider.getUsersRatedMe(this.profile.user_id);
    this.usersRatedMe = this.mapUsersRatedMe(rated);
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
