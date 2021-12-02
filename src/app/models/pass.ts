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
    date: Date;
    passStatus: string;
    phoneNumber: number;
    facilityType: string; // Parking Lot, Trail
    license: string;

    constructor(obj?: any) {
        this.pk = obj && obj.pk || null;
        this.sk = obj && obj.sk || null;

        this.email = obj && obj.email || null;
        this.firstName = obj && obj.firstName || null;
        this.lastName = obj && obj.lastName || null;

        this.type = obj && obj.type || null;
        this.numberOfGuests = obj && obj.numberOfGuests || null;
        this.registrationNumber = obj && obj.registrationNumber || null;
        this.facilityName = obj && obj.facilityName || null;
        this.date = obj && obj.date || null;
        this.passStatus = obj && obj.passStatus || null;
        this.phoneNumber = obj && obj.phoneNumber || null;
        this.facilityType = obj && obj.facilityType || null;
        this.license = obj && obj.license || null;
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
    license: string;

    // SKs
    facilityName: string;
    parkName: string;

    captchaJwt: string;

    constructor(obj?: any) {
        this.email = obj && obj.email || null;
        this.firstName = obj && obj.firstName || null;
        this.lastName = obj && obj.lastName || null;

        this.type = obj && obj.type || null;
        this.numberOfGuests = obj && obj.numberOfGuests || null;
        this.date = obj && obj.date || null;
        this.phoneNumber = obj && obj.phoneNumber || null;
        this.facilityType = obj && obj.facilityType || null;
        this.license = obj && obj.license || null;

        this.facilityName = obj && obj.facilityName || null;
        this.parkName = obj && obj.parkName || null;

        this.captchaJwt = obj?.captchaJwt || null;
    }
}
