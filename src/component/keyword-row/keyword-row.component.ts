import { Component, Input } from '@angular/core';
import { QueryData } from '../../models/seo-model';
import { SeoAnalyticsService } from '../../services/seo-analytics.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-keyword-row',
  imports: [CommonModule],
  templateUrl: './keyword-row.component.html',
  styleUrl: './keyword-row.component.scss'
})
export class KeywordRowComponent {
  @Input() query!: QueryData;
  @Input() isTopQuery?: boolean;
  @Input() maxImpressions?: number = 99;
  @Input() maxClicks?: number = 99;

  getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  getChangeClass(current: number, previous: number): string {
    const change = current - previous;
    return change > 0 ? 'up' : change < 0 ? 'down' : '';
  }

  getArrow(current: number, previous: number): string {
    const change = current - previous;
    return change > 0 ? '▲' : change < 0 ? '▼' : '→';
  }
}
