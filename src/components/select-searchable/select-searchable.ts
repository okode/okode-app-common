import { Component, Input, Output, EventEmitter, Optional, OnDestroy, forwardRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Item, Form, NavController, Platform } from 'ionic-angular';
import { SelectSearchablePage } from './select-searchable-page';

@Component({
    selector: 'select-searchable',
    template: `
    <div class="select-searchable-label">{{title}}</div>
    <div class="select-searchable-value">{{formatValue()}}</div>
    <div class="select-searchable-icon">
        <div class="select-searchable-icon-inner"></div>
    </div>
    <button aria-haspopup="true" ion-button="item-cover" class="item-cover"></button>
    `,
    styles: [`
    .item-select-searchable {
        .label {
            margin-right: 0;
        }
    }
    
    .select-searchable {
        display: flex;
    
        &-label {
            flex: 1;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    
        &-value {
            max-width: 45%;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    
        &-icon {
            position: relative;
            width: 20px;
        }
    
        &-icon-inner {
            position: absolute;
            top: 50%;
            left: 5px;
            border-top: 5px solid;
            border-right: 5px solid transparent;
            border-left: 5px solid transparent;
            pointer-events: none;
        }
    
        &-ios {
            .select-searchable-icon {
                height: 18px;
            }
    
            .select-searchable-icon-inner {
                margin-top: -2px;
                color: $select-ios-icon-color;
            }
    
            .select-searchable-value {
                padding-left: $select-ios-padding-left;
            }
        }
    
        &-md {
            .select-searchable-icon {
                height: 19px;
            }
    
            .select-searchable-icon-inner {
                margin-top: -3px;
                color: $select-md-icon-color;
            }
    
            .select-searchable-value {
                padding-left: $select-md-padding-left;
            }
    
            .select-searchable-label {
                color: $select-md-placeholder-color;
            }
        }
    
        &-spinner {
            &-background {
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                position: absolute;
                background-color: #000;
                z-index: 100;
                opacity: 0.05;
            }
    
            ion-spinner {
                position: absolute;
                top: 50%;
                left: 50%;
                z-index: 10;
                margin-top: -14px;
                margin-left: -14px;
            }
        }
    }
    `],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SelectSearchable),
        multi: true
    }],
    host: {
        'class': 'select-searchable',
        '[class.select-searchable-ios]': 'isIos',
        '[class.select-searchable-md]': 'isMd',
        '[class.select-searchable-can-reset]': 'canReset'
    }
})
export class SelectSearchable implements ControlValueAccessor, OnDestroy, OnChanges {
    private _items: any[] = [];
    private isIos: boolean;
    private isMd: boolean;
    filterText = '';
    value: any = null;
    hasSearchEvent: boolean;
    get items(): any[] {
        return this._items;
    }
    @Input('items')
    set items(items: any[]) {
        // The original reference of the array should be preserved to keep two-way data binding working between SelectSearchable and SelectSearchablePage.
        this._items.splice(0, this._items.length);

        // Add new items to the array.
        Array.prototype.push.apply(this._items, items);
    }
    @Input() isSearching: boolean;
    @Input() itemValueField: string;
    @Input() itemTextField: string;
    @Input() canSearch = false;
    @Input() canReset = false;
    @Input() title: string;
    @Input() searchPlaceholder: string = 'Enter 3 or more characters';
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onSearch: EventEmitter<any> = new EventEmitter();
    @Input() itemTemplate: Function;
    @Input() multiple: boolean;

    constructor(private navController: NavController, private ionForm: Form, private platform: Platform, @Optional() private ionItem: Item) { }

    isNullOrWhiteSpace(value: any): boolean {
        if (value === null || value === undefined) {
            return true;
        }

        // Convert value to string in case if it's not.
        return value.toString().replace(/\s/g, '').length < 1;
    }

    ngOnInit() {
        this.isIos = this.platform.is('ios');
        this.isMd = this.platform.is('android');
        this.hasSearchEvent = this.onSearch.observers.length > 0;
        this.ionForm.register(this);

        if (this.ionItem) {
            this.ionItem.setElementClass('item-select-searchable', true);
        }
    }

    initFocus() { }

    @HostListener('click', ['$event'])
    _click(event: UIEvent) {
        if (event.detail === 0) {
            // Don't continue if the click event came from a form submit.
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.open();
    }

    select(selectedItem: any) {
        this.value = selectedItem;
        this.emitChange();
    }

    emitChange() {
        this.propagateChange(this.value);
        this.onChange.emit({
            component: this,
            value: this.value
        });
    }

    emitSearch() {
        this.onSearch.emit({
            component: this,
            text: this.filterText
        });
    }

    open() {
        this.navController.push(SelectSearchablePage, {
            selectComponent: this,
            navController: this.navController
        });
    }

    reset() {
        this.setValue(null);
        this.emitChange();
    }

    formatItem(value: any): string {
        if (this.itemTemplate) {
            return this.itemTemplate(value);
        }

        return value ? value[this.itemTextField] : null;
    }

    formatValue(): string {
        if (!this.value) {
            return null;
        }

        if (this.multiple) {
            return this.value.map((item: any) => this.formatItem(item)).join(', ');
        } else {
            return this.formatItem(this.value);
        }
    }

    private propagateChange = (_: any) => {};

    writeValue(value: any) {
        this.setValue(value);
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any) { }

    setDisabledState(isDisabled: boolean) { }

    ngOnDestroy() {
        this.ionForm.deregister(this);
    }

    setValue(value: any) {
        this.value = value;

        // Get an item from the list for value.
        // We need this in case value contains only id, which is not sufficient for template rendering.
        if (this.value && !this.isNullOrWhiteSpace(this.value[this.itemValueField])) {
            let selectedItem = this.items.find(item => {
                return item[this.itemValueField] === this.value[this.itemValueField];
            });

            if (selectedItem) {
                this.value = selectedItem;
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['items'] && this.items.length > 0) {
            this.setValue(this.value);
        }
    }
}