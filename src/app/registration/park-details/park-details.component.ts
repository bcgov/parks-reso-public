import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-park-details',
  templateUrl: './park-details.component.html',
  styleUrls: ['./park-details.component.scss']
})
export class ParkDetailsComponent implements OnInit {
  @Input() park;
  constructor() { }

  ngOnInit(): void {
  }

}
