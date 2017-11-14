import { NavParams, NavController, Searchbar } from 'ionic-angular';
import { SelectSearchable } from './select-searchable';
export declare class SelectSearchablePage {
    selectComponent: SelectSearchable;
    filteredItems: any[];
    selectedItems: any[];
    navController: NavController;
    searchbarComponent: Searchbar;
    constructor(navParams: NavParams);
    ngAfterViewInit(): void;
    isItemSelected(item: any): boolean;
    deleteSelectedItem(item: any): void;
    addSelectedItem(item: any): void;
    select(item: any): void;
    ok(): void;
    close(): void;
    reset(): void;
    filterItems(): void;
}
