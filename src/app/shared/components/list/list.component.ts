import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TableObject } from '../table-template/table-object';
import { ITableMessage } from '../table-template/table-row-component';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: false
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
        break;
      case 'pageSize':
        params['pageSize'] = msg.data.value;
        params['currentPage'] = 1;
        break;
      default:
        break;
    }
  }
}
