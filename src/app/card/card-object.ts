import { Component } from '@angular/core';

export interface ICardObjectParams {

  /**
   * id of the park
   */
   _id?: number;

  /**
   * name of the park
   */
   name?: string;

  /**
   * status of a park
   */
   status?: boolean;

  /**
   * image of a park
   */
   image?: string;
}
/**
 * Main class that should contain all information needed to render a card.
 */
export class CardObject {
  // tslint:disable-next-line:variable-name
  public _id?: number;
  public name?: string;
  public status?: boolean;
  public image?: string;
  constructor(params?: ICardObjectParams) {
    this._id = (params && params._id) || null;
    this.name = (params && params.name) || '';
    this.status = (params && params.status) || true;
    this.image = (params && params.image) || '';
  }
}
