import { Component, Input } from '@angular/core';
import { SeoAnalyticsService } from '../../services/seo-analytics.service';
import { PageData } from '../../models/seo-model';
import { CommonModule } from '@angular/common';
import { KeywordRowComponent } from '../keyword-row/keyword-row.component';

@Component({
  selector: 'app-page-card',
  imports: [CommonModule,KeywordRowComponent],
  templateUrl: './page-card.component.html',
  styleUrl: './page-card.component.scss'
})
export class PageCardComponent {
  @Input() page!: PageData;
  @Input() seoService!: SeoAnalyticsService;
  isOpen = false;

  toggleDetails(): void {
    this.isOpen = !this.isOpen;
  }

  getAvgPosition(): string {
    return (
      this.page.queries.reduce((sum, q) => sum + q.position, 0) /
      this.page.queries.length
    ).toFixed(1);
  }

  getPositionColor(): string {
    const avgPosition = parseFloat(this.getAvgPosition());
    return this.seoService.getPositionColor(avgPosition);
  }
}


