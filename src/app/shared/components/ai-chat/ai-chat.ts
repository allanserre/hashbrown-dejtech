import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  viewChild,
  ElementRef,
  afterRenderEffect,
  inject,
} from '@angular/core';
import { chatResource, createTool, MagicText } from '@hashbrownai/angular';
import { IconComponent } from '../icon/icon';
import { DataStoreService } from '../../../features/data/data-store.service';
import { filterData, sortData, DataFilterService } from '../../../features/data/data-filter.service';
import {
  DataCategory,
  DataRecord,
  SortDir,
  SortField,
} from '../../../features/data/data.models';
import { Router } from '@angular/router';
import { s } from '@hashbrownai/core';
import { RouteNames } from '../../../app.routes';
import {
  filterParamsSchema,
  sortedDataParamsSchema,
} from '../../../hashbrown-schema/hashbrown-data-schema';

type ChatMsg =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { role: 'error'; content?: string };

interface FilterAppliedResult {
  search?:     string;
  category?:   string;
  status?:     string;
  sortField?:  string;
  sortDir?:    string;
  resultCount: number;
}

@Component({
  selector: 'app-ai-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagicText, IconComponent],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css',
})
export class AiChatComponent {
  // ① Injecter les dépendances comme champs — toujours dans le contexte d'injection
  private readonly router      = inject(Router);
  private readonly dataStore   = inject(DataStoreService);
  private readonly dataFilter  = inject(DataFilterService);

  private readonly chat = chatResource({
    model: 'openrouter/free',
    debugName: 'dashboard-assistant',
    system: `Tu es un assistant IA intégré au tableau de bord DejTech.
Tu aides les utilisateurs à :
- Comprendre et analyser les données du dashboard
- Naviguer dans l'application (Dashboard, Utilisateurs, Messagerie, Données)
- Obtenir des insights sur les indicateurs clés de performance (KPI)
- Répondre à des questions sur les statistiques affichées

Réponds toujours en français, de façon concise et utile.
Si tu ne sais pas, dis-le clairement.`,

    tools: [
      createTool({
        name: 'getData',
        description: 'Récupère tous les enregistrements produits sans aucun filtre',
        handler: async () => this.dataStore.getAll(),
      }),
      createTool({
        name: 'getFilteredData',
        description:
          'Applique des filtres (texte, catégorie, statut) sur la page Données et navigue vers celle-ci ' +
          'pour un rendu visuel immédiat. Utilise "all" pour ignorer un critère.',
        schema: filterParamsSchema,
        handler: async (params: {
          search:   string;
          category: DataCategory | 'all';
          status:   string;
        }): Promise<{ applied: FilterAppliedResult }> => {
          this.dataFilter.applyFilters(params);
          await this.router.navigate(['/data']);
          const count = filterData(this.dataStore.getAll(), params).length;
          return { applied: { ...params, resultCount: count } };
        },
      }),
      createTool({
        name: 'getSortedAndFilteredData',
        description:
          'Applique filtres ET tri sur la page Données et navigue vers celle-ci. ' +
          'Combine filtrage (search, category, status) et tri (sortField, sortDir).',
        schema: sortedDataParamsSchema,
        handler: async (params: {
          search:    string;
          category:  DataCategory | 'all';
          status:    string;
          sortField: SortField;
          sortDir:   SortDir;
        }): Promise<{ applied: FilterAppliedResult }> => {
          this.dataFilter.applyFilters(params);
          await this.router.navigate(['/data']);
          const count = sortData(filterData(this.dataStore.getAll(), params), params.sortField, params.sortDir).length;
          return { applied: { ...params, resultCount: count } };
        },
      }),
      createTool({
        name: 'resetDataFilters',
        description: 'Réinitialise tous les filtres de la page Données et navigue vers celle-ci.',
        handler: async () => {
          this.dataFilter.resetFilters();
          await this.router.navigate(['/data']);
          return { reset: true, totalRecords: this.dataStore.getAll().length };
        },
      }),
      createTool({
        name: 'navigate',
        description: "Naviguer vers une page spécifique de l'application",
        schema: s.object('paramètres de navigation', {
          route: s.enumeration(
            'la page de destination',
            Object.values(RouteNames) as [string, ...string[]],
          ),
        }),
        handler: async ({ route }: { route: string }) => {
          console.log('[navigate tool] route =', route);
          return this.router.navigate(['/' + route]);
        },
      }),
    ],
  });

  readonly messagesEl = viewChild<ElementRef<HTMLElement>>('messagesEl');

  inputText = signal('');
  messages = computed(() => (this.chat.value() ?? []) as ChatMsg[]);
  isSending = this.chat.isSending;
  isReceiving = this.chat.isReceiving;
  isLoading = this.chat.isLoading;
  sendingError = this.chat.sendingError;

  readonly suggestions: string[] = [
    'Explique-moi les KPIs du dashboard',
    'Comment naviguer vers les données ?',
    'Analyse les revenus de ce mois',
    'Quels utilisateurs sont inactifs ?',
  ];

  constructor() {
    // Auto-scroll vers le dernier message après chaque rendu
    afterRenderEffect(() => {
      const el = this.messagesEl()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  sendMessage(): void {
    const text = this.inputText().trim();
    if (!text || this.isLoading()) return;
    this.chat.sendMessage({ role: 'user', content: text });
    this.inputText.set('');
  }

  sendSuggestion(text: string): void {
    if (this.isLoading()) return;
    this.chat.sendMessage({ role: 'user', content: text });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isTyping(): boolean {
    const msgs = this.messages();
    if (!this.isSending()) return false;
    if (msgs.length === 0) return true;
    return msgs[msgs.length - 1].role === 'user';
  }
}

