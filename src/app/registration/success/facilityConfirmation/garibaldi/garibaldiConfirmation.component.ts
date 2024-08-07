import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-garibaldiConfirmation',
  templateUrl: './garibaldiConfirmation.component.html',
  styleUrls: ['./garibaldiConfirmation.component.scss']
}) 
export class GaribaldiConfirmationComponent {
    @Input() regData: any;
    @Input() park: any;
    public isRubbleCreek: boolean = false;
    public isCheakamus: boolean = false;
    public isDiamondHead: boolean = false;

    ngOnInit(): void {
      if (this.regData?.facilityName === 'Rubble Creek') {
        // Change success layout for Joffre lakes
        this.isRubbleCreek = true;
      } else if (this.regData?.facilityName === 'Cheakamus'){
        this.isCheakamus = true;
      } else if (this.regData?.facilityName === 'Diamond Head'){
        this.isDiamondHead = true;
      }
    }

  }