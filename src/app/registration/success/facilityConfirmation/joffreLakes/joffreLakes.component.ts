import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-joffreLakes',
  templateUrl: './joffreLakes.component.html',
  styleUrls: ['./joffreLakes.component.scss']
})
export class JoffreLakesComponent {
    @Input() regData: any;
    public isJoffreLakes = true;
    public parkLink = 'https://bcparks.ca/joffre-lakes-park/' 

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