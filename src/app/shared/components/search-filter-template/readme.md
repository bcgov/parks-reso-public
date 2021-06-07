# Common Search Component

The common search component allows you to create a Keyword and advanced filter search on any screen, while keeping behaviour and UI consistent accross all host screens in the application.

The documentation below contains references on how to use the component. The classes themselves are also fully documented so you can get the general idea for usage by viewing classes and contructors.

## Using the Search Component

First, ensure that you've added the required components ot your module file, either by adding the Common module, or the Search Component module. (This should already be handled in NRPTI admin)

```typescript
import { CommonModule } from '@/common/src/app/common.module';

@NgModule({
  imports: [
    CommonModule
  ]
})
```

Or

```typescript
import { SearchFilterTemplateComponent } from '@common/src/app/search-filter-template/search-filter-template.component';

@NgModule({
  imports: [
    SearchFilterTemplateComponent
  ]
})
```

The above steps should already be done for you with the NRPTI, NCRCED and LNG applications as their app.module already imports Common.

### Adding the component to your screen

With the module imports in place, you can add your component to any screen. Just include the module tags as described below:

```html
  <!-- Simple keyword search -->
  <search-filter-template
    (searchEvent)="search($event)"
    title="Keyword Search"
    tooltip="Summary, description, location, and issued to name fields">
  </search-filter-template>

  <!-- Advanced Filter search and all options -->
  <search-filter-template
    (searchEvent)="search($event)"
    (resetControls)="filterReset($event)"
    (filterChange)="filterChange($event)"
    (toggleFiltersPanelEvent)="togglePanel($event)"
    [title]="myTitleVar"
    [tooltip]="myooltipVar"
    [keywordWatermark]="myWatermarkVar"
    [subsets]="subsets"
    [advancedFilters]="true"
    [advancedFilterTitle]="myAdvancedFilterTitle"
    [advancedFilterText]="myFilterDesc"
    [attachPanelToDiv]="myHostComponentDiv"
    [showAdvancedFilters]="false"
    [filterItemPanelSize]="myPanelSize"
    [filters]="filters"
    [searchOnFilterChange]="true">
  </search-filter-template>
```

The component has the following parameters and event handlers

- title
- tooltip
- keywordWatermark
- subsets
- advancedFilters
- advancedFilterTitle
- advancedFilterText
- attachPanelToDiv
- showAdvancedFilters
- filters
- searchOnFilterChange
- searchEvent
- resetControls
- filterChange

### Parameters

You can pass in values to a combination of parameters. Their function is described below.

`title` Sets the title of the search component. Usually this is "Keyword Search". This is `required`.

`tooltip` Tooltip sets the text to display when a user mouses over the tooltip icon to the right of the title. This is `required`.

`keywordWatermark` Sets the watermark text to place inside the keyword search box. If no text is supplied this will default to "Type keyword search words".

`subsets` Is a list of subset objects that will display in a dropdown menu to the left of the keyword search box. Subset objects are described in detail below. Defaults to `null`.

`advancedFilters` Is a boolean value that indicates whether or not the advanced filter panel will display. Defaults to `false`.

`advancedFilterTitle` Is a text string for a title label on your advanced filter panel. Defaults to `null`.

`advancedFilterText` Is a text string that will include a description or summary at the top of the advanced filters panel. Defaults to `null`.

`attachPanelToDiv` allows you to specify a div tag on your host component where the advanced filters panel will be moved to.

`showAdvancedFilters` Is a boolean value that indicates whether or not the advanced filter panel will be open by default. Defaults to `false`.

`filterItemPanelSize` Is a number between 1 and 12 that will set the default column size for all panels. Defaults to `4`.

`filters` Is an array containing your filter definitions. Filter definitions are described in detail below. Defaults to `[]`.

`searchOnFilterChange` Is a boolean that indicates whether or not a search will be triggered when a filter value changes. Defaults to `false`.

### Event Handlers

#### Search Event

`searchEvent` Is the event that is triggered when a search is executed, either by clicking the "search" button, hitting the `enter` key from within the keyword search textbox, or if `searchOnFilterChange` is `true`, when a filter value is changed. You must ensure you handle this event on your host component, otherwise you won't know when the user has requested a search.

The event returns a `searchPackage` object, which contains the following details:

```typescript
{
  keywords: 'myKeywordText',
  keywordsChanged: true/false
  subset: 'mySubsetValue',
  filters: {...}
}
```

`keywords` will contain the text entered into the keyword search text box.

`keywordsChanged` is a boolean value indicating if the keyword has changed since the last search request.

`subset` contains the subset value, or null if no subsets are available.

`filters` contains a key-value pair of your API filters. It's best to ensure the filter object ID's and return values map directly to your API query parameters for ease of use. More details about that are below in the `Filter Definitions` section.

#### Reset Controls Event

