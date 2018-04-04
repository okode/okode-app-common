import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'modal-wrapper',
  template: `<ion-nav [root]="root"></ion-nav>`
})
export class ModalWrapperComponent {

  root: any;

  constructor(
    public viewCtrl: ViewController,
    private navParams: NavParams
  ) {}

  ngOnInit() {
    this.root = this.navParams.get('root');
  }

}