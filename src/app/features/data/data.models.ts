import { s } from '@hashbrownai/core';

export enum DataCategory {
  Infrastructure = 'Infrastructure',
  Reseau         = 'Réseau',
  Logiciel       = 'Logiciel',
  Securite       = 'Sécurité',
  Mobilite       = 'Mobilité',
  Stockage       = 'Stockage',
  Materiel       = 'Matériel',
}

export interface DataRecord {
  id: number;
  name: string;
  category: DataCategory;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  updatedAt: string;
}


export enum StatusFilter {
  All = 'all',
  Active = 'active',
  Inactive = 'inactive',
  Draft = 'draft',
}

export type SortField = keyof DataRecord;
export type SortDir   = 'asc' | 'desc';