`resetControls` will be fired when the user clicks the "reset filters" button on the advanced filters panel. All filters, the keyword search, and the subset will be reset to defaults. This is an optional event handle that may be useful if you are hooking into the search panel for any reason and need to update host component variables on a filter reset.

#### Filter Change Event

`filterChange` will be fired when an advanced filter option is changed. This is an optional event handle that may be useful if you are hooking into the search panel for any reason and need to update host component variables on a filter change.

#### Toggle Filters Panel Event

`toggleFiltersPanelEvent` will be fired when a user clicks the Show/Hide Advanced Filters button. This is an optional event handler that may be useful if you've moved the panel onto a different div and need to track the show/hide event for restructuring the page in some way.

## Subsets and the Subset Objects

The subset dropdown allows you to return a value useful for querying subsets of keyword text searches. See the NRPTI records page for an example of subset searches.

To use the subset search, all you need to do is include a `SubsetObject` in the search controls `subset` parameter. The subset object details can be found by looking at the `subset-object.ts` file.

A subset object has the following structure:

```typescript
{
  options: SubsetOption[],
  defaultSubset: SubsetOption = null,
  selectedSubset: SubsetOption = null
}
```

`options` contains an array of SubsetOption objects, and represents each option in the dropdown.

`defaultSubset` contains the subset object to use as a default setting, or if not included, the first option in the `options` array.

`selectedSubset` is the currently selected subset, or the first option in the `options` array, in case you want the selection to be different then the expected default.

A subset option object is the option definition, and has the following structure:

```typescript
{
  subset: string,
  subsetLabel: string
}
```

where `subset` is the id/code value that you'd pass back to the API for subset queries, and `subsetLabel` is the label shown for the subset in the dropdown.

### Exampe usage

```typescript
const subsetOptions = [
  new SubsetOption('', 'All'),
  new SubsetOption('issuedTo', 'Issued To'),
  new SubsetOption('location', 'Location'),
  new SubsetOption('description', 'Description & Summary'),
  new SubsetOption('recordName', 'Record Name')
];
this.subsets = new SubsetsObject(subsetOptions);
```

## Advanced Filters and Filter Definitions

To use advanced filters, you must include one or more `FilterObject`s. The `FilterObject` contains all of the definitions required to creat a dynamic filter in the advanced filter panel, and have those values returned to you on a search event. The `FilterObject` details can be found by looking at the `filter-object.ts` file.

The `FilterObject` has the following structure:

```typescript
{
  id: string,
  type: FilterType,
  name: string,
  filterDefinition: FilterDefinition,
  itemPanelSize: number = 4
}
```

`id` represents the id of the filter. For some filters, it is recommended to use the API filter value as the filter id. Exceptions are filters with multiple ID's, such as date ranges. This is `required`.

`type` is the type of filter you want to use. This can technically be derived from the filterDefinition, however we include an explicit type to allow for overloading `FilterDefinition` objects where possible (checkbox/radio button, for example). There is a `FilterType` enum in the `filter-objects.ts` file you can use for this:

```typescript
export enum FilterType {
  DateRange = 'date-range',
  Dropdown = 'dropdown',
  MultiSelect = 'multi-select',
  Checkbox = 'check-box',
  RadioPicker = 'radio-picker',
  SliderToggle = 'slider-toggle'
}
```

`name` is the name/label for the filter. This value will be displayed as the filters header title. If you do not want a header label to display, set this value to null or an empty string.

`filterDefinition` is the actual definition of the filter. As mentioned above, the type is determined by the `type` attribute, and the instructions are placed in the filter definition. The `FilterDefinition` object itself is just an abstract class used as a point of inheritance for the filter definition classes. As you can see in the `FilterType` enum, we currently have 5 unique filter types, however Radio and Checkbox definitions are identical so we overload the class for both.

`itemPanelSize` is the panel size, between 1 and 12, for the filter panel. This will override any value supplied by the search components `filterItemPanelSize` value. Defaults to `4`

### DateFilterDefinition

The `DateFilterDefinition` object is used for date range filters.

```typescript
{
  startDateId: string,
  startDateLabel: string = 'Start Date',
  endDateId: string,
  endDateLabel: string = 'End Date',
  minDate = new Date('01-01-1900'),
  maxDate = new Date()
}
```

`startDateId` is the id to use for the range start date, and is best if it matches your api query param id. `Required`.

`startDateLabel` is the label to use for the range start date. `Required`.

`endDateId` is the id to use for the range end date, and is best if it matches your api query param id. `Required`.

`endDateLabel` is the label to use for the range end date. `Required`.

`minDate` is the minimum allowed date a user can select in the date range components. Defaults to `January 1, 1900`.

`maxDate` is the maximum allowed date a user can select in the date range components. Defaults to `Now`.

### CheckOrRadioFilterDefinition

