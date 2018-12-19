import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, ModalController } from 'ionic-angular';
import { PlacesPage } from '../places/places';
import { listSlideUp } from '../../util/animations';

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
  animations: [listSlideUp]
})
export class EditProfilePage {
  category: any;
  user: any;
  data: any = {phone:"", address:"", date_updated: ""};

  inputChanged: boolean = false;
  constructor(public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
  ) {
  }

  ionViewDidLoad() {
    this.user = this.navParams.get('user');
    this.data = this.user;
    this.data.lat = this.user.lat;
    this.data.lng = this.user.lng;
    this.data.phone = this.user.phone;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  updateDetails() {
    this.viewCtrl.dismiss(this.data);
  }

  showAddressModal() {
    let modal = this.modalCtrl.create(PlacesPage);
    modal.onDidDismiss(data => {
      if(data){
        this.data.address = data.address;
        this.data.lat = data.lat;
        this.data.lng = data.lng;
      }
    });
    modal.present();
  }

  phoneNumberChanged(){
    this.inputChanged = true;
  }
}
