import { Component, inject } from '@angular/core';
import { Totals, PageData } from '../models/seo-model';
import { HeaderComponent } from '../component/header/header.component';
import { SummaryCardsComponent } from '../component/summary-card/summary-card.component';
import { forkJoin } from 'rxjs';
import { SeoAnalyticsService } from '../services/seo-analytics.service';
import { CommonModule } from '@angular/common';
import { PageCardComponent } from '../component/page-card/page-card.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, SummaryCardsComponent,CommonModule,PageCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  current = {
    "status": "success",
    "data": [
      {
        "query": "alliance shipping",
        "page": "https://theallianceshipping.com/",
        "clicks": 3,
        "impressions": 14,
        "ctr": 21.43,
        "position": 3.1
      },
      {
        "query": "the alliance shipping",
        "page": "https://theallianceshipping.com/",
        "clicks": 2,
        "impressions": 8,
        "ctr": 25,
        "position": 3.5
      },
      {
        "query": "alliance shipping company",
        "page": "https://theallianceshipping.com/contact/",
        "clicks": 1,
        "impressions": 4,
        "ctr": 25,
        "position": 1.8
      },
      {
        "query": "alliance shipping company",
        "page": "https://theallianceshipping.com/shipping-from-karachi/",
        "clicks": 1,
        "impressions": 4,
        "ctr": 25,
        "position": 1.8
      },
      {
        "query": "alliance shipping karachi",
        "page": "https://theallianceshipping.com/",
        "clicks": 1,
        "impressions": 1,
        "ctr": 100,
        "position": 1
      },
      {
        "query": "cargo riyadh to pakistan",
        "page": "https://theallianceshipping.com/cargo-from-saudi-arabia-to-karachi/",
        "clicks": 1,
        "impressions": 1,
        "ctr": 100,
        "position": 4
      },
      {
        "query": "transport",
        "page": "https://theallianceshipping.com/cargo-from-karachi-to-afghanistan/",
        "clicks": 1,
        "impressions": 1,
        "ctr": 100,
        "position": 2
      },
      {
        "query": "worth alliance shipping",
        "page": "https://theallianceshipping.com/",
        "clicks": 1,
        "impressions": 3,
        "ctr": 33.33,
        "position": 4.7
      },
      {
        "query": "\"shipping to bangkok\"",
        "page": "https://theallianceshipping.com/shipping-cargo-rates-from-dubai-to-thailand/",
        "clicks": 0,
        "impressions": 1,
        "ctr": 0,
        "position": 30
      },
      {
        "query": "\"shipping to taiwan\"",
        "page": "https://theallianceshipping.com/shipping-cargo-from-china-to-taiwan-china/",
        "clicks": 0,
        "impressions": 1,
        "ctr": 0,
        "position": 90
      }
    ],
    "meta": {
      "start_date": "2025-04-04",
      "end_date": "2025-04-04",
      "count": 10
    }
  }

  pre = {
    "status": "success",
    "data": [
      {
        "query": "alliance shipping",
        "page": "https://theallianceshipping.com/",
        "clicks": 7,
        "impressions": 15,
        "ctr": 46.67,
        "position": 3.3
      },
      {
        "query": "the alliance shipping",
        "page": "https://theallianceshipping.com/",
        "clicks": 2,
        "impressions": 8,
        "ctr": 25,
        "position": 2.4
      },
      {
        "query": "alliance shipping",
        "page": "https://theallianceshipping.com/shipping-from-china/",
        "clicks": 1,
        "impressions": 7,
        "ctr": 14.29,
        "position": 4.1
      },
      {
        "query": "alliance shipping llc",
        "page": "https://theallianceshipping.com/",
        "clicks": 1,
        "impressions": 3,
        "ctr": 33.33,
        "position": 1
      },
      {
        "query": "cargo from karachi to dubai",
        "page": "https://theallianceshipping.com/cargo-from-karachi-to-dubai/",
        "clicks": 1,
        "impressions": 2,
        "ctr": 50,
        "position": 4
      },
      {
        "query": "cargo to russia from dubai",
        "page": "https://theallianceshipping.com/cargo-from-dubai-to-russia/",
        "clicks": 1,
        "impressions": 1,
        "ctr": 100,
        "position": 4
      },
      {
        "query": "shipping companies in dubai",
        "page": "https://theallianceshipping.com/",
        "clicks": 1,
        "impressions": 94,
        "ctr": 1.06,
        "position": 9.4
      },
      {
        "query": "shipping line dubai",
        "page": "https://theallianceshipping.com/",
        "clicks": 1,
        "impressions": 2,
        "ctr": 50,
        "position": 28.5
      },
      {
        "query": "shipping to argentina cost",
        "page": "https://theallianceshipping.com/shipping-cargo-rates-from-dubai-to-argentina/",
        "clicks": 1,
        "impressions": 1,
        "ctr": 100,
        "position": 3
      },
      {
        "query": "\"shipping to taiwan\"",
        "page": "https://theallianceshipping.com/shipping-cargo-from-china-to-taiwan-china/",
        "clicks": 0,
        "impressions": 1,
        "ctr": 0,
        "position": 89
      }
    ],
    "meta": {
      "start_date": "2025-04-03",
      "end_date": "2025-04-03",
      "count": 10
    }
  }
  totals: { current: Totals, previous: Totals } | null = null;
  title = 'SEO Analytics';
  dateRange = 'today';
  currentTopPages: PageData[] = [];
  loading = false;
  error: string | null = null;
  seoService = inject(SeoAnalyticsService)

  ngOnInit(): void {
    this.loadData();
  }

  onDateRangeChange(e:any): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    
    const { current, previous } = this.seoService.getDateRange(this.dateRange);

    // forkJoin([
    //   this.seoService.fetchData(current.start, current.end),
    //   this.seoService.fetchData(previous.start, previous.end)
    // ]).subscribe({
    //   next: ([currentData, previousData]) => {
    //     this.totals = this.seoService.calculateTotals(currentData?.data, previousData?.data);
    //     console.log(this.totals);
        
    //     this.currentTopPages = this.seoService.getTopPages(currentData.data);
    //     this.loading = false;
    //   },
    //   error: (err) => {
    //     this.error = 'Error loading data. Please check console for details.';
    //     console.error('Error loading data:', err);
    //     this.loading = false;
    //   }
    // });
  


    this.totals = this.seoService.calculateTotals(this.current?.data, this.pre?.data);
    console.log(this.totals);

    let t = 0
    let p=0
    this.pre.data.forEach(ele=>t = t+ele.position)
    console.log(t);

    this.current.data.forEach(ele=>p = p+ele.position)
    console.log(p);
    
    
    this.currentTopPages = this.seoService.getTopPages(this.current.data);
    this.loading = false;
  
  }

  trackByPage(index: number, page: PageData): string {
    return page.page;
  }
}