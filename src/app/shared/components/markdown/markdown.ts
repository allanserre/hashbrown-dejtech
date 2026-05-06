import { Component, signal, input } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-markdown',
  imports: [MarkdownModule],
  template: `<markdown [data]="content()"></markdown>`,
})
export class Markdown {
  readonly content = input.required<string>();
}
