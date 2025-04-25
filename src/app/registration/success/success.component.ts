import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-success',
    templateUrl: './success.component.html',
    styleUrls: ['./success.component.scss'],
    standalone: false
})
export class SuccessComponent implements OnInit {
  @Input() regData;
  @Input() park;

  public qrColourLight = '#f1f1f1';
  public parkLink = 'https://bcparks.ca/joffre-lakes-park/'
  public isJoffreLakes = false;
  public isGaribaldi = false;
  public isMountSeymour

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (this.regData) {
      this.regData['park'] = this.park || null;
    }
    switch (this.park?.orcs) {
      case '0363':
        this.isJoffreLakes = true;
        break;
      case '0007':
        this.isGaribaldi = true;
        break;
      case '0015':
        this.isMountSeymour = true;
        break;
      default:
        break;
    }
  }

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
    };
  }

  navigate(): void {
    this.router.navigate(['']);
  }

  uriEncode(str: string): string {
    return encodeURI(str);
  }
}
