import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Utils } from './utils/utils';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { RegistrationDetailsComponent } from './components/registration-details/registration-details.component';
import { TableTemplateComponent } from './components/table-template/table-template.component';
import { PageSizePickerComponent } from './components/page-size-picker/page-size-picker.component';
import { PageCountDisplayComponent } from './components/page-count-display/page-count-display.component';
import { AutoCompleteMultiSelectComponent } from './components/autocomplete-multi-select/autocomplete-multi-select.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TableTemplate } from './components/table-template/table-template';
import { ListComponent } from './components/list/list.component';
import { TableRowDirective } from './components/table-template/table-row.directive';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxPaginationModule
  ],
  declarations: [
    PageSizePickerComponent,
    PageCountDisplayComponent,
    AutoCompleteMultiSelectComponent,
    DatePickerComponent,
    RegistrationDetailsComponent,
    TableTemplateComponent,
    ListComponent,
    TableRowDirective,
  ],
  entryComponents: [
  ],
  exports: [
    PageSizePickerComponent,
    PageCountDisplayComponent,
    AutoCompleteMultiSelectComponent,
    DatePickerComponent,
    RegistrationDetailsComponent,
    TableTemplateComponent,
    ListComponent,
    TableRowDirective,
  ],
  providers: [
    TableTemplate,
    Utils
  ]
})

export class SharedModule { }
