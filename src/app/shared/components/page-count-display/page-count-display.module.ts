import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PageCountDisplayComponent } from './page-count-display.component';

@NgModule({
  declarations: [PageCountDisplayComponent],
  imports: [ CommonModule ],
  exports: [PageCountDisplayComponent]
})
export class PageCountDisplayModule {}
