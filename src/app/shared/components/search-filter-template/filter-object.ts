/**
 * The filter object is used to define custom filters for the search template
 * the ID is the id used by the API (milestone, etc.). Name is a display name for the UI
 * If you would like to include a date filter, specify the dateFilter object
 * options is the default array of option variables
 * selectedOptions is the current set of options that are selected
 * Group is an object that defines what vriable to group filters on, and some display params
 *
 * @export
 * @class FilterObject
 */
export class FilterObject {
  /**
   * Creates an instance of FilterObject.
   * @param {string} id ID for the filter object
   * @param {FilterType} type The type of filter. See FilterType enum for types. Allows for filter definitions to
   * share contructors/objects while having different UIs
   * @param {string} name The name/label for the filter
   * @param {FilterDefinition} filterDefinition The filter definition. Should always match up with the FilterType,
   * unless you're doing something funky
   * @param {number} itemPanelSize The panel size, can be 1 through 12, defaults to null, and if provided will
   * override the search component size setting
   * @memberof FilterObject
   */
  constructor(
    public id: string,
    public type: FilterType,
    public name: string,
    public filterDefinition: any,
    public itemPanelSize: number = null
  ) { }
}

/**
 * Enum for possible filter types
 *
 * @enum {string}
 */
export enum FilterType {
  DateRange = 'date-range',
  Dropdown = 'dropdown',
  MultiSelect = 'multi-select',
  Checkbox = 'check-box',
  RadioPicker = 'radio-picker',
  SliderToggle = 'slider-toggle'
}

/**
 * Abstract definition extendible for each filter object.
 * Currently has no functionality aside from inheritance.
 * This allows us to extend base filter definition functionality
 * in the future
 *
 * @export
 * @abstract
 * @class FilterDefinition
 */
export abstract class FilterDefinition {
  /**
   * Creates an instance of FilterDefinition.
   * @memberof FilterDefinition
   */
  constructor() { }
}
/**
 * DateFiterDefinition defines mappings to IDs used in date filters
 *
 * @export
 * @class DateFilterDefinition
 * @extends {FilterDefinition}
 */
export class DateFilterDefinition extends FilterDefinition {
  /**
   * Creates an instance of DateFilterDefinition.
   * @param {string} startDateId id for the start date item
   * @param {string} [startDateLabel='Start Date'] label for the start date item
   * @param {string} endDateId id for the end date item
   * @param {string} [endDateLabel='End Date'] label for the end date item
   * @param {string} [minDate=new Date('01-01-1900')] Minimum date allowed
   * @param {*} [maxDate=new Date()] Maximum date allowed
   * @memberof DateFilterDefinition
   */
  constructor(
    public startDateId: string,
    public startDateLabel: string = 'Start Date',
    public endDateId: string,
    public endDateLabel: string = 'End Date',
    public minDate = new Date('01-01-1900'),
    public maxDate = new Date()
  ) { super(); }
}

/**
 * CheckOrRadioFilterDefinition defines mappings for a check-box collection filter
 * or a radio button collection filter. Both are functionally identical, but radio
 * buttons only allow a single select.
 *
 * Grouped is false by default. If you set grouped to true, rather than each radio/check
 * box containing its own value, they will be grouped into a list by ID. This is only used
 * for Check Box filters, as radio button filters are grouped by default. This value is
 * ignored if the filter type is Radio
 *
 * You must supply one or more ObjectItem in the options collection
 *
 * @export
 * @class CheckOrRadioFilterDefinition
 * @extends {FilterDefinition}
 */
export class CheckOrRadioFilterDefinition extends FilterDefinition {
  /**
   * Creates an instance of CheckOrRadioFilterDefinition.
   * @param {OptionItem[]} [options=[]] Array of option items to display in the filter
   * @param {boolean} [grouped=false] Is this set of options a group (for checkboxs only, radios are always grouped)
   * @memberof CheckOrRadioFilterDefinition
   */
  constructor(
    public options: OptionItem[] = [],
    public grouped: boolean = false // note, radio buttons are grouped by default
  ) { super(); }
}

