import { Component, Input, OnInit } from '@angular/core';
import { Pass } from 'src/app/models/pass';

@Component({
  selector: 'app-registration-details',
  templateUrl: './registration-details.component.html',
  styleUrls: ['./registration-details.component.scss']
})
export class RegistrationDetailsComponent implements OnInit {
  @Input() regData: Pass;

  constructor() { }

  ngOnInit(): void {
  }

}
