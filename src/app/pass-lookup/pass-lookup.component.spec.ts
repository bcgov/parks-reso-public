import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from '../shared/services/config.service';

import { PassLookupComponent } from './pass-lookup.component';

describe('PassLookupComponent', () => {
  let component: PassLookupComponent;
  let fixture: ComponentFixture<PassLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PassLookupComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [ConfigService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassLookupComponent);
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
