import { Component, inject } from '@angular/core';
import { Totals, PageData } from '../models/seo-model';
import { HeaderComponent } from '../component/header/header.component';
import { SummaryCardsComponent } from '../component/summary-card/summary-card.component';
import { SeoAnalyticsService } from '../services/seo-analytics.service';
import { CommonModule } from '@angular/common';
import { PageMetricsComponent } from "../component/page-metrics/page-metrics.component";
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, SummaryCardsComponent, CommonModule, PageMetricsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // current = {
  //   "status": "success",
  //   "data": [
  //     {
  //       "query": "alliance shipping",
  //       "page": "https://theallianceshipping.com/",
  //       "clicks": 5,
  //       "impressions": 14,
  //       "ctr": 21.43,
  //       "position": 3.1
  //     },
  //     {
  //       "query": "the alliance shipping",
  //       "page": "https://theallianceshipping.com/service",
  //       "clicks": 2,
  //       "impressions": 8,
  //       "ctr": 25,
  //       "position": 3.5
  //     },
  //     {
  //       "query": "the alliance shipping llllll",
  //       "page": "https://theallianceshipping.com/service",
  //       "clicks": 2,
  //       "impressions": 8,
  //       "ctr": 25,
  //       "position": 3.5
  //     }
  //   ],
  //   "meta": {
  //     "start_date": "2025-04-04",
  //     "end_date": "2025-04-04",
  //     "count": 10
  //   }
  // }

  // pre = {
  //   "status": "success",
  //   "data": [
  //     {
  //       "query": "alliance shipping",
  //       "page": "https://theallianceshipping.com/",
  //       "clicks": 10,
  //       "impressions": 15,
  //       "ctr": 46.67,
  //       "position": 3.3
  //     },
  //     {
  //       "query": "the alliance shipping",
  //       "page": "https://theallianceshipping.com/service",
  //       "clicks": 2,
  //       "impressions": 8,
  //       "ctr": 25,
  //       "position": 2.4
  //     },
  //     {
  //       "query": "the alliance shipping llll",
  //       "page": "https://theallianceshipping.com/service",
  //       "clicks": 2,
  //       "impressions": 8,
  //       "ctr": 25,
  //       "position": 2.4
  //     }
      
  //   ],
  //   "meta": {
  //     "start_date": "2025-04-03",
  //     "end_date": "2025-04-03",
  //     "count": 10
  //   }
  // }
  totals: { current: Totals, previous: Totals } | null = null;
  title = 'SEO Analytics';
  dateRange = 'today';
  currentPages: PageData[] = [];
  previousPages: PageData[] = [];
  loading = false;
  error: string | null = null;
  seoService = inject(SeoAnalyticsService)

  pages = []

  ngOnInit(): void {
    this.loadData();
  }

  onDateRangeChange(range:string): void {
    this.dateRange = range
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    
    const { current, previous } = this.seoService.getDateRange(this.dateRange);

    forkJoin([
      this.seoService.fetchData(current.start, current.end),
      this.seoService.fetchData(previous.start, previous.end)
    ]).subscribe({
      next: ([currentData, previousData]) => {
        this.totals = this.seoService.calculateTotals(currentData?.data, previousData?.data);
        console.log(this.totals);
        
        this.currentPages = this.seoService.getTopPages(currentData.data);
        this.previousPages = this.seoService.getTopPages(previousData.data);
    
        this.pages = this.seoService.transformAnalyticsData(currentData.data, previousData.data)
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading data. Please check with admin.';
        console.error('Error loading data:', err);
        this.loading = false;
      }
    });
  


    // this.totals = this.seoService.calculateTotals(this.current?.data, this.pre?.data);
    // console.log(this.totals);
    
    // this.currentPages = this.seoService.getTopPages(this.current.data);
    // this.previousPages = this.seoService.getTopPages(this.current.data);

    // this.pages = this.seoService.transformAnalyticsData(this.current.data, this.pre.data)
    // this.loading = false;
  
  }

  trackByPage(index: number, page: PageData): string {
    return page.page;
  }
}