import { Component } from '@angular/core';
import { TableRowComponent } from 'src/app/shared/components/table-template/table-row-component';

@Component({
    selector: 'tr[app-parks-table-row]',
    templateUrl: './parks-table-row.component.html',
    styleUrls: ['./parks-table-row.component.scss'],
    standalone: false
})
export class ParksTableRowComponent extends TableRowComponent {

  constructor() {
    super();
  }
}
