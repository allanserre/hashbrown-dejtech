import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { chatResource, UiChatMessage } from '@hashbrownai/angular';
import { IconComponent } from '../../shared/components/icon/icon';
import { CanvasService } from './canvas.service';
import { DataStoreService } from '../data/data-store.service';
import {
  createAddLineChartTool,
  createAddStatCardTool,
  createClearCanvasTool,
  createGetDataTool,
} from './canvas-tools';

@Component({
  selector: 'app-canvas-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './canvas-chat.html',
  styleUrl:    './canvas-chat.css',
})
export class CanvasChatComponent {
  private readonly canvas    = inject(CanvasService);
  private readonly dataStore = inject(DataStoreService);

  private readonly chat = chatResource({
    model:      'openrouter/free',
    debugName:  'canvas-assistant',
    system: `Tu es un assistant IA dédié au canvas DejTech.
Ton unique rôle est d'ajouter des composants visuels sur le canvas :
- Cartes de statistiques (stat cards) avec des KPIs calculés depuis les données
- Graphiques linéaires représentant des séries de données

Workflow obligatoire :
1. Appelle getData pour récupérer les données brutes
2. Calcule les valeurs demandées (sommes, moyennes, comptages…)
3. Appelle addStatCard ou addLineChart avec les valeurs calculées

Réponds toujours en français, de façon très concise.
Ne décris pas ce que tu vas faire — fais-le directement.`,

    tools: [
      createGetDataTool(this.dataStore),
      createAddStatCardTool(this.canvas),
      createAddLineChartTool(this.canvas),
      createClearCanvasTool(this.canvas),
    ],
  });

  protected readonly messagesEl = viewChild<ElementRef<HTMLElement>>('messagesEl');
  protected readonly inputText  = signal('');

  protected readonly messages  = computed(() => (this.chat.value() ?? []) as UiChatMessage[]);
  protected readonly isLoading = this.chat.isLoading;

  protected readonly isTyping = computed(() => {
    const msgs = this.messages();
    if (!this.isLoading()) return false;
    return msgs.length === 0 || msgs[msgs.length - 1].role === 'user';
  });

  protected readonly suggestions: string[] = [
    'Ajoute des stat cards avec les KPIs du stock',
    'Graphique des prix de tous les produits',
    'Valeur totale de l\'inventaire en card',
    'Efface le canvas',
  ];

  constructor() {
    afterRenderEffect(() => {
      const el = this.messagesEl()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  protected sendMessage(): void {
    const text = this.inputText().trim();
    if (!text || this.isLoading()) return;
    this.chat.sendMessage({ role: 'user', content: text });
    this.inputText.set('');
  }

  protected sendSuggestion(text: string): void {
    if (this.isLoading()) return;
    this.chat.sendMessage({ role: 'user', content: text });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /** Texte brut d'un message (user ou assistant). */
  protected textContent(msg: UiChatMessage): string {
    const c = (msg as { content: unknown }).content;
    if (typeof c === 'string') return c;
    if (Array.isArray(c)) {
      return c
        .filter((p: { type: string }) => p.type === 'text')
        .map((p: { text: string }) => p.text)
        .join('');
    }
    return '';
  }

  /** Noms des tools appelés dans un message assistant. */
  protected toolCallNames(msg: UiChatMessage): string[] {
    const calls = (msg as { toolCalls?: { name: string }[] }).toolCalls ?? [];
    return calls.map(c => c.name);
  }
}

