export interface IAlertObjectParams {

  /**
   * Error code (if exists)
   */
  code?: string;

  /**
   * Alert title
   */
  title?: string;

  /**
   * Message associated with Alert
   */
  message?: string;

  /**
   * type of Alert: error, warning, info, success - will default to info if none provided
   */
  type?: string;

}
/**
 * Error class
 */
export class AlertObject {
  public code?: string;
  public title?: string;
  public message?: string;
  public type?: string;
  constructor(params?: IAlertObjectParams) {
    this.code = (params && params.code) || '';
    this.title = (params && params.title) || '';
    this.message = (params && params.message) || '';
    this.type = (params && params.type) || 'info';
  }
}
