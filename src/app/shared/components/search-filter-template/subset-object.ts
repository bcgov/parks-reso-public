/**
 * SubsetsObject is a container for your list of subsetOptions. These will be displayed
 * on the left dropdown of the keyword search bar and apply a default subfilter to the
 * searches sent to the API. You can also define a defaultSubset option, which indicates
 * which subset item in the options array should display by default. If empty, the first
 * item in the array is used as the default. SelectedSubset is set if you want a specific
 * subset selected on render, but this should be different then the default.
 *
 * @export
 * @class SubsetsObject
 */
export class SubsetsObject {
  /**
   * Creates an instance of SubsetsObject.
   * @param {SubsetOption[]} options An array containing your subset options.
   * @param {SubsetOption} [defaultSubset=null] Optional. The subset to display by default
   * @param {SubsetOption} [selectedSubset=null] Optional. The currently selected subset (if different then the default)
   * @memberof SubsetsObject
   */
  constructor(
    public options: SubsetOption[],
    public defaultSubset: SubsetOption = null,
    public selectedSubset: SubsetOption = null
  ) {
    if (!defaultSubset) {
      this.defaultSubset = options[0];
    }

    if (!selectedSubset) {
      this.selectedSubset = options[0];
    }
  }
}

/**
 * The SubsetOption is an option item for your SubsetsObject class. The SubsetOption contains
 * a subset value, which is the name of the attribute you use to filter in the API, and a
 * label value, which will be displayed to the user.
 *
 * @export
 * @class SubsetOption
 */
export class SubsetOption {
  /**
   * Creates an instance of SubsetOption.
   * @param {string} subset The subset id/value. This will be passed to the API query
   * @param {string} subsetLabel The label to display in the subset menu
   * @memberof SubsetOption
   */
  constructor(
    public subset: string,
    public subsetLabel: string
  ) { }
}
