var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Component, Input, Output, EventEmitter, Optional, forwardRef, HostListener } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Item, Form, NavController, Platform } from 'ionic-angular';
import { SelectSearchablePage } from './select-searchable-page';
var SelectSearchable = /** @class */ (function () {
    function SelectSearchable(navController, ionForm, platform, ionItem) {
        this.navController = navController;
        this.ionForm = ionForm;
        this.platform = platform;
        this.ionItem = ionItem;
        this._items = [];
        this.filterText = '';
        this.value = null;
        this.canSearch = false;
        this.canReset = false;
        this.searchPlaceholder = 'Enter 3 or more characters';
        this.onChange = new EventEmitter();
        this.onSearch = new EventEmitter();
        this.propagateChange = function (_) { };
    }
    SelectSearchable_1 = SelectSearchable;
    Object.defineProperty(SelectSearchable.prototype, "items", {
        get: function () {
            return this._items;
        },
        set: function (items) {
            // The original reference of the array should be preserved to keep two-way data binding working between SelectSearchable and SelectSearchablePage.
            this._items.splice(0, this._items.length);
            // Add new items to the array.
            Array.prototype.push.apply(this._items, items);
        },
        enumerable: true,
        configurable: true
    });
    SelectSearchable.prototype.isNullOrWhiteSpace = function (value) {
        if (value === null || value === undefined) {
            return true;
        }
        // Convert value to string in case if it's not.
        return value.toString().replace(/\s/g, '').length < 1;
    };
    SelectSearchable.prototype.ngOnInit = function () {
        this.isIos = this.platform.is('ios');
        this.isMd = this.platform.is('android');
        this.hasSearchEvent = this.onSearch.observers.length > 0;
        this.ionForm.register(this);
        if (this.ionItem) {
            this.ionItem.setElementClass('item-select-searchable', true);
        }
    };
    SelectSearchable.prototype.initFocus = function () { };
    SelectSearchable.prototype._click = function (event) {
        if (event.detail === 0) {
            // Don't continue if the click event came from a form submit.
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.open();
    };
    SelectSearchable.prototype.select = function (selectedItem) {
        this.value = selectedItem;
        this.emitChange();
    };
    SelectSearchable.prototype.emitChange = function () {
        this.propagateChange(this.value);
        this.onChange.emit({
            component: this,
            value: this.value
        });
    };
    SelectSearchable.prototype.emitSearch = function () {
        this.onSearch.emit({
            component: this,
            text: this.filterText
        });
    };
    SelectSearchable.prototype.open = function () {
        this.navController.push(SelectSearchablePage, {
            selectComponent: this,
            navController: this.navController
        });
    };
    SelectSearchable.prototype.reset = function () {
        this.setValue(null);
        this.emitChange();
    };
    SelectSearchable.prototype.formatItem = function (value) {
        if (this.itemTemplate) {
            return this.itemTemplate(value);
        }
        return value ? value[this.itemTextField] : null;
    };
    SelectSearchable.prototype.formatValue = function () {
        var _this = this;
        if (!this.value) {
            return null;
        }
        if (this.multiple) {
            return this.value.map(function (item) { return _this.formatItem(item); }).join(', ');
        }
        else {
            return this.formatItem(this.value);
        }
    };
    SelectSearchable.prototype.writeValue = function (value) {
        this.setValue(value);
    };
    SelectSearchable.prototype.registerOnChange = function (fn) {
        this.propagateChange = fn;
    };
    SelectSearchable.prototype.registerOnTouched = function (fn) { };
    SelectSearchable.prototype.setDisabledState = function (isDisabled) { };
    SelectSearchable.prototype.ngOnDestroy = function () {
        this.ionForm.deregister(this);
    };
    SelectSearchable.prototype.setValue = function (value) {
        var _this = this;
        this.value = value;
        // Get an item from the list for value.
        // We need this in case value contains only id, which is not sufficient for template rendering.
        if (this.value && !this.isNullOrWhiteSpace(this.value[this.itemValueField])) {
            var selectedItem = this.items.find(function (item) {
                return item[_this.itemValueField] === _this.value[_this.itemValueField];
            });
            if (selectedItem) {
                this.value = selectedItem;
            }
        }
    };
    SelectSearchable.prototype.ngOnChanges = function (changes) {
        if (changes['items'] && this.items.length > 0) {
            this.setValue(this.value);
        }
    };
    __decorate([
        Input('items'),
        __metadata("design:type", Array),
        __metadata("design:paramtypes", [Array])
    ], SelectSearchable.prototype, "items", null);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SelectSearchable.prototype, "isSearching", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], SelectSearchable.prototype, "itemValueField", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], SelectSearchable.prototype, "itemTextField", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SelectSearchable.prototype, "canSearch", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SelectSearchable.prototype, "canReset", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], SelectSearchable.prototype, "title", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], SelectSearchable.prototype, "searchPlaceholder", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], SelectSearchable.prototype, "onChange", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], SelectSearchable.prototype, "onSearch", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], SelectSearchable.prototype, "itemTemplate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SelectSearchable.prototype, "multiple", void 0);
    __decorate([
        HostListener('click', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [UIEvent]),
        __metadata("design:returntype", void 0)
    ], SelectSearchable.prototype, "_click", null);
    SelectSearchable = SelectSearchable_1 = __decorate([
        Component({
            selector: 'select-searchable',
            templateUrl: 'select-searchable.html',
            styleUrls: ['select-searchable.scss'],
            providers: [{
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(function () { return SelectSearchable_1; }),
                    multi: true
                }],
            host: {
                'class': 'select-searchable',
                '[class.select-searchable-ios]': 'isIos',
                '[class.select-searchable-md]': 'isMd',
                '[class.select-searchable-can-reset]': 'canReset'
            }
        }),
        __param(3, Optional()),
        __metadata("design:paramtypes", [NavController, Form, Platform, Item])
    ], SelectSearchable);
    return SelectSearchable;
    var SelectSearchable_1;
}());
export { SelectSearchable };
//# sourceMappingURL=select-searchable.js.map