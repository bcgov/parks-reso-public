import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appPhoneFormat]'
})
export class PhoneFormatDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) 
  @HostListener('keydown', ['$event'])
  onInput(event: any) {
    let input = event.target;
    const inputValue = input.value;
    let cursorPosition = input.selectionStart;
  
    if (inputValue.length === 12 && event.inputType !== 'delete' && event.inputType !== 'backspace') {
      return;
    }
    const formatted = this.formatPhoneNumber(inputValue.replace(/\D/g, ''), event.inputType);
    input.value = formatted;
  
    if (cursorPosition > 3 && cursorPosition <= 7) {
      cursorPosition += 1; 
    } else if (cursorPosition > 7) {
      cursorPosition += 2; 
    }

    input.setSelectionRange(cursorPosition, cursorPosition);
  }
  private formatPhoneNumber(value: string, inputType: string): string {
    if (inputType === 'delete' || inputType === 'backspace') {
      return value;
    }
    if (value.length > 3 && value.charAt(3) !== '-') {
      value = [value.slice(0, 3), '-', value.slice(3)].join('');
    }
    if (value.length > 7 && value.charAt(7) !== '-') {
      value = [value.slice(0, 7), '-', value.slice(7)].join('');
    }
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    return value;
  }
}