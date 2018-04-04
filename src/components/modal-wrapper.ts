import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'modal-wrapper',
  template: `<ion-nav [root]="root" [rootParams]="rootParams"></ion-nav>`
})
export class ModalWrapperComponent {

  root: any;
  rootParams: any;

  constructor(
    public viewCtrl: ViewController,
    private navParams: NavParams
  ) {}

  ngOnInit() {
    this.root = this.navParams.get('root');
    this.rootParams = this.navParams.get('params');
  }

}