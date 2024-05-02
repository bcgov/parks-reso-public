export class Pass {
    pk: string;
    sk: string;

    email: string;
    firstName: string;
    lastName: string;

    type: string; // AM, PM, DAY
    numberOfGuests: number;
    registrationNumber: string;
    facilityName: string;
    parkName: string;
    date: Date;
    passStatus: string;
    phoneNumber: number;
    facilityType: string; // Parking Lot, Trail

    constructor(obj?: any) {
        this.pk = obj && obj.pk || null;
        this.sk = obj && obj.sk || null;

        this.email = obj && obj.email || null;
        this.firstName = obj && obj.firstName || null;
        this.lastName = obj && obj.lastName || null;

        this.type = obj && obj.type || null;
        this.numberOfGuests = obj && obj.numberOfGuests || null;
        this.registrationNumber = obj && obj.registrationNumber || null;
        this.parkName = obj && obj.parkName || null;
        this.facilityName = obj && obj.facilityName || null;
        this.date = obj && obj.date || null;
        this.passStatus = obj && obj.passStatus || null;
        this.phoneNumber = obj && obj.phoneNumber || null;
        this.facilityType = obj && obj.facilityType || null;
    }
}

export class PostPass {
    email: string;
    firstName: string;
    lastName: string;

    type: string; // AM, PM, DAY
    numberOfGuests: number;
    date: Date;
    phoneNumber: number;
    facilityType: string; // Parking Lot, Trail
    parkName: string;

    // SKs
    facilityName: string;
    parkOrcs: string;

    token: string;
    commit: boolean;

    constructor(obj?: any) {
        this.email = obj && obj.email || null;
        this.firstName = obj && obj.firstName || null;
        this.lastName = obj && obj.lastName || null;

        this.type = obj && obj.type || null;
        this.numberOfGuests = obj && obj.numberOfGuests || null;
        this.date = obj && obj.date || null;
        this.phoneNumber = obj && obj.phoneNumber || null;
        this.facilityType = obj && obj.facilityType || null;

        this.facilityName = obj && obj.facilityName || null;
        this.parkName = obj && obj.parkName || null;
        this.parkOrcs = obj && obj.parkOrcs || null;

        this.token = obj?.token || null;
        this.commit = obj?.commit || null;
    }
}
