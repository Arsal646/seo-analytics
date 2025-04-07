import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateRangeData, PageData, QueryData, Totals } from '../models/seo-model';

@Injectable({
  providedIn: 'root'
})
export class SeoAnalyticsService {
  private readonly TOP_PERFORMERS_COUNT = 3;

  constructor(private http: HttpClient) { }

  getDateRange(range: string): DateRangeData {
    const today = new Date();
    const offsetDate = new Date();
    offsetDate.setDate(today.getDate() - 3); // 3 days ago (GSC delay)
    offsetDate.setHours(0, 0, 0, 0);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (range) {
      case 'today':
        const todayDate = new Date(offsetDate);
        const yesterday = new Date(offsetDate);
        yesterday.setDate(offsetDate.getDate() - 1);
        return {
          current: {
            start: formatDate(todayDate),
            end: formatDate(todayDate),
          },
          previous: {
            start: formatDate(yesterday),
            end: formatDate(yesterday),
          },
        };

      case 'lastWeek':
        const lastWeekEnd = new Date(offsetDate);
        const lastWeekStart = new Date(offsetDate);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);

        const secondLastWeekEnd = new Date(lastWeekStart);
        secondLastWeekEnd.setDate(lastWeekStart.getDate() - 1);
        const secondLastWeekStart = new Date(secondLastWeekEnd);
        secondLastWeekStart.setDate(secondLastWeekEnd.getDate() - 6);

        return {
          current: {
            start: formatDate(lastWeekStart),
            end: formatDate(lastWeekEnd),
          },
          previous: {
            start: formatDate(secondLastWeekStart),
            end: formatDate(secondLastWeekEnd),
          },
        };

      case 'lastMonth':
        const lastMonthEnd = new Date(offsetDate);
        const lastMonthStart = new Date(lastMonthEnd);
        lastMonthStart.setMonth(lastMonthEnd.getMonth() - 1);

        const secondLastMonthEnd = new Date(lastMonthStart);
        secondLastMonthEnd.setDate(0); // last day of previous month
        const secondLastMonthStart = new Date(secondLastMonthEnd);
        secondLastMonthStart.setMonth(secondLastMonthEnd.getMonth() - 1);
        secondLastMonthStart.setDate(1); // first day of 2nd last month

        return {
          current: {
            start: formatDate(lastMonthStart),
            end: formatDate(lastMonthEnd),
          },
          previous: {
            start: formatDate(secondLastMonthStart),
            end: formatDate(secondLastMonthEnd),
          },
        };

      default:
        return {
          current: {
            start: formatDate(offsetDate),
            end: formatDate(offsetDate),
          },
          previous: {
            start: formatDate(offsetDate),
            end: formatDate(offsetDate),
          },
        };
    }
  }

  fetchData(start: string, end: string): Observable<any> {
    return this.http.get<QueryData[]>(`http://localhost/test/api.php?start=${start}&end=${end}`);
  }

  calculateTotals(current: any[], prev: any[]): { current: Totals, previous: Totals } {
    const getTotals = (data: QueryData[]) => {
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalPosition = 0;
      let totalCtr = 0;

      data.forEach(item => {
        totalImpressions += item.impressions;
        totalClicks += item.clicks;
        totalPosition += item.position;
        totalCtr += item.ctr;
      });

      const length = data.length || 1; // avoid division by 0

      return {
        impressions: totalImpressions,
        clicks: totalClicks,
        avgPosition: (totalPosition / length).toFixed(1),
        avgCtr: ((totalCtr / length)).toFixed(1)
      };
    };

    return {
      current: getTotals(current),
      previous: getTotals(prev)
    };
  }

  getTopPages(data: QueryData[]): PageData[] {
    const pageMap: { [key: string]: PageData } = {};
    let maxClicks = 0;
    let maxImpressions = 0;

    // First pass to find max values for relative coloring
    data.forEach(item => {
      if (item.clicks > maxClicks) maxClicks = item.clicks;
      if (item.impressions > maxImpressions) maxImpressions = item.impressions;
    });

    // Group by page and calculate totals
    data.forEach(item => {
      if (!pageMap[item.page]) {
        pageMap[item.page] = {
          page: item.page,
          impressions: 0,
          clicks: 0,
          queries: [],
          maxClicks: maxClicks,
          maxImpressions: maxImpressions
        };
      }
      pageMap[item.page].impressions += item.impressions;
      pageMap[item.page].clicks += item.clicks;
      pageMap[item.page].queries.push(item);
    });

    // Convert to array and sort by clicks (descending)
    const pages = Object.values(pageMap);
    pages.sort((a, b) => b.clicks - a.clicks);

    // Mark top performers
    pages.forEach((page, index) => {
      page.isTopPerformer = index < this.TOP_PERFORMERS_COUNT;

      // Sort queries for this page by clicks
      page.queries.sort((a, b) => b.clicks - a.clicks);

      // Mark top queries for this page
      page.queries.forEach((query, qIndex) => {
        query.isTopQuery = qIndex < this.TOP_PERFORMERS_COUNT;
        query.positionColor = this.getPositionColor(query.position);
        query.ctrColor = this.getCtrColor(query.ctr * 100);
        query.clicksColor = this.getClicksColor(query.clicks, page.maxClicks!);
        query.impressionsColor = this.getImpressionsColor(query.impressions, page.maxImpressions!);
      });
    });

    return pages;
  }

  getPositionColor(position: number): string {
    if (position <= 3) return 'text-green-600';
    if (position <= 10) return 'text-lime-500';
    if (position <= 20) return 'text-yellow-500';
    return 'text-red-500';
  }

  getCtrColor(ctr: number): string {
    if (ctr > 10) return 'text-green-600';
    if (ctr > 5) return 'text-lime-500';
    if (ctr > 2) return 'text-yellow-500';
    return 'text-red-500';
  }

  getClicksColor(clicks: number, maxClicks: number): string {
    const percentage = (clicks / maxClicks) * 100;
    if (percentage > 20) return 'text-purple-600';
    if (percentage > 10) return 'text-purple-500';
    if (percentage > 5) return 'text-purple-400';
    return 'text-purple-300';
  }

  getImpressionsColor(impressions: number, maxImpressions: number): string {
    const percentage = (impressions / maxImpressions) * 100;
    if (percentage > 20) return 'text-blue-600';
    if (percentage > 10) return 'text-blue-500';
    if (percentage > 5) return 'text-blue-400';
    return 'text-blue-300';
  }

  formatUrl(url: string): string {
    const formatted = url.replace('https://theallianceshipping.com', '').replace(/^\/|\/$/g, '');
    return formatted || '/ (Homepage)';
  }

  formatChange(current: number, previous: number, isPercentage = false, reverse = false): string {
    const diff = current - previous;
    let arrow = '→';
    let colorClass = 'text-gray-500';

    if (reverse) {
      if (diff < 0) {
        arrow = '↑';
        colorClass = 'text-green-600'; // improved (lower value is better)
      } else if (diff > 0) {
        arrow = '↓';
        colorClass = 'text-red-600'; // worse
      }
    } else {
      if (diff > 0) {
        arrow = '↑';
        colorClass = 'text-green-600'; // improved
      } else if (diff < 0) {
        arrow = '↓';
        colorClass = 'text-red-600'; // worse
      }
    }

    const currentFormatted = isPercentage
      ? parseFloat(current.toString()).toFixed(1) + '%'
      : current.toLocaleString();

    const prevFormatted = isPercentage
      ? parseFloat(previous.toString()).toFixed(1) + '%'
      : previous.toLocaleString();

    return `
<span class="${colorClass}">${arrow}</span> 
${currentFormatted} 
<span class="text-xs text-gray-500">( prev: ${prevFormatted})</span>
`;
  }

  formatTrend(current: number, previous: number, reverse = false): string {
    const diff = current - previous;
    const arrow = reverse
      ? (diff < 0 ? '↑' : diff > 0 ? '↓' : '→')
      : (diff > 0 ? '↑' : diff < 0 ? '↓' : '→');
    const colorClass = reverse
      ? (diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-600' : 'text-gray-500')
      : (diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500');
    return `<span class="${colorClass}">${arrow}</span> <span class="text-xs text-gray-500">(${previous.toLocaleString()})</span>`;
  }
}