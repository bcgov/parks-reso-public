import { Component, OnInit } from '@angular/core';
import {Constants} from 'src/app/shared/utils/constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


public mockParkList = Constants.mockParkList;

  constructor() { }

  ngOnInit(): void {
  }

}
