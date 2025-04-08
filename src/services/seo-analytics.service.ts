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

//   formatChange(current: number, previous: number, isPercentage = false, reverse = false): string {
//     const diff = current - previous;
//     let arrow = '→';
//     let colorClass = 'text-gray-500';

//     if (reverse) {
//       if (diff < 0) {
//         arrow = '↑';
//         colorClass = 'text-green-600'; // improved (lower value is better)
//       } else if (diff > 0) {
//         arrow = '↓';
//         colorClass = 'text-red-600'; // worse
//       }
//     } else {
//       if (diff > 0) {
//         arrow = '↑';
//         colorClass = 'text-green-600'; // improved
//       } else if (diff < 0) {
//         arrow = '↓';
//         colorClass = 'text-red-600'; // worse
//       }
//     }

//     const currentFormatted = isPercentage
//       ? parseFloat(current.toString()).toFixed(1) + '%'
//       : current.toLocaleString();

//     const prevFormatted = isPercentage
//       ? parseFloat(previous.toString()).toFixed(1) + '%'
//       : previous.toLocaleString();

//     return `
// <span class="${colorClass}">${arrow}</span> 
// ${currentFormatted} 
// <span class="text-xs text-gray-500">( prev: ${prevFormatted})</span>
// `;
//   }

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


  calculateChange(current, previous, isLowerBetter = false) {
    // Handle edge cases
    if ((previous === 0 && current === 0) || previous === null || current === null) return 0;
    if (previous === 0 || current === 0) return 100;
  
    // Standard ratio logic
    let ratio = current / previous;
  
    // Calculate symmetrical percent change (always 100% when doubled or halved)
    let change = Math.abs(100 * (Math.max(ratio, 1 / ratio) - 1));
  
    // Determine direction (positive or negative)
    const isIncrease = ratio > 1;
  
    // Flip logic if lower is better (e.g. position)
    if ((isIncrease && !isLowerBetter) || (!isIncrease && isLowerBetter)) {
      return parseFloat(change.toFixed(2));
    } else {
      return parseFloat((-change).toFixed(2));
    }
  }
  
  
  
  formatChange(change) {
    if (change === null) return null;
    return change > 0 ? `+${change}%` : `${change}%`;
  }
  
  transformAnalyticsData(currentData, previousData) {
    // 1. Organize previous data
    const previousDataMap = {};
    
    previousData.forEach(prevItem => {
      if (!previousDataMap[prevItem.page]) {
        previousDataMap[prevItem.page] = {};
      }
      
      previousDataMap[prevItem.page][prevItem.query] = {
        page: prevItem.page,
        query: prevItem.query,
        clicks: prevItem.clicks,
        impressions: prevItem.impressions,
        ctr: parseFloat((prevItem.ctr * 100).toFixed(2)),
        position: parseFloat(prevItem.position.toFixed(2))
      };
    });
  
    // 2. Process current data
    const result = [];
    const currentPages = {};
    
    currentData.forEach(currentItem => {
      const pageUrl = currentItem.page;
      
      if (!currentPages[pageUrl]) {
        currentPages[pageUrl] = {
          queries: [],
          totalClicks: 0,
          totalImpressions: 0,
          positionSum: 0,
          positionCount: 0
        };
      }
      
      // Update page totals
      currentPages[pageUrl].totalClicks += currentItem.clicks;
      currentPages[pageUrl].totalImpressions += currentItem.impressions;
      currentPages[pageUrl].positionSum += currentItem.position;
      currentPages[pageUrl].positionCount++;
      
      // Find matching previous query data
      const prevQueryData = previousDataMap[pageUrl]?.[currentItem.query] || null;
      
      // Calculate changes for query
      const clicksChange = this.calculateChange(currentItem.clicks, prevQueryData?.clicks);
      const impressionsChange = this.calculateChange(currentItem.impressions, prevQueryData?.impressions);
      const ctrChange = this.calculateChange(
        parseFloat((currentItem.ctr * 100).toFixed(2)), 
        prevQueryData?.ctr
      );
      const positionChange = this.calculateChange(
        parseFloat(currentItem.position.toFixed(2)), 
        prevQueryData?.position,
        true // Position is lower=better
      );
      
      // Create query entry with changes
      const queryEntry = {
        query: currentItem.query,
        page: pageUrl,
        clicks: currentItem.clicks,
        clicksChange: this.formatChange(clicksChange),
        impressions: currentItem.impressions,
        impressionsChange: this.formatChange(impressionsChange),
        ctr: parseFloat((currentItem.ctr * 100).toFixed(2)),
        ctrChange: this.formatChange(ctrChange),
        position: parseFloat(currentItem.position.toFixed(2)),
        positionChange: this.formatChange(positionChange),
        previous: prevQueryData
      };
      
      currentPages[pageUrl].queries.push(queryEntry);
    });
  
    // 3. Calculate page-level previous data
    const previousPageStats = {};
    
    previousData.forEach(prevItem => {
      if (!previousPageStats[prevItem.page]) {
        previousPageStats[prevItem.page] = {
          clicks: 0,
          impressions: 0,
          positionSum: 0,
          positionCount: 0
        };
      }
      
      previousPageStats[prevItem.page].clicks += prevItem.clicks;
      previousPageStats[prevItem.page].impressions += prevItem.impressions;
      previousPageStats[prevItem.page].positionSum += prevItem.position;
      previousPageStats[prevItem.page].positionCount++;
    });
  
    // 4. Build final result with changes
    for (const pageUrl in currentPages) {
      const pageData = currentPages[pageUrl];
      const prevPageData = previousPageStats[pageUrl] || {
        clicks: 0,
        impressions: 0,
        positionSum: 0,
        positionCount: 0
      };
      
      // Calculate current averages
      const currentAvgPosition = pageData.positionCount > 0 
        ? pageData.positionSum / pageData.positionCount 
        : 0;
      
      // Calculate previous averages
      const prevAvgPosition = prevPageData.positionCount > 0
        ? prevPageData.positionSum / prevPageData.positionCount
        : 0;
      
      // Calculate page-level changes
      const clicksChange = this.calculateChange(pageData.totalClicks, prevPageData.clicks);
      const impressionsChange = this.calculateChange(pageData.totalImpressions, prevPageData.impressions);
      const positionChange = this.calculateChange(
        parseFloat(currentAvgPosition.toFixed(2)), 
        parseFloat(prevAvgPosition.toFixed(2)),
        true // Position is lower=better
      );
      
      // Create page entry with changes
      result.push({
        page: pageUrl,
        impressions: pageData.totalImpressions,
        impressionsChange: this.formatChange(impressionsChange),
        clicks: pageData.totalClicks,
        clicksChange: this.formatChange(clicksChange),
        position: parseFloat(currentAvgPosition.toFixed(2)),
        positionChange: this.formatChange(positionChange),
        previous: {
          page: pageUrl,
          impressions: prevPageData.impressions,
          clicks: prevPageData.clicks,
          position: parseFloat(prevAvgPosition.toFixed(2)),
          queries: previousDataMap[pageUrl] 
            ? Object.values(previousDataMap[pageUrl]) 
            : []
        },
        queries: pageData.queries
      });
    }
  
    return result;
  }
  
}