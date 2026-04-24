import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export interface BarData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-wrap" role="img" [attr.aria-label]="title()">
      <svg
        [attr.viewBox]="'0 0 ' + W + ' ' + H"
        class="chart"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
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

        <!-- Bars -->
        @for (bar of bars(); track bar.label) {
          <rect
            [attr.x]="bar.x" [attr.y]="bar.y"
            [attr.width]="barWidth()" [attr.height]="bar.height"
            rx="5" class="bar"
          />
          <text
            [attr.x]="bar.x + barWidth() / 2"
            [attr.y]="H - 8"
            class="axis-label" text-anchor="middle"
          >{{ bar.label }}</text>
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
    .bar { fill: var(--c-primary); transition: opacity .15s; }
    .bar:hover { opacity: .75; }
  `],
})
export class BarChartComponent {
  data = input<BarData[]>([]);
  title = input<string>('Graphique en barres');
  color = input<string>('var(--c-primary)');

  readonly W = 560;
  readonly H = 220;
  readonly PAD_X = 48;
  readonly PAD_Y = 16;
  readonly LABEL_H = 28;

  private chartH = computed(() => this.H - this.PAD_Y - this.LABEL_H);
  private maxVal = computed(() => Math.max(...this.data().map(d => d.value), 1));

  barWidth = computed(() => {
    const n = this.data().length;
    if (n === 0) return 0;
    return ((this.W - this.PAD_X * 2) / n) * 0.55;
  });

  bars = computed(() => {
    const data = this.data();
    const max = this.maxVal();
    const n = data.length;
    const slotW = (this.W - this.PAD_X * 2) / n;
    const bw = this.barWidth();
    const cH = this.chartH();
    return data.map((d, i) => ({
      x: this.PAD_X + i * slotW + (slotW - bw) / 2,
      y: this.PAD_Y + cH * (1 - d.value / max),
      height: cH * (d.value / max),
      label: d.label,
    }));
  });

  gridLines = computed(() => {
    const max = this.maxVal();
    const cH = this.chartH();
    return [0.25, 0.5, 0.75, 1].map(f => ({
      y: this.PAD_Y + cH * (1 - f),
      label: max * f >= 1000 ? `${Math.round((max * f) / 1000)}k` : `${Math.round(max * f)}`,
    }));
  });
}

