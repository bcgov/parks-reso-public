import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TableObject } from '../table-template/table-object';
import { ITableMessage } from '../table-template/table-row-component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  @Input() tableRowComponent;
  @Input() tableColumns;

  // This will turn into fetching data from the service
  @Input() tempData;

  // Component
  public loading = true;

  // Table
  public tableData: TableObject;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.tableData = new TableObject({ component: this.tableRowComponent });
    // Get table controls from url and save them in the tableData

    // Get data from service

    if ( this.tempData ) {
      this.tableData.totalListItems = this.tempData.length;
      this.tableData.items = this.tempData;
      this.tableData.options.showHeader = false;
      this.tableData.options.showPageCountDisplay = false;
    }

    // Set columns
    this.tableData.columns = this.tableColumns;
    this._changeDetectionRef.detectChanges();
    this.loading = false;
  }

  onMessageOut(msg: ITableMessage) {
    let params = {};
    switch (msg.label) {
      case 'pageNum':
        params['currentPage'] = msg.data;
        // this.tableService.data[this.tableId].cachedConfig.currentPage = params['currentPage'];
        break;
      case 'pageSize':
        params['pageSize'] = msg.data.value;
        if (params['pageSize'] === this.tableData.totalListItems) {
          // this.loadingTableData = true;
        }
        params['currentPage'] = 1;
        // this.tableService.data[this.tableId].cachedConfig.pageSize = params['pageSize'];
        // this.tableService.data[this.tableId].cachedConfig.currentPage = params['currentPage'];
        break;
      default:
        break;
    }
    this.submit(params);
  }

  submit(params, filters = null) {
    console.log(params, filters);
    // this.router.navigate(
    //   [],
    //   {
    //     queryParams: filters ? { ...params, ...filters } : params,
    //     relativeTo: this.route,
    //     queryParamsHandling: 'merge'
    //   });
    // this.loadingTableData = true;
    // this.tableService.refreshData(this.tableId);
  }
}
