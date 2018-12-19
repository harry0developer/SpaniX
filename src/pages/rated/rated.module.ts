import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RatedPage } from './rated';

@NgModule({
  declarations: [
    RatedPage,
  ],
  imports: [
    IonicPageModule.forChild(RatedPage),
  ],
})
export class RatedPageModule {}