The `CheckOrRadioFilerDefinition` is a coponent that allows you to define a group o radio buttons or check boxes, used for boolean or general "exists" filters.

```typescript
{
  options: OptionItem[] = [],
  grouped: boolean = false
}
```

`options` is an array of `OptionItems` that define the selected options.

`grouped` is a boolean value for Check Box filters only, and indicates if the check box values should all be grouped together on search. See the Record page Projects filter for an example.

`OptionItem` has an extended class, `RadioOptionItem` used for radio buttons.

```typescript
// Check box Option
{
  id: string,
  label: string,
  isChecked: boolean = false
}
// Radio Button Option
{
  id: string,
  label: string,
  value: string,
  isChecked: boolean = false,
}
```

`id` is the id value for the option, best mapped to your api query param value. `Required`.

`label` is the text label for the option to display in the UI. `Required`.

`isChecked` is a boolean value indicating if the box should be checked by default. Defaults to `false`.

`value` is for Radio buttons only, and indicates the value to return when the radio button is active. Checkbox values only return true and false.

### MultiSelectDefinition

`MultiSelectDefinition` creates a multi-select and type-ahead text box filter.

```typescript
{
  options: IMutliSelectOption[] = [],
  placeholder: string = 'Begin typing to filter',
  subtext: string = 'Select all that apply...'
  useChips: boolean = true;
}
```

`options` is an array of `IMultiSelectOption` objects, that will appear when a user types ahead or clicks in the text box. `Required`.

`placeholder` is the placeholder text to display in the text box. Defaults to `Begin typing to filter`.

`subtext` is a text string to display beside the title. Defaults to `Select all that apply...`.

`useChips` is a boolean that indicates if the selected options from the multiselect should display as a list of chips above the dropdown component. Defaults to `true`

### DropdownDefinition

`DropdownDefinition` creates a non-type-ahead dropdown only filter. The dropdown supports multiselect.

```typescript
{
  options: string[] = [],
  multiselect: boolean = true
}
```

`options` is an array of string values to display in the dropdown. The string will be returned literally on selection. It would be ideal to extend this component to support Label and Value in the future.

`multiselect` is a boolean value indicating if the dropdown filter allows for multiselection. Defaults to `true`.

### Slider Toggle Definition

`SliderToggleFilterDefinition` creates a toggle switch style check box. These behave the same as the check box filters, except they are not groupable. Slider toggles do not have an indeterminate state, so currently when turned 'off' the slider will not return a false value, but a null value.

```typescript
{
  offOption: OptionItem,
  onOption: OptionItem
}
```

`offOption` is the option definition for when the slider is turned off. ID and IsChecked are optional in this case, as only the label is required.

`onOption` is the option definition for when the slider is turned on. ID and IsChecked are optional in this case, as only the label is required.

The primary reason for the use of OptionItem over just a label is to allow for the mapping of the ID's if needed on the host component for a more advanced filtering where you need to know the false state. It also allows for some extensibility in the future without really making things difficult for now.

### Filter Definition examples

```typescript
const issuedDateFilter = new FilterObject(
  'issuedDate',
  FilterType.DateRange,
  '', // if you include a name, it will add a label to the date range filter.
  new DateFilterDefinition('dateRangeFromFilter', 'Start Issued Date', 'dateRangeToFilter', 'End Issued Date')
);

const entityTypeFilter = new FilterObject(
  'entityType',
  FilterType.Checkbox,
  'Entity Type',
  new CheckOrRadioFilterDefinition([new OptionItem('issuedToCompany', 'Company'), new OptionItem('issuedToIndividual', 'Individual')])
);

const publishedStatefilter = new FilterObject(
  'isNrcedPublished',
  FilterType.RadioPicker,
  'NRCED Published State',
  new CheckOrRadioFilterDefinition([
    new RadioOptionItem('publishedState', 'Published', 'true'),
    new RadioOptionItem('unpubState', 'Unpublished', 'false')
  ])
);

const activityTypeFilter = new FilterObject(
  'activityType',
  FilterType.MultiSelect,
  'Type (Activity or Record)',
  new MultiSelectDefinition(Object.values(Picklists.activityTypePicklist).map(item => {
    return { value: item._schemaName, displayValue: item.displayName, selected: false, display: true };
  }), 'Begin typing to filter activities...', 'Select all that apply...', true)
);

const sourceSystemFilter = new FilterObject(
  'sourceSystemRef',
  FilterType.Dropdown,
  'Source System',
  new DropdownDefinition(Picklists.sourceSystemRefPicklist)
);

const projectFilter = new FilterObject(
  'projects',
  FilterType.Checkbox,
  'Project',
  new CheckOrRadioFilterDefinition([
    new OptionItem('lngCanada', 'LNG Canada'),
    new OptionItem('coastalGaslink', 'Coastal Gaslink'),
    new OptionItem('otherProjects', 'Other')],
    true)
);
```
