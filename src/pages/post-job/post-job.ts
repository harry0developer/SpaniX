import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, ActionSheetController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { PlacesPage } from '../places/places';
import { itemSlideUp } from '../../util/animations';

@IonicPage()
@Component({
  selector: 'page-post-job',
  templateUrl: 'post-job.html',
  animations: [itemSlideUp]

})
export class PostJobPage {
  data: any;
  categories: any = [];
  skills: any;
  address;
  profile: any;
  constructor(
    public navCtrl: NavController,
    private dataProvider: DataProvider,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    private feedbackProvider: FeedbackProvider,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.data = {};
  }

  ionViewDidLoad() {
    const action = this.navParams.get('action');
    if (action === 'edit') {
      this.data = this.navParams.get('job');
    }
    this.dataProvider.getCategories().then(res => {
      this.categories = res;
      if (action === 'edit') {
        this.skills = this.getSkills(this.categories, this.data.category);
      }
    });
    this.profile = this.dataProvider.getProfile();
  }

  getSkills(all, cat) {
    const res = all.filter(c => c.name.toLowerCase() === cat.toLowerCase());
    return res[0].skills;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  selectedCategory(cat) {
    this.categories.forEach(cate => {
      if (cate.name == cat) {
        this.skills = cate.skills;
      }
    });
  }


  postJob() {
    this.feedbackProvider.presentLoading("Please wait...");
    let res;

    if (!this.data.job_id) {
      this.data.job_id = -9999;
    }
    if (this.data && this.data.skills) {
      this.data.skills = this.data.skills.toString();
    }
    this.data.date_posted = this.dataProvider.getDate();
    this.data.recruiter_id_fk = this.profile.user_id;
    console.log(this.data);

    this.dataProvider.postDataToDB(this.data, "addToJobs").then((result) => {
      res = result;
      if (res && res.error) {
        this.feedbackProvider.dismissLoading();
        this.feedbackProvider.presentAlert("Something went wrong", 'Please complete the form and try again');
      } else {
        this.feedbackProvider.dismissLoading();
        this.viewCtrl.dismiss(res.data);
        this.feedbackProvider.presentToast("Job has been updated successfully");
      }
    }).catch(err => {
      this.feedbackProvider.presentAlert("Something went wrong", 'Please complete the form and try again');
      this.feedbackProvider.dismissLoading();
    })
  }


  showAddressModal() {
    let modal = this.modalCtrl.create(PlacesPage);
    modal.onDidDismiss(data => {
      if (data) {
        this.data.address = data.address;
        this.data.lat = data.lat;
        this.data.lng = data.lng;
      }
    });
    modal.present();
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Your changes will be discarded, are you sure you want to cancel?',
      buttons: [
        {
          text: 'Yes discard',
          role: 'destructive',
          handler: () => {
            this.dismiss();
          }
        },
        {
          text: "Don't discard",
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }
}
