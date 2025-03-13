import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appPhoneFormat]',
    standalone: false
})
export class PhoneFormatDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) 
  @HostListener('keydown', ['$event'])
  @HostListener('paste', ['$event'])
  onInput(event: any) {
    if (event.type === 'paste') {
      event.preventDefault();
    }
  }
}