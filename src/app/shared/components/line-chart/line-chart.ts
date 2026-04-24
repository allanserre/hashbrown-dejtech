import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export interface LineData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-wrap" role="img" [attr.aria-label]="title()">
      <svg
        [attr.viewBox]="'0 0 ' + W + ' ' + H"
        class="chart"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="line-chart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <!-- Grid lines -->
        @for (gl of gridLines(); track gl.label) {
          <line
            [attr.x1]="PAD_X" [attr.y1]="gl.y"
            [attr.x2]="W - 12" [attr.y2]="gl.y"
            class="grid-line"
          />
          <text [attr.x]="PAD_X - 6" [attr.y]="gl.y + 4" class="axis-label" text-anchor="end">
            {{ gl.label }}
          </text>
        }

        <!-- Area fill -->
        @if (areaPath()) {
          <path [attr.d]="areaPath()" fill="url(#line-chart-grad)" class="area"/>
        }

        <!-- Line -->
        @if (linePath()) {
          <path [attr.d]="linePath()" fill="none" class="line"/>
        }

        <!-- Dots + labels -->
        @for (dot of coords(); track dot.label) {
          <circle [attr.cx]="dot.x" [attr.cy]="dot.y" r="4" class="dot"/>
          <text [attr.x]="dot.x" [attr.y]="H - 8" class="axis-label" text-anchor="middle">
            {{ dot.label }}
          </text>
        }

        <!-- X axis -->
        <line
          [attr.x1]="PAD_X" [attr.y1]="H - LABEL_H"
          [attr.x2]="W - 12" [attr.y2]="H - LABEL_H"
          class="axis-line"
        />
      </svg>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .chart-wrap { width: 100%; }
    .chart { width: 100%; height: auto; display: block; }
    .grid-line { stroke: var(--c-border); stroke-width: 1; stroke-dasharray: 4 3; }
    .axis-line { stroke: var(--c-border); stroke-width: 1; }
    .axis-label { fill: var(--c-text-muted); font-size: 11px; font-family: inherit; }
    .area { opacity: 1; }
    .line { stroke: var(--c-primary); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .dot { fill: var(--c-primary); stroke: white; stroke-width: 2; }
  `],
})
export class LineChartComponent {
  data = input<LineData[]>([]);
  title = input<string>('Graphique linéaire');

  readonly W = 560;
  readonly H = 220;
  readonly PAD_X = 48;
  readonly PAD_Y = 16;
  readonly LABEL_H = 28;

  private chartH = computed(() => this.H - this.PAD_Y - this.LABEL_H);
  private chartW = computed(() => this.W - this.PAD_X * 2);
  private maxVal = computed(() => Math.max(...this.data().map(d => d.value), 1));

  coords = computed(() => {
    const data = this.data();
    const max = this.maxVal();
    const n = data.length;
    if (n < 2) return [];
    const cW = this.chartW();
    const cH = this.chartH();
    return data.map((d, i) => ({
      x: parseFloat((this.PAD_X + (i / (n - 1)) * cW).toFixed(2)),
      y: parseFloat((this.PAD_Y + cH * (1 - d.value / max)).toFixed(2)),
      label: d.label,
    }));
  });

  linePath = computed(() => {
    const c = this.coords();
    if (c.length === 0) return '';
    return c.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  });

  areaPath = computed(() => {
    const c = this.coords();
    if (c.length === 0) return '';
    const bottom = this.PAD_Y + this.chartH();
    const linePart = c.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    return `${linePart} L ${c[c.length - 1].x},${bottom} L ${c[0].x},${bottom} Z`;
  });

  gridLines = computed(() => {
    const max = this.maxVal();
    const cH = this.chartH();
    return [0.25, 0.5, 0.75, 1].map(f => ({
      y: parseFloat((this.PAD_Y + cH * (1 - f)).toFixed(2)),
      label: max * f >= 1000 ? `${Math.round((max * f) / 1000)}k` : `${Math.round(max * f)}`,
    }));
  });
}

