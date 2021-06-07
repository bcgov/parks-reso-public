import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParksTableRowComponent } from './parks-table-row.component';

describe('ParksTableRowComponent', () => {
  let component: ParksTableRowComponent;
  let fixture: ComponentFixture<ParksTableRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParksTableRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParksTableRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
