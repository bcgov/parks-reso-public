import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../services/faq.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-pass-lookup',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  // states: loading, blank, verify-populate, not-verified, verified, not-cancelled, cancelled
  public state = 'loading';
  public verificationText = '';
  public title = 'Frequently Asked Questions';
  public backButtonText = 'Home';
  public faqData = '';
  public validationData = '';
  public cancelledPassData = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private faqService: FaqService,
    private toastService: ToastService
  ) { }

  async ngOnInit() {
    this.scrollToTop();
    this.faqData = await this.faqService.getFaq();
    document.getElementById('faqData').innerHTML = this.faqData;
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  navigate(): void {
    this.router.navigate(['']);
  }
}
