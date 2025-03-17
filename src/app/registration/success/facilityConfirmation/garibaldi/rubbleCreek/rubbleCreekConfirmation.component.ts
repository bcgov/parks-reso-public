import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-rubbleCreekConfirmation',
    templateUrl: './rubbleCreekConfirmation.component.html',
    styleUrls: ['./rubbleCreekConfirmation.component.scss'],
    standalone: false
}) 
export class RubbleCreekConfirmationComponent {
    @Input() regData: any;
    public parkLink = 'https://bcparks.ca/garibaldi-park/';
    public tripPlanLink = 'https://www.adventuresmart.ca/trip-plan-app/';
    public bearLink = 'https://bcparks.ca/plan-your-trip/visit-responsibly/wildlife-safety/#bears';

    constructor(private router: Router) { }
    
    print(): void {
        const qrContent = document.getElementById('qr-code');
        const printContent = document.getElementById('registration');
        const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
        WindowPrt.document.write('<h4> BC Parks Day Pass Reservation System </h4>');
        if (qrContent) {
          WindowPrt.document.write(qrContent.innerHTML);
        }
        WindowPrt.document.write(printContent.innerHTML);
        WindowPrt.document.close();
    
        WindowPrt.onload = () => {
          WindowPrt.focus();
          WindowPrt.print();
        }
      }
    
      navigate(): void {
        this.router.navigate(['']);
      }

  }