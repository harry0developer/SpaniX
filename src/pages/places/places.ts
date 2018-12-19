import { Component, NgZone } from '@angular/core';
import { Events, NavController, ViewController } from 'ionic-angular';
import { FeedbackProvider } from '../../providers/feedback/feedback';

declare var google: any;
@Component({
  selector: 'page-places',
  templateUrl: 'places.html'
})
export class PlacesPage {
  autocomplete: any;
  GoogleAutocomplete: any;
  geocoder: any
  autocompleteItems: any;

  constructor(
    public zone: NgZone,
    private events: Events,
    private navCtrl: NavController,
    private viewCtrl: ViewController,
    private feedbackProvider: FeedbackProvider,
  ) {
    this.geocoder = new google.maps.Geocoder;
    let elem = document.createElement("div");
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = {
      input: '',
    };
    this.autocompleteItems = [];
  }


  updateSearchResults(){
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      {
        input: this.autocomplete.input,
        componentRestrictions: { country: 'za' }
      },
      (predictions, status) => {
        this.autocompleteItems = [];
        if(predictions){
          this.zone.run(() => {
            predictions.forEach((prediction) => {
              this.autocompleteItems.push(prediction);
            });
          });
        }
    });
  }

  selectSearchResult(item){
    this.feedbackProvider.presentLoading();
    let data;
    this.autocompleteItems = [];
    this.geocoder.geocode({'placeId': item.place_id}, (results, status) => {
      if(status === 'OK' && results[0]){
        data = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          address: item.description,
        }
        this.feedbackProvider.dismissLoading();
        this.dismiss(data);
      } else {
        this.feedbackProvider.dismissLoading();
        this.dismiss(undefined)
      }
    });
  }

  clearFilter() {
    this.dismiss(undefined);
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }
}
