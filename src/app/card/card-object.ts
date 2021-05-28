import { Component } from '@angular/core';

export interface ICardObjectParams {
  /**
   * name of the park
   */
   parkName?: string;

  /**
   * Description of a park
   */
   parkDescription?: string;

  /**
   * Description of a park
   */
   parkStatus?: boolean;

  /**
   * Description of a park
   */
   parkVisibility?: boolean;

  /**
   * Description of a park
   */
   parkImage?: string;
}
/**
 * Main class that should contain all information needed to render a card.
 */
export class CardObject {
  public parkName?: string;
  public parkDescription?: string;
  public parkStatus?: boolean;
  public parkVisibility?: boolean;
  public parkImage?: string;
  constructor(params?: ICardObjectParams) {
    this.parkName = (params && params.parkName) || '';
    this.parkDescription = (params && params.parkDescription) || '';
    this.parkStatus = (params && params.parkStatus) || true;
    this.parkVisibility = (params && params.parkVisibility) || true;
    this.parkImage = (params && params.parkImage) || '';
  }
}
