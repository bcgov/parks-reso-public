import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'lib-page-count-display',
    templateUrl: './page-count-display.component.html',
    styleUrls: ['./page-count-display.component.scss'],
    standalone: false
})
export class PageCountDisplayComponent implements OnChanges {
  @Input() isHidden = false;
  @Input() currentPageNum = 1;
  @Input() currentPageSize = 25;
  @Input() totalItems = 0;

  message = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes.firstChange) {
      return;
    }

    if (changes['currentPageNum'] && changes['currentPageNum'].currentValue) {
      this.currentPageNum = changes['currentPageNum'].currentValue;
    }

    if (changes['currentPageSize'] && changes['currentPageSize'].currentValue) {
      this.currentPageSize = changes['currentPageSize'].currentValue;
    }

    if (changes['totalItems'] && changes['totalItems'].currentValue) {
      this.totalItems = changes['totalItems'].currentValue;
    }

    this.setCountDisplayMessage();
  }

  setCountDisplayMessage(): void {
    const pageCount = Math.max(1, Math.ceil(this.totalItems / this.currentPageSize));

    if (this.totalItems <= 0) {
      this.message = 'No results found';
    } else if (this.currentPageNum > pageCount) {
      // This check is necessary due to a rare edge-case where the user has manually incremented the page parameter in
      // the URL beyond what would normally be allowed. As a result when records are fetched, there aren't enough
      // to reach this page, and so the total records found is > 0, but the records displayed for this page
      // is 0, which may confuse users.  Tell them to press clear button which will reset the pagination url parameter.
      this.message = 'Unable to display results, please clear and re-try';
    } else {
      const high = Math.min(this.totalItems, this.currentPageNum * this.currentPageSize);
      this.message = `Showing ${high} of ${this.totalItems} results`;

    }
  }
}
