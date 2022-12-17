import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { of } from 'rxjs/internal/observable/of';

import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let eventsSub = new BehaviorSubject<any>(null);
  let routerStub = {
    events: eventsSub
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BreadcrumbComponent],
      imports: [
        RouterTestingModule,
        RouterTestingModule.withRoutes([
          {
            path: 'home',
            component: BreadcrumbComponent,
            children: [
              {
                path: 'something/else',
                component: BreadcrumbComponent
              }
            ]
          }
        ])
      ],
      providers: [
        {
          provide: Router,
          useValue: routerStub
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                property: 'yourProperty',
                someId: 3
              },
              queryParams: of({})
            },
            queryParams: of({}),
            queryParamMap: of({}),
            params: of({ id: 'something' })
          }
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit breadcrumbs', async () => {
    const url = 'http://localhost/foo';
    const params = { someParam: '123' };
    expect(component).toBeTruthy();
    spyOn(component.navigateBreadcrumb, 'emit');
    component.emitBreadcrumb(url, params);
    fixture.detectChanges();
    expect(component.navigateBreadcrumb.emit).toHaveBeenCalledWith({ url, params });
  });

  it('Init, subscribe and get breadcrumbs', async () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();
    let mockNav = new NavigationEnd(1, 'home', 'home');
    eventsSub.next(mockNav);
    fixture.detectChanges();
  });
});
