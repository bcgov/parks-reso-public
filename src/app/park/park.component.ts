import { Component, OnInit } from '@angular/core';
import {Constants} from 'src/app/shared/utils/constants';

@Component({
  selector: 'app-park',
  templateUrl: './park.component.html',
  styleUrls: ['./park.component.scss']
})
export class ParkComponent implements OnInit {

  public park = Constants.mockPark1;

  constructor() { }

  ngOnInit(): void {
  }

}
