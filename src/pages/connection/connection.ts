import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { ConnectionProvider } from '../../providers/connection/connection';

@IonicPage()
@Component({
  selector: 'page-connection',
  templateUrl: 'connection.html',
})
export class ConnectionPage {

  constructor(public connectionProvider: ConnectionProvider) {}

  retry() {
    this.connectionProvider.getConnection();
  }

}
