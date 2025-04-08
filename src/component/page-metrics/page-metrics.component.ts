import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-metrics',
  imports: [CommonModule],
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

}
