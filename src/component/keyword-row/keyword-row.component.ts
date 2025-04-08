import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-keyword-row',
  imports: [CommonModule],
  templateUrl: './keyword-row.component.html',
  styleUrl: './keyword-row.component.scss'
})
export class KeywordRowComponent {
  @Input() queries: any[] = [];
}