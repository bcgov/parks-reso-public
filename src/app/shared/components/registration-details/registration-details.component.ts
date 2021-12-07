import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-registration-details',
  templateUrl: './registration-details.component.html',
  styleUrls: ['./registration-details.component.scss']
})
export class RegistrationDetailsComponent implements OnInit {
  @Input() regData: any;

  constructor() { }

  ngOnInit(): void {
  }

}
