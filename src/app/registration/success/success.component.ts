import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faListCheck } from '@fortawesome/pro-regular-svg-icons';
import { faTriangleExclamation} from '@fortawesome/pro-regular-svg-icons';
import { faCircleParking } from '@fortawesome/pro-regular-svg-icons';
import { faBird } from '@fortawesome/pro-regular-svg-icons';
import { faMusic } from '@fortawesome/pro-regular-svg-icons';
import { faTrashCan } from '@fortawesome/pro-regular-svg-icons';
import { faDogLeashed } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  @Input() regData;
  @Input() park;

  public qrColourLight = '#f1f1f1';
  public parkLink = 'https://bcparks.ca/joffre-lakes-park/'
  public isJoffreLakes = false;
  public faListCheck = faListCheck;
  public faTriangleExclamation = faTriangleExclamation;
  public faCircleParking = faCircleParking;
  public faBird = faBird;
  public faMusic = faMusic;
  public faTrashCan = faTrashCan;
  public faDogLeashed = faDogLeashed

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (this.regData) {
      this.regData['park'] = this.park || null;
    }
    if (this.park && this.park.orcs === '0363') {
      // Change success layout for Joffre lakes
      this.isJoffreLakes = true;
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
    }
  }

  navigate(): void {
    this.router.navigate(['']);
  }

  uriEncode(str: string): string {
    return encodeURI(str);
  }
}
