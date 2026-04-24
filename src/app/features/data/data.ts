import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon';
import { DataCategory, SortField } from './data.models';
import { DataFilterService } from './data-filter.service';
import { DataStoreService } from './data-store.service';

@Component({
  selector: 'app-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './data.html',
  styleUrl: './data.css',
})
export class DataComponent {
  protected readonly filter   = inject(DataFilterService);
  protected readonly store    = inject(DataStoreService);
  protected readonly DataCategory = DataCategory;

  readonly categories = this.store.getCategories();

  readonly columns: { key: SortField; label: string }[] = [
    { key: 'id',        label: 'ID'          },
    { key: 'name',      label: 'Désignation' },
    { key: 'category',  label: 'Catégorie'   },
    { key: 'price',     label: 'Prix (€)'    },
    { key: 'stock',     label: 'Stock'       },
    { key: 'status',    label: 'Statut'      },
    { key: 'updatedAt', label: 'Mis à jour'  },
  ];

  sortIcon(field: SortField): string {
    if (this.filter.sortField() !== field) return 'sort-none';
    return this.filter.sortDir() === 'asc' ? 'sort-asc' : 'sort-desc';
  }

  formatPrice(price: number): string {
    return price === 0
      ? '—'
      : price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
