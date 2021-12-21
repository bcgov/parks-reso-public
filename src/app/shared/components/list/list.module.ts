import { NgModule } from '@angular/core';
import { TableTemplateModule } from '../table-template/table-template.module';
import { ListComponent } from './list.component';

@NgModule({
  declarations: [ListComponent],
  imports: [TableTemplateModule],
  exports: [ListComponent]
})
export class ListModule {}
