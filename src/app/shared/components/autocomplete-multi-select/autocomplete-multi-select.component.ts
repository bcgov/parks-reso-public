import {
  Component,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { FilterObject } from '../search-filter-template/filter-object';

@Component({
  selector: 'app-autocomplete-multi-select',
  templateUrl: './autocomplete-multi-select.component.html',
  styleUrls: ['./autocomplete-multi-select.component.scss']
})
export class AutoCompleteMultiSelectComponent implements OnInit {
  @Input() control: FormControl;
  @Input() filter: FilterObject;
  /*
    Example of multiSelect FilterObject

     public legislationFilterGroup = { name: 'legislation', labelPrefix: null, labelPostfix: ' Act Terms' };
     public filter = new FilterObject(
       'milestone',
       FilterType.MultiSelect,
       'Milestone',
       new MultiSelectDefinition(
         [
           {
             legislation: '2002',
             name: 'Section 6',
             read: ["public", "staff", "sysadmin"],
             type: 'label',
             _id: "5cf00c03a266b7e1877504e1",
             _schemaName: "List"
           }
         ],
         [],
         this.legislationFilterGroup
       )
     );
  */

  @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(public _changeDetectionRef: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.filter.filterDefinition.matchId) {
      if (this.control.value) {
        const selectedOptionObjects = [];
        const controlValues = this.control.value.split(',');
        this.filter.filterDefinition.options.forEach(option => {
          if (controlValues.includes(option._id)) {
            selectedOptionObjects.push(option);
          } else if (controlValues.includes(option.code)) {
            selectedOptionObjects.push(option);
          }
        });
        this.filter.filterDefinition.selectedOptions = selectedOptionObjects;
      }
    } else {
      this.filter.filterDefinition.selectedOptions = this.control.value;
    }
  }

  onChange() {
    this.changeEvent.emit();
  }

  // comparator for filters. We use objects in Constants, or list objects from
  // the DB, so check for the possible identifiers of code or _id. If we have
  // neither, then assume a string to string comparison
  public filterCompareWith(item: any, itemToCompare: any) {
    if (item.hasOwnProperty('code')) {
      return item && itemToCompare ? item.code === itemToCompare.code : item === itemToCompare;
    } else if (item.hasOwnProperty('_id')) {
      return item && itemToCompare ? item._id === itemToCompare._id : item === itemToCompare;
    } else {
      return item === itemToCompare;
    }
  }

  clearSelectedItem(filter: FilterObject, item: any) {
    // may have strings, or a list of code table items with _id values
    filter.filterDefinition.selectedOptions = filter.filterDefinition.selectedOptions.filter(option => {
      if (option !== item && option._id !== item._id) {
        return item;
      }
    });
    this.changeEvent.emit();
  }
}
