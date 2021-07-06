
import { Component, Input, OnInit } from '@angular/core';
import { AlertObject } from './alert-object';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @Input() data: AlertObject;

  constructor() { }

  ngOnInit(): void {
  }

  getAlertClass(type): string {
    switch (type) {
      case 'error':
        return 'error-container';
      case 'warning':
        return 'warning-container';
      case 'success':
        return 'success-container';
      case 'info':
      default:
        return 'info-container';
    }
  }
}
