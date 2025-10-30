export class Constants {
  public static readonly tableDefaults = {
    DEFAULT_CURRENT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_SORT_BY: '-datePosted',
    DEFAULT_KEYWORDS: '',
    DEFAULT_SHOW_MORE_INCREMENT: 5,
    DEFAULT_DATASET: '',
    DEFAULT_PAGE_SIZE_OPTIONS: [
      { displayText: '10', value: 10 },
      { displayText: '25', value: 25 },
      { displayText: '50', value: 50 },
      { displayText: '100', value: 100 }
    ]
  };

  public static readonly DEFAULT_PM_OPENING_HOUR = 12;

  public static readonly DEFAULT_NOT_REQUIRED_TEXT = `<p>You don't need a day-use pass for this date and pass type. Passes may be required on other days and at other parks.</p>`;

  public static readonly mockPass1 = {
    _id: 100,
    _schemaName: 'Pass',
    firstName: 'Frank',
    lastName: 'Sinatra',
    email: 'frank@gmail.com',
    confirmationNumber: 'b289djd831',
    numberOfGuests: 3,
    facility: 10
  };

  public static readonly mockFacility1 = {
    _id: 10,
    _schemaName: 'Facility',
    name: 'Goldstream Trail',
    type: 'trail',
    time: 'AM',
    capacity: 400,
    status: 'open',
    passes: [100],
    park: 1
  };

  public static readonly mockFacility2 = {
    _id: 11,
    _schemaName: 'Facility',
    name: 'Goldstream Parking Lot',
    type: 'parking',
    time: 'AM',
    capacity: 100,
    status: 'open',
    passes: [],
    park: 1
  };

  public static readonly mockPark1 = {
    _id: 1,
    _schemaName: 'Park',
    name: 'Cypress',
    description:
      'The towering North Shore Mountains which form a backdrop to the bustling city of Vancouver have beckoned outdoor recreationists for many years. Until the opening of the Lions Gate Bridge in 1939, a fleet of ferries transported hikers and skiers across Burrard Inlet on the first leg of their journey to Hollyburn Ridge, which is now part of Cypress Provincial Park.',
    status: 'open',
    facilities: [10, 11]
  };

  public static readonly mockPark2 = {
    _id: 2,
    _schemaName: 'Park',
    name: 'Mount Seymour',
    status: 'open',
    facilities: []
  };

  public static readonly mockPark3 = {
    _id: 3,
    _schemaName: 'Park',
    name: 'Golden Ears',
    status: 'open',
    facilities: []
  };

  public static readonly mockPark4 = {
    _id: 4,
    _schemaName: 'Park',
    name: 'Joffre Lakes',
    status: 'open',
    facilities: []
  };

  public static readonly mockPark5 = {
    _id: 5,
    _schemaName: 'Park',
    name: 'Stawamus Chief',
    status: 'open',
    facilities: []
  };

  public static readonly mockPark6 = {
    _id: 6,
    _schemaName: 'Park',
    name: 'Garibaldi',
    status: 'open',
    facilities: []
  };

  public static readonly mockPark7 = {
    _id: 7,
    _schemaName: 'Park',
    name: 'Mount Robson',
    status: 'open',
    facilities: []
  };

  public static readonly mockParkList = [
    Constants.mockPark1,
    Constants.mockPark2,
    Constants.mockPark3,
    Constants.mockPark4,
    Constants.mockPark5,
    Constants.mockPark6,
    Constants.mockPark7
  ];

  public static readonly mockFacilityList = [Constants.mockFacility1, Constants.mockFacility2];

  public static readonly ToastTypes: any = {
    SUCCESS: 0,
    WARNING: 1,
    INFO: 2,
    ERROR: 3
  };

  public static readonly emailValidationRegex = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
  public static readonly phoneValidationRegex = '^[0-9-]{12}$';

  //Add facilities to this array to not give users option to input phone number
  public static readonly excludePhoneNumbers = ['Alouette Lake South Beach Day-Use Parking Lot'];
}
