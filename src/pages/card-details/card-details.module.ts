import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardDetailsPage } from './card-details';

@NgModule({
  declarations: [
    CardDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(CardDetailsPage),
  ],
})
export class CardDetailsPageModule {}
