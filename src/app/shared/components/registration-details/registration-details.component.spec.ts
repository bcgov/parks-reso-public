import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationDetailsComponent } from './registration-details.component';

describe('RegistrationDetailsComponent', () => {
  let component: RegistrationDetailsComponent;
  let fixture: ComponentFixture<RegistrationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
