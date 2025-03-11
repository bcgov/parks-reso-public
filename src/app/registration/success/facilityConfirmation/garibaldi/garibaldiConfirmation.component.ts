import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-garibaldiConfirmation',
    templateUrl: './garibaldiConfirmation.component.html',
    styleUrls: ['./garibaldiConfirmation.component.scss'],
    standalone: false
})
export class GaribaldiConfirmationComponent implements OnInit {
  @Input() regData: any;
  @Input() park: any;
  public isRubbleCreek = false;
  public isCheakamus = false;
  public isDiamondHead = false;

  ngOnInit(): void {
    if (this.regData?.facilityName === 'Rubble Creek') {
      // Change success layout for Joffre lakes
      this.isRubbleCreek = true;
    } else if (this.regData?.facilityName === 'Cheakamus') {
      this.isCheakamus = true;
    } else if (this.regData?.facilityName === 'Diamond Head') {
      this.isDiamondHead = true;
    }
  }

}