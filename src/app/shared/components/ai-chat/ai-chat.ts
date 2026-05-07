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
import {
  createTool,
  exposeComponent,
  RenderMessageComponent,
  UiChatMessage,
  uiChatResource,
} from '@hashbrownai/angular';
import { s } from '@hashbrownai/core';
import { IconComponent } from '../icon/icon';
import { LineChartComponent } from '../line-chart/line-chart';
import { Markdown } from '../markdown/markdown';
import { DataStoreService } from '../../../features/data/data-store.service';
import { DataFilterService, filterData, sortData } from '../../../features/data/data-filter.service';
import { DataCategory, SortDir, SortField } from '../../../features/data/data.models';
import { Router } from '@angular/router';
import { RouteNames } from '../../../app.routes';
import {
  filterParamsSchema,
  lineDataSchema,
  sortedDataParamsSchema,
} from '../../../hashbrown-schema/hashbrown-data-schema';
import { JsonPipe } from '@angular/common';

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
  imports: [IconComponent, RenderMessageComponent, JsonPipe],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css',
})
export class AiChatComponent {
  private readonly router     = inject(Router);
  private readonly dataStore  = inject(DataStoreService);
  private readonly dataFilter = inject(DataFilterService);

  private readonly chat = uiChatResource({
    model:     'openrouter/free',
    debugName: 'dashboard-assistant',
    system: `Tu es un assistant IA intégré au tableau de bord DejTech.
Tu aides les utilisateurs à :
- Comprendre et analyser les données du dashboard
- Naviguer dans l'application (Dashboard, Utilisateurs, Messagerie, Données, Canvas)
- Obtenir des insights sur les KPIs
- Filtrer et trier les données dans la page Données

Réponds toujours en français, de façon concise.
Pour afficher des blocs visuels (stat cards, graphiques), guide l'utilisateur vers la page Canvas.`,

    components: [
      exposeComponent(LineChartComponent, {
        description: 'Affiche un graphique linéaire.',
        input: { data: s.array('points du graphique', lineDataSchema) },
      }),
      exposeComponent(Markdown, {
        description: 'Affiche du texte formaté en Markdown.',
        input: { content: s.streaming.string('texte markdown') },
      }),
    ],

    tools: [
      createTool({
        name: 'getData',
        description: 'Récupère tous les enregistrements produits sans filtre.',
        handler: async () => this.dataStore.getAll(),
      }),
      createTool({
        name: 'getFilteredData',
        description:
          'Filtre les données (texte, catégorie, statut) et navigue vers la page Données. ' +
          'Utilise "all" pour ignorer un critère.',
        schema: filterParamsSchema,
        handler: async (params: {
          search: string; category: DataCategory | 'all'; status: string;
        }): Promise<{ applied: FilterAppliedResult }> => {
          this.dataFilter.applyFilters(params);
          await this.router.navigate(['/data']);
          const count = filterData(this.dataStore.getAll(), params).length;
          return { applied: { ...params, resultCount: count } };
        },
      }),
      createTool({
        name: 'getSortedAndFilteredData',
        description: 'Filtre ET trie les données, puis navigue vers la page Données.',
        schema: sortedDataParamsSchema,
        handler: async (params: {
          search: string; category: DataCategory | 'all'; status: string;
          sortField: SortField; sortDir: SortDir;
        }): Promise<{ applied: FilterAppliedResult }> => {
          this.dataFilter.applyFilters(params);
          await this.router.navigate(['/data']);
          const count = sortData(
            filterData(this.dataStore.getAll(), params),
            params.sortField, params.sortDir,
          ).length;
          return { applied: { ...params, resultCount: count } };
        },
      }),
      createTool({
        name: 'getDataSorted',
        description: 'Récupère les données filtrées et triées (sans navigation).',
        schema: sortedDataParamsSchema,
        handler: async (params: {
          search: string; category: DataCategory | 'all'; status: string;
          sortField: SortField; sortDir: SortDir;
        }) =>
          sortData(filterData(this.dataStore.getAll(), params), params.sortField, params.sortDir),
      }),
      createTool({
        name: 'resetDataFilters',
        description: 'Réinitialise tous les filtres de la page Données.',
        handler: async () => {
          this.dataFilter.resetFilters();
          await this.router.navigate(['/data']);
          return { reset: true, totalRecords: this.dataStore.getAll().length };
        },
      }),
      createTool({
        name: 'navigate',
        description: "Naviguer vers une page de l'application.",
        schema: s.object('paramètres de navigation', {
          route: s.enumeration(
            'page de destination',
            Object.values(RouteNames) as [string, ...string[]],
          ),
        }),
        handler: async ({ route }: { route: string }) =>
          this.router.navigate(['/' + route]),
      }),
    ],
  });

  readonly messagesEl = viewChild<ElementRef<HTMLElement>>('messagesEl');
  inputText  = signal('');
  messages   = computed(() => (this.chat.value() ?? []) as UiChatMessage[]);
  isLoading  = this.chat.isLoading;

  readonly suggestions: string[] = [
    'Montre-moi les produits actifs en Logiciel triés par prix',
    'Navigue vers le canvas pour créer des stat cards',
    'Quels produits sont en rupture de stock ?',
    'Réinitialise les filtres des données',
  ];

  constructor() {
    afterRenderEffect(() => {
      const el = this.messagesEl()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
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
    if (msgs.length === 0) return true;
    return msgs[msgs.length - 1].role === 'user';
  }
}

