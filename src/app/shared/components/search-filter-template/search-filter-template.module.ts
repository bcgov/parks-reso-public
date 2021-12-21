import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteMultiSelectModule } from '../autocomplete-multi-select/autocomplete-multi-select.module';
import { DatePickerModule } from '../date-picker/date-picker.module';
import { SearchFilterTemplateComponent } from './search-filter-template.component';

@NgModule({
  declarations: [SearchFilterTemplateComponent],
  imports: [AutoCompleteMultiSelectModule, DatePickerModule, FormsModule],
  exports: [SearchFilterTemplateComponent]
})
export class SearchFilterTemplateModule {}
