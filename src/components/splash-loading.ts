import { Component, ViewEncapsulation } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'splash-loading-component',
  template: `
  <ion-content padding>
    <div class="loading">
      <ion-spinner></ion-spinner><span>Loading...</span>
    </div>
  </ion-content>
  `,
  styleUrls: [`splash-loading.scss`]
})
export class SplashLoadingComponent {

  constructor(private platform: Platform, private splashScreen: SplashScreen) {}

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.splashScreen.hide();
    });
  }
}
