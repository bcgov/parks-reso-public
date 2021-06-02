import { TableObject } from './table-object';
import { EventEmitter, Output, Input, Component } from '@angular/core';

/**
 * Generic message event for all input/output messages.
 *
 * @export
 * @interface ITableMessage
 */
export interface ITableMessage {
  /**
   * Label to identify this event.
   *
   * @type {string}
   * @memberof ITableMessage
   */
  label: string;
  /**
   * Any data that should be sent with the event.
   *
   * @type {*}
   * @memberof ITableMessage
   */
  data?: any;
}

/**
 * Components compatible with table template should extend this class.
 *
 * @export
 * @class TableRowComponent
 */
@Component({
  template: ''
})
export class TableRowComponent {
  /**
   * The specific row data used by the component.
   *
   * @type {*}
   * @memberof TableRowComponent
   */
  @Input() rowData: any;
  /**
   * A copy of the table data.
   *
   * @type {TableObject}
   * @memberof TableRowComponent
   */
  @Input() tableData: TableObject;
  /**
   * An Output() for generically emitting events from child to parent.
   *
   * @type {EventEmitter<ITableMessage>}
   * @memberof TableRowComponent
   */
  @Output() messageOut: EventEmitter<ITableMessage> = new EventEmitter<ITableMessage>();

  /**
   * An Input() for generically emitting events from parent to child.
   *
   * @type {EventEmitter<ITableMessage>}
   * @memberof TableRowComponent
   */
  @Input() messageIn: EventEmitter<ITableMessage> = new EventEmitter<ITableMessage>();
}
