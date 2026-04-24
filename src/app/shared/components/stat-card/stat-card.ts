import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <article class="card" [attr.aria-label]="label() + ': ' + value()">
      <div class="icon-wrap" [class]="'icon-wrap--' + color()">
        <app-icon [name]="icon()" />
      </div>
      <div class="body">
        <span class="value">{{ value() }}</span>
        <span class="lbl">{{ label() }}</span>
        <span
          class="change"
          [class.change--up]="positive()"
          [class.change--down]="!positive()"
          [attr.aria-label]="change() + (positive() ? ' en hausse' : ' en baisse') + ' vs mois précédent'"
        >
          <app-icon [name]="positive() ? 'trending-up' : 'trending-down'" />
          <span>{{ change() }} vs mois préc.</span>
        </span>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; }
    .card {
      background: var(--c-surface);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      box-shadow: var(--shadow);
      border: 1px solid var(--c-border);
    }
    .icon-wrap {
      width: 48px; height: 48px;
      border-radius: var(--radius);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .icon-wrap--primary { background: var(--c-primary-light); color: var(--c-primary); }
    .icon-wrap--success { background: var(--c-success-bg); color: var(--c-success-fg); }
    .icon-wrap--warning { background: var(--c-warning-bg); color: var(--c-warning-fg); }
    .icon-wrap--info    { background: var(--c-info-bg);    color: var(--c-info-fg); }
    .icon-wrap--danger  { background: var(--c-danger-bg);  color: var(--c-danger-fg); }
    .body { display: flex; flex-direction: column; gap: .2rem; min-width: 0; }
    .value { font-size: 1.625rem; font-weight: 700; color: var(--c-text); line-height: 1; }
    .lbl { font-size: .875rem; color: var(--c-text-muted); margin-top: .1rem; }
    .change {
      display: flex; align-items: center; gap: .25rem;
      font-size: .75rem; font-weight: 600; margin-top: .35rem;
    }
    .change--up   { color: var(--c-success-fg); }
    .change--down { color: var(--c-danger-fg); }
  `],
})
export class StatCardComponent {
  label    = input.required<string>();
  value    = input.required<string>();
  change   = input.required<string>();
  positive = input<boolean>(true);
  icon     = input.required<string>();
  color    = input<string>('primary');
}

