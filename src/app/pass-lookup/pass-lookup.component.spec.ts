import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassLookupComponent } from './pass-lookup.component';

describe('PassLookupComponent', () => {
  let component: PassLookupComponent;
  let fixture: ComponentFixture<PassLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassLookupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
