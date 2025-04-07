import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-header',
  imports: [FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  title = 'Alliance Shipping SEO Analytics';
  dateRange = 'today';
  categories = ['All', 'China Blog', 'Dubai Blog', 'India Blog', 'Pakistan Blog'];
  selectedCategory = 'All';

  @Output() dateRangeChanged = new EventEmitter<string>();

  onDateRangeChange(): void {
    this.dateRangeChanged.emit(this.dateRange);
  }

  onCategoryChange(): void {
    // Implement category filtering if needed
  }

}

