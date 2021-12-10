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
     * HTML formatted message associated with Alert
     */
    message?: string;

    /**
     * type of Alert: error, warning, info, success - will default to info if none provided
     */
    type?: string;

    /**
     * size of Alert - if true, Alert is single line. If false, alert is multiple lines
     */
    smallAlert?: boolean;

}
/**
 * Error class
 */
export class AlertObject {
    public code?: string;
    public title?: string;
    public message?: string;
    public type?: string;
    public smallAlert?: boolean;
    constructor(params?: IAlertObjectParams) {
        this.code = (params && params.code) || '';
        this.title = (params && params.title) || '';
        this.message = (params && params.message) || '';
        this.type = (params && params.type) || 'info';
        this.smallAlert = (params && params.smallAlert) || false;
    }
}
