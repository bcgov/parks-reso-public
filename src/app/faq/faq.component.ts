import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../services/faq.service';
import { ToastService } from '../services/toast.service';
import { Constants } from '../shared/utils/constants';

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
  public isLoading:boolean; 

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private faqService: FaqService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.isLoading = true;
    this.scrollToTop();
    try {
      this.faqData = await this.faqService.getFaq();
      document.getElementById('faqData').innerHTML = this.faqData;
    } catch (error) {
      this.isLoading = false;
      this.toastService.addMessage("Failed to retrieve Frequently Asked Questions",`No Response`, Constants.ToastTypes.ERROR);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  navigate(): void {
    this.router.navigate(['./']);
  }
}
