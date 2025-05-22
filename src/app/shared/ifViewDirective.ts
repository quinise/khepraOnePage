// app-if-view.directive.ts
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appIfView]',
})
export class IfViewDirective implements OnChanges {
  @Input() appIfView!: any; // any type to track changes

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('appIfView' in changes) {
      this.viewContainer.clear();
      if (this.appIfView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    }
  }
}