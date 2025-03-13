import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-registration-details',
    templateUrl: './registration-details.component.html',
    styleUrls: ['./registration-details.component.scss'],
    standalone: false
})
export class RegistrationDetailsComponent {
  @Input() regData: any;
}
