var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { NavParams, Searchbar } from 'ionic-angular';
var SelectSearchablePage = /** @class */ (function () {
    function SelectSearchablePage(navParams) {
        var _this = this;
        this.selectedItems = [];
        this.selectComponent = navParams.get('selectComponent');
        this.navController = navParams.get('navController');
        this.filteredItems = this.selectComponent.items;
        this.filterItems();
        if (this.selectComponent.value) {
            if (this.selectComponent.multiple) {
                this.selectComponent.value.forEach(function (item) {
                    _this.selectedItems.push(item);
                });
            }
            else {
                this.selectedItems.push(this.selectComponent.value);
            }
        }
    }
    SelectSearchablePage.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.searchbarComponent) {
            // Focus after a delay because focus doesn't work without it.
            setTimeout(function () {
                _this.searchbarComponent.setFocus();
            }, 1000);
        }
    };
    SelectSearchablePage.prototype.isItemSelected = function (item) {
        var _this = this;
        return this.selectedItems.find(function (selectedItem) {
            if (_this.selectComponent.itemValueField) {
                return item[_this.selectComponent.itemValueField] === selectedItem[_this.selectComponent.itemValueField];
            }
            return item === selectedItem;
        }) !== undefined;
    };
    SelectSearchablePage.prototype.deleteSelectedItem = function (item) {
        var _this = this;
        var itemToDeleteIndex;
        this.selectedItems.forEach(function (selectedItem, itemIndex) {
            if (_this.selectComponent.itemValueField) {
                if (item[_this.selectComponent.itemValueField] === selectedItem[_this.selectComponent.itemValueField]) {
                    itemToDeleteIndex = itemIndex;
                }
            }
            else if (item === selectedItem) {
                itemToDeleteIndex = itemIndex;
            }
        });
        this.selectedItems.splice(itemToDeleteIndex, 1);
    };
    SelectSearchablePage.prototype.addSelectedItem = function (item) {
        this.selectedItems.push(item);
    };
    SelectSearchablePage.prototype.select = function (item) {
        if (this.selectComponent.multiple) {
            if (this.isItemSelected(item)) {
                this.deleteSelectedItem(item);
            }
            else {
                this.addSelectedItem(item);
            }
        }
        else {
            if (!this.isItemSelected(item)) {
                this.selectedItems = [];
                this.addSelectedItem(item);
                this.selectComponent.select(item);
            }
            this.close();
        }
    };
    SelectSearchablePage.prototype.ok = function () {
        this.selectComponent.select(this.selectedItems.length ? this.selectedItems : null);
        this.close();
    };
    SelectSearchablePage.prototype.close = function () {
        var _this = this;
        // Focused input interferes with the animation.
        // Blur it first, wait a bit and then close the page.
        if (this.searchbarComponent) {
            this.searchbarComponent._fireBlur();
        }
        setTimeout(function () {
            _this.navController.pop();
            if (!_this.selectComponent.hasSearchEvent) {
                _this.selectComponent.filterText = '';
            }
        });
    };
    SelectSearchablePage.prototype.reset = function () {
        this.navController.pop();
        this.selectComponent.reset();
    };
    SelectSearchablePage.prototype.filterItems = function () {
        var _this = this;
        if (this.selectComponent.hasSearchEvent) {
            if (this.selectComponent.isNullOrWhiteSpace(this.selectComponent.filterText)) {
                this.selectComponent.items = [];
            }
            else {
                // Delegate filtering to the event.
                this.selectComponent.emitSearch();
            }
        }
        else {
            // Default filtering.
            if (!this.selectComponent.filterText || !this.selectComponent.filterText.trim()) {
                this.filteredItems = this.selectComponent.items;
                return;
            }
            var filterText_1 = this.selectComponent.filterText.trim().toLowerCase();
            this.filteredItems = this.selectComponent.items.filter(function (item) {
                return item[_this.selectComponent.itemTextField].toLowerCase().indexOf(filterText_1) !== -1;
            });
        }
    };
    __decorate([
        ViewChild('searchbarComponent'),
        __metadata("design:type", Searchbar)
    ], SelectSearchablePage.prototype, "searchbarComponent", void 0);
    SelectSearchablePage = __decorate([
        Component({
            selector: 'select-searchable-page',
            template: "\n    <ion-header>\n    <ion-navbar>\n        <ion-title>{{selectComponent.title}}</ion-title>\n    </ion-navbar>\n    <ion-toolbar *ngIf=\"selectComponent.canSearch\">\n        <ion-searchbar\n            #searchbarComponent\n            [(ngModel)]=\"selectComponent.filterText\"\n            (ionInput)=\"filterItems()\"\n            [placeholder]=\"selectComponent.searchPlaceholder || 'Search'\">\n        </ion-searchbar>\n    </ion-toolbar>\n    </ion-header>\n    <ion-content>\n        <div class=\"select-searchable-spinner\" *ngIf=\"selectComponent.isSearching\">\n            <div class=\"select-searchable-spinner-background\"></div>\n            <ion-spinner></ion-spinner>\n        </div>\n        <ion-list no-margin *ngIf=\"filteredItems.length\">\n            <button ion-item detail-none *ngFor=\"let item of filteredItems\" (click)=\"select(item)\">\n                <ion-icon\n                    [name]=\"isItemSelected(item) ? 'checkmark-circle' : 'radio-button-off'\"\n                    [color]=\"isItemSelected(item) ? 'primary' : 'daek'\"\n                    item-left>\n                </ion-icon>\n                <h2>{{selectComponent.formatItem(item)}}</h2>\n            </button>\n        </ion-list>\n        <div *ngIf=\"!filteredItems.length\" margin>{{selectComponent.searchNotFoundLabel}}</div>\n    </ion-content>\n    <ion-footer *ngIf=\"selectComponent.canReset || selectComponent.multiple\">\n        <ion-toolbar padding>\n            <ion-row>\n                <ion-col no-padding *ngIf=\"selectComponent.canReset\"\n                    [attr.col-6]=\"selectComponent.canReset && selectComponent.multiple ? '' : null\"\n                    [attr.col-12]=\"selectComponent.canReset && !selectComponent.multiple ? '' : null\">\n                    <button ion-button full no-margin (click)=\"reset()\" [disabled]=\"!selectedItems.length\">\n                        Clear\n                    </button>\n                </ion-col>\n                <ion-col no-padding *ngIf=\"selectComponent.multiple\"\n                    [attr.col-6]=\"selectComponent.canReset && selectComponent.multiple ? '' : null\"\n                    [attr.col-12]=\"!selectComponent.canReset && selectComponent.multiple ? '' : null\">\n                    <button ion-button full no-margin (click)=\"ok()\">\n                        OK\n                    </button>\n                </ion-col>\n            </ion-row>\n        </ion-toolbar>\n    </ion-footer>\n    ",
            styleUrls: ['select-searchable-page.scss'],
            host: {
                'class': 'select-searchable-page',
                '[class.select-searchable-page-can-reset]': 'selectComponent.canReset',
                '[class.select-searchable-page-multiple]': 'selectComponent.multiple'
            }
        }),
        __metadata("design:paramtypes", [NavParams])
    ], SelectSearchablePage);
    return SelectSearchablePage;
}());
export { SelectSearchablePage };
//# sourceMappingURL=select-searchable-page.js.map