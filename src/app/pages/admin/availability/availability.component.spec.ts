import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityModuleComponent } from './availabilityModule.component';

describe('AvailabilityComponent', () => {
  let component: AvailabilityModuleComponent;
  let fixture: ComponentFixture<AvailabilityModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailabilityModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
