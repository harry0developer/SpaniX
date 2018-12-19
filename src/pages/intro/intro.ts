import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { Slides } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage implements OnInit {
  @ViewChild('slides') slides: Slides;
  slideImage: string = '';
  baseUrl: string = 'assets/imgs/intro/slide';
  slideIndexChanged: boolean;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ngOnInit() {
    this.slideImage = `${this.baseUrl}${0}.svg`;
  }

  slideChanging() {
    this.slideIndexChanged = false;
  }
  slideChanged() {
    this.slideIndexChanged = true;
  }

  getSlideImage(): string {
    return `${this.baseUrl}${this.slides.getActiveIndex()}.svg`;
  }

  slideNext() {
    this.slides.slideNext();
    this.slideImage = this.getSlideImage();
  }

  slidePrev() {
    this.slides.slidePrev();
    this.slideImage = this.getSlideImage();
  }

  isLastSlide(): boolean {
    return this.slides.isEnd();
  }

  isFirstSlide(): boolean {
    return this.slides.isBeginning();
  }

  gotIt() {
    this.navCtrl.pop();
  }

}
