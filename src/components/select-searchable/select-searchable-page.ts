import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, Searchbar } from 'ionic-angular';
import { SelectSearchable } from './select-searchable';

@Component({
    selector: 'select-searchable-page',
    template: `
    <ion-header>
    <ion-navbar>
        <ion-title>{{selectComponent.title}}</ion-title>
    </ion-navbar>
    <ion-toolbar *ngIf="selectComponent.canSearch">
        <ion-searchbar
            #searchbarComponent
            [(ngModel)]="selectComponent.filterText"
            (ionInput)="filterItems()"
            [placeholder]="selectComponent.searchPlaceholder || 'Search'">
        </ion-searchbar>
    </ion-toolbar>
    </ion-header>
    <ion-content>
        <div class="select-searchable-spinner" *ngIf="selectComponent.isSearching">
            <div class="select-searchable-spinner-background"></div>
            <ion-spinner></ion-spinner>
        </div>
        <ion-list no-margin *ngIf="filteredItems.length">
            <button ion-item detail-none *ngFor="let item of filteredItems" (click)="select(item)">
                <ion-icon
                    [name]="isItemSelected(item) ? 'checkmark-circle' : 'radio-button-off'"
                    [color]="isItemSelected(item) ? 'primary' : 'daek'"
                    item-left>
                </ion-icon>
                <h2>{{selectComponent.formatItem(item)}}</h2>
            </button>
        </ion-list>
        <div *ngIf="!filteredItems.length" margin>{{selectComponent.searchNotFoundLabel}}</div>
    </ion-content>
    <ion-footer *ngIf="selectComponent.canReset || selectComponent.multiple">
        <ion-toolbar padding>
            <ion-row>
                <ion-col no-padding *ngIf="selectComponent.canReset"
                    [attr.col-6]="selectComponent.canReset && selectComponent.multiple ? '' : null"
                    [attr.col-12]="selectComponent.canReset && !selectComponent.multiple ? '' : null">
                    <button ion-button full no-margin (click)="reset()" [disabled]="!selectedItems.length">
                        Clear
                    </button>
                </ion-col>
                <ion-col no-padding *ngIf="selectComponent.multiple"
                    [attr.col-6]="selectComponent.canReset && selectComponent.multiple ? '' : null"
                    [attr.col-12]="!selectComponent.canReset && selectComponent.multiple ? '' : null">
                    <button ion-button full no-margin (click)="ok()">
                        OK
                    </button>
                </ion-col>
            </ion-row>
        </ion-toolbar>
    </ion-footer>
    `,
    styleUrls: ['select-searchable-page.scss'],
    host: {
        'class': 'select-searchable-page',
        '[class.select-searchable-page-can-reset]': 'selectComponent.canReset',
        '[class.select-searchable-page-multiple]': 'selectComponent.multiple'
    }
})
export class SelectSearchablePage {
    selectComponent: SelectSearchable;
    filteredItems: any[];
    selectedItems: any[] = [];
    navController: NavController;
    @ViewChild('searchbarComponent') searchbarComponent: Searchbar;

    constructor(navParams: NavParams) {
        this.selectComponent = navParams.get('selectComponent');
        this.navController = navParams.get('navController');
        this.filteredItems = this.selectComponent.items;
        this.filterItems();

        if (this.selectComponent.value) {
            if (this.selectComponent.multiple) {
                this.selectComponent.value.forEach((item: any) => {
                    this.selectedItems.push(item);
                });
            } else {
                this.selectedItems.push(this.selectComponent.value);
            }
        }
    }

    ngAfterViewInit() {
        if (this.searchbarComponent) {
            // Focus after a delay because focus doesn't work without it.
            setTimeout(() => {
                this.searchbarComponent.setFocus();
            }, 1000);
        }
    }

    isItemSelected(item: any) {
        return this.selectedItems.find(selectedItem => {
            if (this.selectComponent.itemValueField) {
                return item[this.selectComponent.itemValueField] === selectedItem[this.selectComponent.itemValueField];
            }

            return item === selectedItem;
        }) !== undefined;
    }

    deleteSelectedItem(item: any) {
        let itemToDeleteIndex;

        this.selectedItems.forEach((selectedItem, itemIndex) => {
            if (this.selectComponent.itemValueField) {
                if (item[this.selectComponent.itemValueField] === selectedItem[this.selectComponent.itemValueField]) {
                    itemToDeleteIndex = itemIndex;
                }
            } else if (item === selectedItem) {
                itemToDeleteIndex = itemIndex;
            }
        });

        this.selectedItems.splice(itemToDeleteIndex, 1);
    }

    addSelectedItem(item: any) {
        this.selectedItems.push(item);
    }

    select(item: any) {
        if (this.selectComponent.multiple) {
            if (this.isItemSelected(item)) {
                this.deleteSelectedItem(item);
            } else {
                this.addSelectedItem(item);
            }
        } else {
            if (!this.isItemSelected(item)) {
                this.selectedItems = [];
                this.addSelectedItem(item);
                this.selectComponent.select(item);
            }

            this.close();
        }
    }

    ok() {
        this.selectComponent.select(this.selectedItems.length ? this.selectedItems : null);
        this.close();
    }

    close() {
        // Focused input interferes with the animation.
        // Blur it first, wait a bit and then close the page.
        if (this.searchbarComponent) {
            this.searchbarComponent._fireBlur();
        }

        setTimeout(() => {
            this.navController.pop();

            if (!this.selectComponent.hasSearchEvent) {
                this.selectComponent.filterText = '';
            }
        });
    }

    reset() {
        this.navController.pop();
        this.selectComponent.reset();
    }

    filterItems() {
        if (this.selectComponent.hasSearchEvent) {
            if (this.selectComponent.isNullOrWhiteSpace(this.selectComponent.filterText)) {
                this.selectComponent.items = [];
            } else {
                // Delegate filtering to the event.
                this.selectComponent.emitSearch();
            }
        } else {
            // Default filtering.
            if (!this.selectComponent.filterText || !this.selectComponent.filterText.trim()) {
                this.filteredItems = this.selectComponent.items;
                return;
            }

            let filterText = this.selectComponent.filterText.trim().toLowerCase();

            this.filteredItems = this.selectComponent.items.filter(item => {
                return item[this.selectComponent.itemTextField].toLowerCase().indexOf(filterText) !== -1;
            });
        }
    }
}