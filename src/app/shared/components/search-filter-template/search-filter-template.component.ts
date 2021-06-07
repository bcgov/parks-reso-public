import { ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, Component, Input, EventEmitter, Output, Inject, AfterViewInit } from '@angular/core';
import { FilterObject, FilterType } from './filter-object';
import { ActivatedRoute } from '@angular/router';
import { SubsetsObject } from './subset-object';
import { FormGroup, FormControl } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { takeWhile } from 'rxjs/operators';
import { Utils } from '../../utils/utils';

/**
 * Common template component for NRPTI search filters. The default component will only include a keyword
 * search bar. You can extend the functionality of the search by adding additional options.
 *
 * You can add a keyword subset filter by adding a subset object, which will display a dropdown on
 * the left of the keyword search, allowing for subset searches. See the SubsetObject class for
 * further instructions on their setup and use
 *
 * You can add advanced filters by setting the advancedFilters option to true, and supplying
 * an array of FilterObjects. Filter objects include definitions for the advanced search
 * components, their source ID's, selectable options, and type. More informatin is
 * available in the FilterObject class.
 *
 * @export
 * @class SearchFilterTemplateComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'search-filter-template',
  templateUrl: './search-filter-template.component.html',
  styleUrls: ['./search-filter-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class SearchFilterTemplateComponent implements OnInit, AfterViewInit, OnDestroy {
  // Inputs
  @Input() title: string;
  @Input() tooltip: string;
  @Input() keywordWatermark: string;
  @Input() subsets: SubsetsObject;
  @Input() advancedFilters = false;
  @Input() attachPanelToDiv = null;
  @Input() advancedFilterTitle = null;
  @Input() advancedFilterText = null;
  @Input() showAdvancedFilters = false;
  @Input() searchOnFilterChange = true;
  @Input() filterItemPanelSize = 4;
  @Input() filters: FilterObject[] = [];
  @Input() keywordOverride: '';
  @Input() searchHelpLinkArray: null;
  @Input() searching = false;

  // Outputs and Emitters
  // searchEvent fires whenever a search is executed. The host component is responsible
  // for parsing the search package and handling as necessary
  @Output() searchEvent: EventEmitter<any> = new EventEmitter<any>();
  // resetControls fires when the filter form is reset
  @Output() resetControls: EventEmitter<void> = new EventEmitter<void>();
  // filterChange fires whenever a filter on the advanced filter form is changed
  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();
  // toggleFiltersPanelEvent fires when a User clicks the show/hide advanced filters button
  @Output() toggleFiltersPanelEvent: EventEmitter<any> = new EventEmitter<any>();

  // public vars
  public FilterType = FilterType; // enum access for the template html
  public keywordSearchWords: string;
  public previousKeywords: string;
  public queryParams = {};
  public formGroup: FormGroup; // Helper formGroup for grabbing values from controls

  private alive = true;
  /**
   * Creates an instance of SearchFilterTemplateComponent.
   * @param {Router} router Router used to detect URL params
   * @param {Utils} utils Utils class for date conversion
   * @memberof SearchFilterTemplateComponent
   */
  constructor(
    private route: ActivatedRoute,
    public utils: Utils,
    @Inject(DOCUMENT) _document
  ) { }

  ngOnDestroy(): void { }

  ngOnInit() {
    const urlValues: object = {}; // Storage for the URL params

    // ensure we parse through values from the URL and preselect anything
    // that needs pre-selecting

    this.route.queryParamMap.pipe(takeWhile(() => this.alive)).subscribe(data => {
      const filterParams = { ...data['params'] };
      delete filterParams.currentPage;
      delete filterParams.pageSize;
      delete filterParams.sortBy;

      for (const key in filterParams) {
        // we know how to handle keyword and subset, but everything
        // else will be dynamic
        if (key === 'keywords') {
          this.keywordSearchWords = filterParams[key];
        } else if (key === 'subset') {
          if (this.subsets) {
            this.subsets.selectedSubset = this.subsets.options.find(subset => subset.subset === filterParams[key]) ||
              this.subsets.options[0];
          }
        } else {
          // add all remaining kvp's onto the urlValues object.
          // We can use these when building the form group to preset
          // component values
          urlValues[key] = filterParams[key];
        }
      }
    });

    if (this.keywordOverride) {
      this.keywordSearchWords = this.keywordOverride;
    }

    // build formGroup based on provided filters
    this.buildFormComponents(urlValues);
  }

  /**
   * This will force a rebuild of all filter object components
   * in the search controls 'filters' array, and update the
   * forms group. This is kept public in case you want to allow
   * for dynamically changing the advanced filters on a host component
   *
   * @param {*} defaultFormValues A KVP object that will map default settings for filter values
   * @memberof SearchFilterTemplateComponent
   */
  buildFormComponents(defaultFormValues = {}) {
    // If we don't have advanced filters active, don't build the form
    if (!this.advancedFilters) {
      return;
    }

    // ensure defaultFormValues isn't null
    if (defaultFormValues === null) {
      defaultFormValues = {};
    }

    // This sloppy mess will iterate over each filter that's been passed
    // into the filters array. For each filter type, a form control will
    // be created. If default form values are passed in, an attempt will
    // be made to preset the values.
    const groupControls = {};

    this.filters.forEach(filter => {
      if (filter.type === FilterType.DateRange) {
        // read the url and apply val or null where appropriate
        groupControls[filter.filterDefinition.startDateId] = new FormControl();
        groupControls[filter.filterDefinition.endDateId] = new FormControl();

        if (defaultFormValues[filter.filterDefinition.startDateId]) {
          const date = new Date(defaultFormValues[filter.filterDefinition.startDateId]);

          groupControls[filter.filterDefinition.startDateId]
            .setValue({ year: date.getFullYear(), day: date.getDay(), month: date.getMonth() });
        }

        if (defaultFormValues[filter.filterDefinition.endDateId]) {
          const date = new Date(defaultFormValues[filter.filterDefinition.endDateId]);

          groupControls[filter.filterDefinition.endDateId]
            .setValue({ year: date.getFullYear(), day: date.getDay(), month: date.getMonth() });
        }
      } else if (filter.type === FilterType.Checkbox) {
        if (!filter.filterDefinition.grouped) {
          filter.filterDefinition.options.forEach(option => {
            groupControls[option.id] = new FormControl();

            if (defaultFormValues[option.id]) {
              groupControls[option.id].setValue(defaultFormValues[option.id]);
            }
          });
        } else {
          const vals = defaultFormValues[filter.id];

          filter.filterDefinition.options.forEach(option => {
            groupControls[option.id] = new FormControl();

            if (vals && vals.split(',').includes(option.id)) {
              groupControls[option.id].setValue(true);
            }
          });
        }
      } else if (filter.type === FilterType.MultiSelect) {
        groupControls[filter.id] = new FormControl();
        if (defaultFormValues[filter.id]) {
          groupControls[filter.id].setValue(decodeURIComponent(defaultFormValues[filter.id]));
        }
      } else if (filter.type === FilterType.Dropdown) {
        groupControls[filter.id] = new FormControl();

        if (defaultFormValues[filter.id]) {
          groupControls[filter.id].setValue(decodeURIComponent(defaultFormValues[filter.id].split(',')));
        }
      } else {
        groupControls[filter.id] = new FormControl();

        if (defaultFormValues[filter.id]) {
          groupControls[filter.id].setValue(defaultFormValues[filter.id]);
        }
      }
    });

    this.formGroup = new FormGroup(groupControls);
    this.formGroup.valueChanges.subscribe(val => {
      this.filterChange.emit(val);
      if (this.searchOnFilterChange) {
        this.search();
      }
    });
  }

  ngAfterViewInit() {
    // if the advanced filters panel is hidden, this will not work
    if (this.attachPanelToDiv && document.getElementById(this.attachPanelToDiv)) {
      // what if the user is hiding the advanced filters page? We need the panel
      // 'visible' to append... so just grab the value and re-apply after append
      const showAdvancedFiltersSetting = this.showAdvancedFilters;
      this.showAdvancedFilters = true;
      document.getElementById(this.attachPanelToDiv).appendChild(document.getElementById('advancedFilterPanel'));
      this.showAdvancedFilters = showAdvancedFiltersSetting;
    }
  }
  /*****************************************************
   *  Events/Emitters
   *****************************************************/

  /**
   * Search will build a search package containing keyword and filter settings
   * and fire en event to the host component to handle the search.
   *
   * @memberof SearchFilterTemplateComponent
   */
  search() {
    // Create a search package containing the users search
    // filters
    const searchPackage = {
      keywords: this.keywordSearchWords,
      keywordsChanged: this.keywordSearchWords !== this.previousKeywords,
      subset: this.subsets ? this.subsets.selectedSubset.subset : null,
      filters: {}
    };

    this.previousKeywords = this.keywordSearchWords;

    // loop through form filter objects, pull out the values
    // and append to the package
    this.filters.forEach(filter => {
      if (filter.type === FilterType.DateRange) {
        const dateFilter = filter.filterDefinition;

        if (this.formGroup.get(dateFilter.startDateId).value) {
          searchPackage.filters[dateFilter.startDateId] =
            this.utils.convertFormGroupNGBDateToJSDate(this.formGroup.get(dateFilter.startDateId).value).toISOString();
        }

        if (this.formGroup.get(dateFilter.endDateId).value) {
          searchPackage.filters[dateFilter.endDateId] =
            this.utils.convertFormGroupNGBDateToJSDate(this.formGroup.get(dateFilter.endDateId).value).toISOString();
        }
      } else if (filter.type === FilterType.Checkbox) {
        if (!filter.filterDefinition.grouped) {
          filter.filterDefinition.options.forEach(option => {
            if (this.formGroup.get(option.id).value) {
              searchPackage.filters[option.id] = this.formGroup.get(option.id).value;
            }
          });
        } else {
          let groupedVals = [];

          filter.filterDefinition.options.forEach(option => {
            if (this.formGroup.get(option.id).value) {
              groupedVals.push(option.id);
            }
          });

          if (groupedVals.length > 0) {
            searchPackage.filters[filter.id] = groupedVals;
          }
        }
      } else if (filter.type === FilterType.MultiSelect) {
        let groupedVals = [];
        if (filter.filterDefinition.selectedOptions.length > 0) {
          filter.filterDefinition.selectedOptions.forEach(item => {
            if (item._id) {
              groupedVals.push(item._id);
            } else {
              groupedVals.push(item.code);
            }
          });
          searchPackage.filters[filter.id] = groupedVals;
        } else {
          delete searchPackage.filters[filter.id];
        }
      } else {
        if (this.formGroup.get(filter.id).value) {
          searchPackage.filters[filter.id] = this.formGroup.get(filter.id).value;
        }
      }
    });
    // and return the package to the host component
    this.searchEvent.emit(searchPackage);
  }

  /*****************************************************
   *  Utility and Helper functions
   *****************************************************/

  // hides and displays the advanced filters
  // Emits an event on the toggleFiltersPanelEvent emitter
  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
    this.toggleFiltersPanelEvent.emit({ showPanel: this.showAdvancedFilters });
  }

  /**
   * Clears all filter components on the search form,
   * including keyword and subset selections
   *
   * @memberof SearchFilterTemplateComponent
   */
  clearFilters() {
    // reset the form group, doesn't appear to reset multiselects, or date ranges
    this.formGroup.reset();
    // clear multiSelects && date ranges
    for (const filter of this.filters.filter(f => f.type === FilterType.MultiSelect)) {
      filter.filterDefinition.selectedOptions = [];
    }
    // clear keywords
    this.keywordSearchWords = '';
    // reset the subset settings
    if (this.subsets) {
      this.changeSubset(this.subsets.defaultSubset);
    }
    // emit to the host that the form was reset
    this.resetControls.emit();
    // rerun the search
    this.search();
  }

  // Resets a specific filter
  resetFilter(filterId) {
    for (const filter of this.filters) {
      if (filter.id === filterId && filter.type === FilterType.RadioPicker) {
        this.formGroup.get(filter.id).setValue(null);
        break;
      }
    }
  }

  /**
   * Clear the keyword search text box
   *
   * @memberof SearchFilterTemplateComponent
   */
  clearSearchTerms() {
    this.keywordSearchWords = '';
    this.search();
  }

  /**
   *
   * Change the selected subset item. Also, when
   * a subset changes, we should trigger a search event
   * if there are any keywords
   *
   * @param {*} subsetItem
   * @memberof SearchFilterTemplateComponent
   */
  changeSubset(subsetItem): void {
    this.subsets.selectedSubset = subsetItem;
    this.queryParams[subsetItem.subsetLabel] = subsetItem.subset;

    if (this.keywordSearchWords) {
      this.queryParams['keywords'] = this.keywordSearchWords;
      this.search();
    }
  }

  changeMultiSelect() {
    this.search();
  }
}
