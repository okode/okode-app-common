import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
var ModalWrapperComponent = /** @class */ (function () {
    function ModalWrapperComponent(viewCtrl, navParams) {
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
    }
    ModalWrapperComponent.prototype.ngOnInit = function () {
        this.root = this.navParams.get('root');
        this.rootParams = this.navParams.get('params');
    };
    ModalWrapperComponent.decorators = [
        { type: Component, args: [{
                    selector: 'modal-wrapper',
                    template: "<ion-nav [root]=\"root\" [rootParams]=\"rootParams\"></ion-nav>"
                },] },
    ];
    /** @nocollapse */
    ModalWrapperComponent.ctorParameters = function () { return [
        { type: ViewController, },
        { type: NavParams, },
    ]; };
    return ModalWrapperComponent;
}());
export { ModalWrapperComponent };
//# sourceMappingURL=modal-wrapper.js.map