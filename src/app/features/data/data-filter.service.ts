import { Injectable, computed, inject, signal } from '@angular/core';
import { DataCategory, DataRecord, SortDir, SortField } from './data.models';
import { DataStoreService } from './data-store.service';

export const PAGE_SIZE = 8;

// ── Fonctions pures exportées (réutilisables par les tools IA) ────────────────

export interface FilterParams {
  search?:   string;
  category?: DataCategory | 'all';
  status?:   string;
}

export function filterData(
  data: readonly DataRecord[],
  params: FilterParams,
): readonly DataRecord[] {
  const q  = (params.search ?? '').toLowerCase().trim();
  const cf = params.category ?? 'all';
  const sf = params.status   ?? 'all';
  return data.filter(d => {
    const mQ  = !q  || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const mCf = cf === 'all' || d.category === cf;
    const mSf = sf === 'all' || d.status   === sf;
    return mQ && mCf && mSf;
  });
}

export function sortData(
  data: readonly DataRecord[],
  field: SortField,
  dir: SortDir,
): readonly DataRecord[] {
  return [...data].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av < bv) return dir === 'asc' ? -1 :  1;
    if (av > bv) return dir === 'asc' ?  1 : -1;
    return 0;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DataFilterService {
  private readonly store = inject(DataStoreService);

  // ── État des filtres ────────────────────────────────────────────────────────
  readonly searchQuery    = signal('');
  readonly categoryFilter = signal<DataCategory | 'all'>('all');
  readonly statusFilter   = signal<string>('all');
  readonly sortField      = signal<SortField>('id');
  readonly sortDir        = signal<SortDir>('asc');
  readonly currentPage    = signal(1);

  // ── Données dérivées (utilisent les fonctions pures) ────────────────────────
  readonly filteredData = computed(() =>
    filterData(this.store.getAll(), {
      search:   this.searchQuery(),
      category: this.categoryFilter(),
      status:   this.statusFilter(),
    }),
  );

  readonly sortedData = computed(() =>
    sortData(this.filteredData(), this.sortField(), this.sortDir()),
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedData().length / PAGE_SIZE)),
  );

  readonly pagedData = computed<readonly DataRecord[]>(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.sortedData().slice(start, start + PAGE_SIZE);
  });

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  // ── Mutations ───────────────────────────────────────────────────────────────
  setSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  setCategory(value: DataCategory | 'all'): void {
    this.categoryFilter.set(value);
    this.currentPage.set(1);
  }

  setStatus(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  /**
   * Applique un ensemble complet de filtres + tri en une seule passe.
   * Appelé par les tools IA pour mettre à jour la page Données visuellement.
   */
  applyFilters(params: {
    search?:    string;
    category?:  DataCategory | 'all';
    status?:    string;
    sortField?: SortField;
    sortDir?:   SortDir;
  }): void {
    if (params.search    !== undefined) this.searchQuery.set(params.search);
    if (params.category  !== undefined) this.categoryFilter.set(params.category);
    if (params.status    !== undefined) this.statusFilter.set(params.status);
    if (params.sortField !== undefined) this.sortField.set(params.sortField);
    if (params.sortDir   !== undefined) this.sortDir.set(params.sortDir);
    this.currentPage.set(1);
  }

  /** Remet tous les filtres à leur valeur par défaut. */
  resetFilters(): void {
    this.searchQuery.set('');
    this.categoryFilter.set('all');
    this.statusFilter.set('all');
    this.sortField.set('id');
    this.sortDir.set('asc');
    this.currentPage.set(1);
  }
}

