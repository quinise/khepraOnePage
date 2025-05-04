import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EventFilterService } from 'src/app/services/event-filter.service';

@Component({
  selector: 'app-event-filter',
  templateUrl: './event-filter.component.html',
  imports: [MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatSlideToggleModule,
    FormsModule,],
})
export class EventFilterComponent {
  @Output() filtersChanged = new EventEmitter<void>();

  private filterService = inject(EventFilterService);

  get daysRange() {
    return this.filterService.daysRange;
  }

  get includePast() {
    return this.filterService.includePast;
  }

  handleIncludePastChangeWrapper(value: boolean) {
    this.filterService.handleIncludePastChange(value);
    this.filtersChanged.emit();
  }

  onRangeChangeWrapper(event: MatSelectChange) {
    this.filterService.onRangeChange(event);
    this.filtersChanged.emit();
  }
}
