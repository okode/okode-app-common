import { Component } from '@angular/core';
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
  styles:[`
  $splash-loading-background-color: color($colors, primary);
  $splash-loading-background-image: none;
  ion-content {
    .scroll-content {
      background-color: $splash-loading-background-color;
      background-image: $splash-loading-background-image;
      background-size: cover;
      text-align: center;
      color: white;
      padding-bottom: 100px !important;
      overflow-y: hidden !important;
      min-height: 500px;
    }
    .loading {
      width: 100%;
      height: 100%;
      margin: 50% auto;
    }
    ion-spinner {
      display: block;
      margin: 10px auto;
      * {
        stroke: white !important;
      }
  
      &.spinner-circles circle,
      &.spinner-bubbles circle,
      &.spinner-dots circle {
        fill: white !important;
      }
    }
  }
  `]
})
export class SplashLoadingComponent {

  constructor(private platform: Platform, private splashScreen: SplashScreen) {}

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.splashScreen.hide();
    });
  }
}
