import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { PageCountDisplayModule } from '../page-count-display/page-count-display.module';
import { PageSizePickerModule } from '../page-size-picker/page-size-picker.module';
import { TableRowDirective } from './table-row.directive';
import { TableTemplateComponent } from './table-template.component';

@NgModule({
  declarations: [TableTemplateComponent, TableRowDirective],
  imports: [PageCountDisplayModule, PageSizePickerModule, NgxPaginationModule, CommonModule],
  exports: [TableTemplateComponent],
  providers: []
})
export class TableTemplateModule {}
