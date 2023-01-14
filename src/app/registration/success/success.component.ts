import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  @Input() regData;
  @Input() park;

  public qrColourLight = '#f1f1f1';

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.regData) {
      this.regData['park'] = this.park || null;
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
    WindowPrt.focus();
    WindowPrt.print();
  }

  navigate(): void {
    this.router.navigate(['']);
  }
}
