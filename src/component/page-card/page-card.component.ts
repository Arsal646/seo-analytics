import { Component, Input } from '@angular/core';
import { SeoAnalyticsService } from '../../services/seo-analytics.service';
import { PageData } from '../../models/seo-model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-page-card',
  imports: [CommonModule],
  templateUrl: './page-card.component.html',
  styleUrl: './page-card.component.scss'
})
export class PageCardComponent {
  @Input() page!: PageData;
  @Input() seoService!: SeoAnalyticsService;
  isExpanded = false;

  constructor(){
    setTimeout(() => {
      console.log('page',this.page);
      
    }, 400);
  }

  toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  getChangeClass(current: number, previous: number, reverse = false): string {
    const change = current - previous;
    if (reverse) {
      // For position - lower is better
      return change < 0 ? 'up' : change > 0 ? 'down' : '';
    }
    // For other metrics - higher is better
    return change > 0 ? 'up' : change < 0 ? 'down' : '';
  }

  getArrow(current: number, previous: number, reverse = false): string {
    const change = current - previous;
    if (reverse) {
      // For position - lower is better
      return change < 0 ? '▲' : change > 0 ? '▼' : '→';
    }
    // For other metrics - higher is better
    return change > 0 ? '▲' : change < 0 ? '▼' : '→';
  }

  getvvv(page:any){
    return page.queries.reduce((sum: any, q: { position: any; }) => sum + q.position, 0) / page.queries.length
  }
}