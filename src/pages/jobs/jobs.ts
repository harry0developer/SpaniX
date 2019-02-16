import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ModalController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { DataProvider } from '../../providers/data/data';
import { JobDetailsPage } from '../job-details/job-details';
import { LocationProvider } from '../../providers/location/location';
import { FilterPage } from '../filter/filter';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { locateHostElement } from '@angular/core/src/render3/instructions';
import { ConnectionProvider } from '../../providers/connection/connection';
import { bounceIn } from '../../util/animations';
import { Profile } from '../../models/Profile';
import { Location } from '../../models/location';

@IonicPage()
@Component({
  selector: 'page-jobs',
  templateUrl: 'jobs.html',
  animations: [bounceIn]
})
export class JobsPage {

  searchTerm: string = '';
  searchControl: FormControl;
  searching: any = false;
  jobs: any = [];
  tempJobs: any = [];
  profile: Profile;
  location: Location;
  items = ['item 1', 'item 2', 'item 3', 'item 4', 'item 5'];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private dataProvider: DataProvider,
    public events: Events,
    private modalCtrl: ModalController,
    private feedbackProvider: FeedbackProvider,
    private connectionProvider: ConnectionProvider,
  ) {
    this.searchControl = new FormControl();
    this.profile = this.dataProvider.getProfile();
  }

  ionViewDidLoad() {
    this.setFilteredJobs();
    console.log(this.jobs);
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.setFilteredJobs();
    });
  }


  setFilteredJobs() {
    this.location = this.dataProvider.getLocation();
    this.jobs = this.dataProvider.filterJobs(this.searchTerm);

    if (this.location && this.location.lat && this.location.lng) {
      this.jobs = this.dataProvider.applyHaversine(this.jobs, this.location.lat, this.location.lng);
    }
    this.tempJobs = this.jobs;
  }

  onSearchInput() {
    this.searching = true;
  }

  getDateTime(date) {
    return this.dataProvider.getDateTime(date);
  }

  jobDetails(job) {
    this.navCtrl.push(JobDetailsPage, { job: job, user: this.profile, page: 'jobs' });
  }

  doRefresh(refresher) {
    this.dataProvider.initializeData();
    this.tempJobs = this.jobs;
    refresher.complete();
  }

  filterJobs() {
    let modal = this.modalCtrl.create(FilterPage);

    modal.onDidDismiss(filter => {
      const jobz = this.dataProvider.getJobs();
      this.dataProvider.sortByDistance(jobz);
      if (filter && filter !== 'all') {
        const j = jobz.filter(job => job.category.toLowerCase() === filter.toLowerCase());
        this.jobs = this.dataProvider.sortByDistance(j);
      } else {
        this.jobs = this.dataProvider.sortByDistance(jobz);
      }
    });
    modal.present();
  }

}
