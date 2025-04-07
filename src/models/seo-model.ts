export interface QueryData {
    query: string;
    impressions: number;
    clicks: number;
    position: number;
    ctr: number;
    page: string;
    isTopQuery?: boolean;
    positionColor?: string;
    ctrColor?: string;
    clicksColor?: string;
    impressionsColor?: string;
  }
  
  export interface PageData {
    page: string;
    impressions: number;
    clicks: number;
    queries: QueryData[];
    isTopPerformer?: boolean;
    maxClicks?: number;
    maxImpressions?: number;
  }
  
  export interface DateRange {
    start: string;
    end: string;
  }
  
  export interface Totals {
    impressions: number;
    clicks: number;
    avgPosition: string;
    avgCtr: string;
  }
  
  export interface DateRangeData {
    current: DateRange;
    previous: DateRange;
  }