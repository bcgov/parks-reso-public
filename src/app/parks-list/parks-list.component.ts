import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { ParkService } from '../services/park.service';
import { IColumnObject } from '../shared/components/table-template/table-object';
import { ParksTableRowComponent } from './parks-table-row/parks-table-row.component';

@Component({
  selector: 'app-parks-list',
  templateUrl: './parks-list.component.html',
  styleUrls: ['./parks-list.component.scss']
})
export class ParksListComponent implements OnInit, OnDestroy {
  private alive = true;
  // Component
  public loading = true;
  // This will be changed to service.
  public data = [];
  public totalListItems = 0;
  public options = { showPagination: false };
  public error = false;

  public tableRowComponent = ParksTableRowComponent;

  // Table
  public tableColumns: IColumnObject[] = [
    {
      name: '',
      value: '',
      width: 'col-12',
      nosort: true
    }
  ];

  private parkNameSortFunction = function (a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  };

  constructor(private changeDetectionRef: ChangeDetectorRef, private parkService: ParkService) {}

  ngOnInit() {
    let tabIndex = 10;

    this.parkService
      .getListValue()
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        if (res) {
          if (res === 'error') {
            this.error = true;
          } else {
            let tempList = [];
            let tempClosedList = [];
            let specialClosureList = [];
            res.forEach(park => {
              if (park.status === 'closed') {
                tempClosedList.push({ ...park, ...{ tabindex: tabIndex } });
              } else if (park.specialClosure === true ) {
                specialClosureList.push({ ...park, ...{ tabindex: tabIndex } });
              } else {
                tempList.push({ ...park, ...{ tabindex: tabIndex } });
              }
            });

            tempList.sort(this.parkNameSortFunction);
            specialClosureList.sort(this.parkNameSortFunction);
            tempClosedList.sort(this.parkNameSortFunction);

            this.data = [{ rowData: [...tempList, ...specialClosureList, ...tempClosedList] }];
            this.totalListItems = res.length;
          }
          this.loading = false;
          this.changeDetectionRef.detectChanges();
        }
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
