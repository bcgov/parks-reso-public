import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassLookupFormComponent } from './pass-lookup-form.component';

describe('PassLookupFormComponent', () => {
  let component: PassLookupFormComponent;
  let fixture: ComponentFixture<PassLookupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassLookupFormComponent ]
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

  afterEach(() => {
    TestBed.resetTestingModule();
  });
});
