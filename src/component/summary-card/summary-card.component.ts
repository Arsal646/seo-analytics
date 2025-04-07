import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Totals } from '../../models/seo-model';

@Component({
  selector: 'app-summary-card',
  imports: [CommonModule],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardsComponent {
parseFloat(arg0: string): number {
  return parseFloat(arg0);
}
  @Input() totals: { current: Totals, previous: Totals } | null = null;

  getChange(current: number, previous: number, reverse = false): { arrow: string, color: string } {
    const diff = current - previous;
    
    if (reverse) {
      return {
        arrow: diff < 0 ? '▲' : diff > 0 ? '▼' : '=',
        color: diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-600' : 'text-gray-500'
      };
    }
    
    return {
      arrow: diff > 0 ? '▲' : diff < 0 ? '▼' : '=',
      color: diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
    };
  }

  formatValue(value: number | string, isPercentage = false): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return isPercentage 
      ? `${numValue.toFixed(1)}%` 
      : numValue.toLocaleString();
  }

  getIconColor(metric: string): string {
    switch(metric) {
      case 'impressions': return 'text-blue-500';
      case 'clicks': return 'text-purple-500';
      case 'position': return 'text-yellow-500';
      case 'ctr': return 'text-green-500';
      default: return 'text-gray-500';
    }
  }

}