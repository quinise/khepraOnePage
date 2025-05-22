import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EventFilterService } from 'src/app/services/event-filter.service';
@Component({
  selector: 'app-event-filter',
  templateUrl: './event-filter.component.html',
  imports: [
    AsyncPipe,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatSlideToggleModule,
    FormsModule,],
})
export class EventFilterComponent {
  @Output() filtersChanged = new EventEmitter<void>();

  private filterService = inject(EventFilterService);
  
  selectedRange = this.filterService.daysRange;

  constructor(
    // private filterService: EventFilterService
  ) {
    // this.filterService.setRange(this.selectedRange); // initialize with default
  }

  get daysRange() {
    return this.filterService.daysRange;
  }

  get includePast() {
    return this.filterService.includePast$;
  }

  handleIncludePastChangeWrapper(value: boolean) {
    this.filterService.setIncludePast(value);
    this.filterService.applyFilters(); // 🔥 Ensure filters update
    this.filtersChanged.emit();
  }

  onRangeSelected(): void {
    this.filterService.setRange(this.selectedRange);
  }

  onRangeChangeWrapper(event: MatSelectChange) {
    const newRange = event.value;
    this.selectedRange = newRange;
    this.filterService.setRange(newRange);
    this.filterService.applyFilters(); // 🔥 Ensure filters update
    this.filtersChanged.emit();
  }
}
