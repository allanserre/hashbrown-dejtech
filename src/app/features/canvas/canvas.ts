import { Component, ChangeDetectionStrategy, inject, computed, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { CanvasService, CanvasBlock } from './canvas.service';
import { resolveComponent } from './canvas-registry';
import { IconComponent } from '../../shared/components/icon/icon';
import { CanvasChatComponent } from './canvas-chat';

@Component({
  selector: 'app-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, IconComponent, CanvasChatComponent],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
})
export class CanvasComponent {
  protected readonly canvas  = inject(CanvasService);
  protected readonly isEmpty = computed(() => this.canvas.blocks().length === 0);

  /** Résout le Type<> Angular depuis le registre — null si type inconnu. */
  protected getComponent(block: CanvasBlock): Type<unknown> | null {
    return resolveComponent(block.type);
  }

  /** Retourne les props du bloc telles quelles — NgComponentOutlet les bind sur les inputs. */
  protected getInputs(block: CanvasBlock): Record<string, unknown> {
    return block.props;
  }

  protected removeBlock(id: string): void {
    this.canvas.remove(id);
  }

  protected clearAll(): void {
    this.canvas.clear();
  }
}
