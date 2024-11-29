import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mountSeymour',
  templateUrl: './mountSeymour.component.html',
  styleUrls: ['./mountSeymour.component.scss']
})
export class MountSeymourComponent {
    
    @Input() regData: any;
    public isMountSeymour = true;
    public parkLink = 'https://bcparks.ca/mount-seymour-park/#advisories'
    public avalancheLink = 'https://avalanche.ca/map/forecasts/9115d426-7872-4b62-bdd8-234a94ae0ab9_fc022cc076b5327b78b2e1d6fbfd8d1d49dec6a1260f070359a9704acaa9fdaa?panel=null'

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