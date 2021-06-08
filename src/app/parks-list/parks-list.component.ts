import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IColumnObject } from '../shared/components/table-template/table-object';
import { Constants } from '../shared/utils/constants';
import { ParksTableRowComponent } from './parks-table-row/parks-table-row.component';

@Component({
  selector: 'app-parks-list',
  templateUrl: './parks-list.component.html',
  styleUrls: ['./parks-list.component.scss']
})
export class ParksListComponent implements OnInit {
  // Component
  public loading = true;
  // This will be changed to service.
  public tempData;
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

  constructor(
    private changeDetectionRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    let tempList = [];
    let tabIndex = 10;
    Constants.mockParkList.forEach(park => {
      tempList.push({ ...park, ...{ tabindex: tabIndex } });
      tabIndex++;
    });
    this.tempData = [{ rowData: tempList }];
    this.changeDetectionRef.detectChanges();
    this.loading = false;
  }
}
