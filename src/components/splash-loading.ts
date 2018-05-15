import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'splash-loading-component',
  templateUrl: './splash-loading.html',
  styleUrls: ['./splash-loading.scss']
})
export class SplashLoadingComponent {

  constructor(private platform: Platform, private splashScreen: SplashScreen) {}

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.splashScreen.hide();
    });
  }
}
