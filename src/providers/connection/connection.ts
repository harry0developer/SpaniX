import { Network } from '@ionic-native/network';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

@Injectable()
export class ConnectionProvider {

  constructor(private network: Network, private events: Events) { }

  getConnection(){
    const disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.events.publish('network:disconnected');
    });

    const connectSubscription = this.network.onConnect().subscribe(() => {
      setTimeout(() => {
        this.events.publish('network:connected');
      }, 3000);
    });

  }

}