/**
 * Default definition for a check box item
 * contains the ID, label, and an isChecked boolean for defaulting to checked or not
 *
 * @export
 * @class OptionItem
 */
export class OptionItem {
  /**
   * Creates an instance of OptionItem.
   * @param {string} id ID of the checkbox option
   * @param {string} label Label for the checkbox
   * @param {boolean} [isChecked=false] Is this checkbox checked by default?
   * @memberof OptionItem
   */
  constructor(
    public id: string,
    public label: string,
    public isChecked: boolean = false
  ) { }
}

/**
 * Default definition for a radio button item
 * contains the ID, label, and an isChecked boolean for defaulting to checked or not
 * The value option is for radio buttons only and determines the value returned when
 * a radio button is selected.
 *
 * @export
 * @class RadioOptionItem
 * @extends OptionItem
 */
export class RadioOptionItem extends OptionItem {
  /**
   * Creates an instance of RadioOptionItem.
   * @param {string} id id of the radio option
   * @param {string} label Label to display for the radio option
   * @param {string} value Value of the radio option
   * @param {boolean} [isChecked=false] Is this option selected by default
   * @memberof RadioOptionItem
   */
  constructor(
    public id: string,
    public label: string,
    public value: string,
    public isChecked: boolean = false
  ) { super(id, label, isChecked); }
}

/**
 * Filter definition for multiselect dropdown filters
 * Different from the dropdown filter in that it allows for
 * typeahead.
 *
 * @export
 * @class MultiSelectDefinition
 * @extends {FilterDefinition}
 */
export class MultiSelectDefinition extends FilterDefinition {
  public selectedOptionsCount = 0; // count of selected options for UI display
  /**
   * Creates an instance of MultiSelectDefinition.
   * @param {any[]} [options=[]] An array of your multi select options
   * @param {string} [placeholder='Begin typing to filter'] Placeholder text to display in the typeahead text box
   * @param {string} [subtext='Select all that apply...'] Subtext for the multiselect component
   * @param {boolean} [useChips=false] Flag that indicates whether to show selected items as a chip list
   * @memberof MultiSelectDefinition
   */
  constructor(
    public options: any[] = [],
    public selectedOptions: any[] = [],
    public group: FilterGroupObject = null,
    public collection: FilterObject[] = null,
    public matchId: boolean = false
  ) {
    super();
    // If we have a collection value, empty the options container so the UI doesn't
    // get confused by trying to create multiple components
    if (collection) {
      options = [];
      selectedOptions = [];
    }
  }
}

/**
 * Filter definition for the dropdown filter
 *
 * @export
 * @class DropdownDefinition
 * @extends {FilterDefinition}
 */
export class DropdownDefinition extends FilterDefinition {
  /**
   * Creates an instance of DropdownDefinition.
   * @param {string[]} [options=[]] String array of options to show in the dropdown menu
   * @param {boolean} [multiselect=true] Should this dropdown allow for multiselection?
   * @memberof DropdownDefinition
   */
  constructor(
    public options: string[] = [],
    public multiselect: boolean = true
  ) { super(); }
}

/**
 * Filter definition for a slider toggle. Note that slide toggles
 * do not have an indeterminate state. They will always return true or false.
 *
 * @export
 * @class SliderToggleFilterDefinition
 * @extends {FilterDefinition}
 */
export class SliderToggleFilterDefinition extends FilterDefinition {
  /**
   * Creates an instance of SliderToggleFilterDefinition.
   * @param {OptionItem} offOption an ID and label for the off position
   * @param {OptionItem} onOption an ID and label for the on postition
   * @memberof SliderToggleFilterDefinition
   */
  constructor(
    public offOption: OptionItem,
    public onOption: OptionItem
  ) { super(); }
}

export class FilterGroupObject {
  constructor(
    public name: string,
    public labelPrefix: string,
    public labelPostfix: string,
  ) { }
}
