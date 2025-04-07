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
  @Input() seoService!: SeoAnalyticsService;
}
