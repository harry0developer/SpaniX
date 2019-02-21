import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ModalController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { DataProvider } from '../../providers/data/data';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { PostJobPage } from '../post-job/post-job';
import { bounceIn } from '../../util/animations';
import 'rxjs/add/operator/debounceTime.js';
import { Profile } from '../../models/Profile';
import { Location } from '../../models/location';
import { Rating, Rate } from '../../models/Ratings';
import { UserDetailsPage } from '../user-details/user-details';

@IonicPage()
@Component({
  selector: 'page-candidates',
  templateUrl: 'candidates.html',
  animations: [bounceIn]
})
export class CandidatesPage {
  candidates: any = [];
  tmpCandidates: any = [];
  searchTerm: string = '';
  searchControl: FormControl;
  searching: any = false;
  activeCategory: string = 'All';
  categories: any = [];
  profile: Profile;
  location: Location;
  ratings: Rate;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private dataProvider: DataProvider,
    private feedbackProvider: FeedbackProvider,
    private events: Events,
    public modalCtrl: ModalController

  ) {
    this.searchControl = new FormControl();
    this.profile = this.dataProvider.getProfile();
    this.getCategories();
  }

  ionViewWillEnter() {
    this.events.subscribe(this.dataProvider.USER_RATED, () => {
      this.ratings = this.dataProvider.getMyRatingsData(this.profile.user_id);
      console.log('Rating: ', this.ratings);

      // this.setUserRatings();
    });
  }

  ionViewDidLoad() {
    this.setFilteredCandidates();


    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.setFilteredCandidates();
    });
    this.ratings = this.dataProvider.getMyRatingsData(this.profile.user_id);


  }

  // setUserRatings() {
  //   if (this.ratings && this.candidates) {
  //     this.ratings.map(user_rates => {
  //       for (let i = 0; i < this.candidates.length; i++) {
  //         if (user_rates.user_id_fk === this.candidates[i].user_id) {
  //           this.candidates[i].rating = user_rates.rating;
  //         }
  //       }
  //     })
  //   }
  // }

  setFilteredCandidates() {
    let candidates = [];
    this.location = this.dataProvider.getLocation();
    candidates = this.dataProvider.filterCandidates(this.searchTerm);

    if (this.location && this.location.lat && this.location.lng) {
      candidates = this.dataProvider.applyHaversine(this.candidates, this.location.lat, this.location.lng);
    }
    this.candidates = this.setCandidatesRating(candidates);
    this.tmpCandidates = this.candidates;
  }

  viewUserDetails(candidate) {
    this.navCtrl.push(UserDetailsPage, { user: candidate });
  }

  onSearchInput() {
    this.searching = true;
  }

  filterCandidates(category) {
    this.activeCategory = category.name;
    if (category.name.toLowerCase() === 'all') {
      this.candidates = this.tmpCandidates;
    } else {
      this.candidates = this.tmpCandidates || [];
      this.candidates = this.candidates.filter(candidate => candidate.title.toLowerCase() === category.name.toLowerCase());
    }
  }

  setCandidatesRating(candidates): Profile {
    for (let i = 0; i < candidates.length; i++) {
      candidates[i].ratings = this.dataProvider.getMyRatingsData(candidates[i].user_id);
    }
    return candidates;
  }

  doRefresh(refresher) {
    this.dataProvider.initializeData();
    refresher.complete();
  }


  postJob() {
    let profileModal = this.modalCtrl.create(PostJobPage, { action: 'post' });
    profileModal.onDidDismiss(data => {
      if (data) {
        this.events.publish(this.dataProvider.JOBS_UPDATED, data);
        this.feedbackProvider.presentAlert("Your post was successful", "To manage your posts, go to 'My Jobs' on the side menu navigation")
      } else {
        console.log("Clear filter");
      }
    });
    profileModal.present();
  }

  getCategories() {
    this.dataProvider.getCategories().then(res => {
      this.categories = res;
    }).catch(err => {
      console.log(err);
    });
  }

  profilePicture(profile): string {
    return this.dataProvider.getMediaUrl() + profile.picture;
  }

  getDefaultProfilePic(profile) {
    return `${this.dataProvider.getMediaUrl()}${profile.gender}.svg`;
  }

}
