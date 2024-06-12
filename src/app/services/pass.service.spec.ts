import { PassService } from './pass.service';
import { ApiService } from './api.service';
import { EventService } from './event.service';
import { LoggerService } from './logger.service';

describe('PassService', () => {
    let passService: PassService;
    let apiService: ApiService;
    let eventService: EventService;
    let loggerService: LoggerService;

    beforeEach(() => {
        apiService = jasmine.createSpyObj('ApiService', ['post', 'get', 'delete']);
        eventService = jasmine.createSpyObj('EventService', ['setError']);
        loggerService = jasmine.createSpyObj('LoggerService', ['debug', 'error']);
        passService = new PassService(apiService, eventService, loggerService);
    });

    describe('createPass', () => {
        it('should call ApiService.post method with the correct arguments', async () => {
            const obj = {
                parkOrcs: '1234',
                numberOfGuests: 2,
                lastName: 'joe',
                facilityName: 'Facility A',
                email: 'fresh@gmail.com',
                firstName: 'fresh',
                date: new Date('2021-06-10T16:18:46.758Z'),
                type: 'AM',
                parkName: 'Rathtrevor',
                phoneNumber: 1234567890,
                facilityType: 'Trail',
                token: 'testtoken',
                commit: true,
            };
            const parkSk = 'parkSk';
            const facilitySk = 'facilitySk';

            await passService.createPass(obj, parkSk, facilitySk);

            expect(apiService.post).toHaveBeenCalledWith('pass', jasmine.any(Object));
        });
    });

    describe('getPassToCancel', () => {
        it('should call ApiService.get method with the correct arguments', async () => {
            const obj = {
                email: 'fresh@gmail.com',
                passId: '12345657890',
                park: 'Rathtrevor'
            };

            await passService.getPassToCancel(obj);

            expect(apiService.get).toHaveBeenCalledWith('pass', jasmine.any(Object));
        });
    });

    describe('cancelPass', () => {
        it('should call ApiService.delete method with the correct arguments', async () => {
            const obj = {
                park: 'Rathtrevor',
                passId: '1234567890',
                code: 'JWT token'
            };

            await passService.cancelPass(obj);

            expect(apiService.delete).toHaveBeenCalledWith('pass', jasmine.any(Object));
        });
    });
});