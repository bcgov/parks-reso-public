import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { PassLookupFormComponent } from './pass-lookup-form.component';
import { ParkService } from '../../services/park.service';

describe('PassLookupFormComponent', () => {
  let component: PassLookupFormComponent;
  let fixture: ComponentFixture<PassLookupFormComponent>;
  let mockParkService: jasmine.SpyObj<ParkService>;

  beforeEach(async () => {
    mockParkService = jasmine.createSpyObj('ParkService', ['fetchData', 'getItemValue']);
    mockParkService.getItemValue.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      declarations: [ PassLookupFormComponent ],
      providers: [
        { provide: ParkService, useValue: mockParkService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassLookupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
