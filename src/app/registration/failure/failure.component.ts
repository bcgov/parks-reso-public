import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-failure',
  templateUrl: './failure.component.html',
  styleUrls: ['./failure.component.scss']
})
export class FailureComponent implements OnInit {
  @Input() errorContent = {
    title: "We're sorry! An error occured.",
    msg: "An error occurred while trying to submit your reservation information. Please try again."
  };
  public sanitizedContent: SafeHtml;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.sanitizedContent = this.sanitizer.sanitize(SecurityContext.HTML, this.errorContent.msg);
  }

  navigate(): void {
    this.router.navigate(['']);
  }

}
