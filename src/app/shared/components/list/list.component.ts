import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TableObject } from '../table-template/table-object';
import { ITableMessage } from '../table-template/table-row-component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnChanges {
  @Input() tableRowComponent;
  @Input() tableColumns;

  // This will turn into fetching data from the service
  @Input() data;
  @Input() totalListItems;
  @Input() options;

  // Table
  public tableData: TableObject = new TableObject();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tableRowComponent) {
      this.tableData.component = changes.tableRowComponent.currentValue;
    }
    if (changes.tableColumns) {
      this.tableData.columns = changes.tableColumns.currentValue;
    }
    if (changes.data) {
      this.tableData.items = changes.data.currentValue;
    }
    if (changes.totalListItems) {
      this.tableData.totalListItems = changes.totalListItems.currentValue;
    }
    if (changes.options) {
      this.tableData.options = changes.options.currentValue;
    }
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
