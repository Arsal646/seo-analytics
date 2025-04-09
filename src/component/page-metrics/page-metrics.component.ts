import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-page-metrics',
  imports: [CommonModule,TableModule, ButtonModule],
  templateUrl: './page-metrics.component.html',
  styleUrl: './page-metrics.component.scss'
})
export class PageMetricsComponent {

  @Input() pages: any[] = [];

  constructor(){
    setTimeout(() => {
      console.log(this.pages);
      
    }, 300);
  }

  toggleExpanded(page: any) {
    page.expanded = !page.expanded;
  }

  

  formatUrl(url:String) {
    const formatted = url.replace('https://theallianceshipping.com', '').replace(/^\/|\/$/g, '');
    return (formatted) || 'theallianceshipping.com';
  }



  expandedPage: string | null = null;

togglePageExpansion(pageUrl: string): void {
  this.expandedPage = this.expandedPage === pageUrl ? null : pageUrl;
}


getQueryStatus(query: any): string {
  // Implement your logic to determine status text
  if (query.clicksChange?.includes('+')) return 'Growing';
  if (query.clicksChange?.includes('-')) return 'Declining';
  return 'Stable';
}

getQuerySeverity(query: any): string {
  // Implement your logic to determine severity
  if (query.clicksChange?.includes('+')) return 'success';
  if (query.clicksChange?.includes('-')) return 'danger';
  return 'info';
}

calculatePageTotal(page: any, metric: string): number {
  // Implement your total calculation logic if needed
  return page.queries.reduce((sum, query) => sum + query[metric], 0);
}

}
