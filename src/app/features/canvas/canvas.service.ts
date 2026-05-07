import { Injectable, signal } from '@angular/core';

// ── Type générique ─────────────────────────────────────────────────────────────
// Le service ne connaît plus StatCardBlock / LineChartBlock.
// La forme concrète des props est la responsabilité du registre.

export interface CanvasBlock {
  id:    string;
  type:  string;
  props: Record<string, unknown>;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CanvasService {
  private _idCounter = 0;

  readonly blocks = signal<CanvasBlock[]>([]);

  generateId(): string {
    return `canvas-${++this._idCounter}`;
  }

  add(block: CanvasBlock): void {
    this.blocks.update(bs => [...bs, block]);
    console.log(`Block added: ${block.id} (type: ${block.type})`);
  }

  remove(id: string): void {
    this.blocks.update(bs => bs.filter(b => b.id !== id));
  }

  clear(): void {
    this.blocks.set([]);
  }
}
