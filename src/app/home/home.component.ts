import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


public mockParkList = [
  {
    parkName: 'Cypress',
    parkDescription: 'I am an mountain :)',
    parkStatus: true,
    parkVisibility: true,
    parkImage: 'assets/images/Akamina-Kishinena-Iain-Robert-Reid-15.jpg'
  },
  {
    parkName: 'Cypress',
    parkDescription: 'I am an mountain :)',
    parkStatus: true,
    parkVisibility: true,
    parkImage: 'assets/images/Akamina-Kishinena-Iain-Robert-Reid-15.jpg'
  },
  {
    parkName: 'Cypress',
    parkDescription: 'I am an mountain :)',
    parkStatus: true,
    parkVisibility: true,
    parkImage: 'assets/images/Akamina-Kishinena-Iain-Robert-Reid-15.jpg'
  },
  {
    parkName: 'Cypress',
    parkDescription: 'I am an mountain :)',
    parkStatus: true,
    parkVisibility: true,
    parkImage: 'assets/images/Akamina-Kishinena-Iain-Robert-Reid-15.jpg'
  },
  {
    parkName: 'Cypress',
    parkDescription: 'I am an mountain :)',
    parkStatus: true,
    parkVisibility: true,
    parkImage: 'assets/images/Akamina-Kishinena-Iain-Robert-Reid-15.jpg'
  },
  {
    parkName: 'Cypress',
    parkDescription: 'I am an mountain :)',
    parkStatus: true,
    parkVisibility: true,
    parkImage: 'assets/images/Akamina-Kishinena-Iain-Robert-Reid-15.jpg'
  },
];


  constructor() { }

  ngOnInit(): void {
  }

}
