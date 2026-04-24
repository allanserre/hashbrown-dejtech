// ── Hashbrown schema ──────────────────────────────────────────────────────────

import { s } from '@hashbrownai/core';
import { DataCategory } from '../features/data/data.models';

export const dataCategorySchema = s.enumeration(
  'la catégorie du produit',
  [
    DataCategory.Infrastructure,
    DataCategory.Reseau,
    DataCategory.Logiciel,
    DataCategory.Securite,
    DataCategory.Mobilite,
    DataCategory.Stockage,
    DataCategory.Materiel,
  ] as const,
);

export const dataStatusSchema = s.enumeration(
  'le statut du produit',
  ['active', 'inactive', 'draft', 'all'] as const,
);

export const sortFieldSchema = s.enumeration('le champ sur lequel trier', [
  'id',
  'name',
  'category',
  'price',
  'stock',
  'status',
  'updatedAt',
] as const);

export const sortDirSchema = s.enumeration('le sens du tri', ['asc', 'desc'] as const);


export const dataRecordSchema = s.object('un enregistrement produit', {
  id: s.number('identifiant unique du produit'),
  name: s.string('désignation commerciale du produit'),
  category: dataCategorySchema,
  price: s.number('prix unitaire en euros (0 si non défini)'),
  stock: s.number('quantité disponible en stock'),
  status: dataStatusSchema,
  updatedAt: s.string('date de dernière mise à jour au format JJ/MM/AAAA'),
});

/** Paramètres pour l'outil getFilteredData */
export const filterParamsSchema = s.object('critères de filtrage des données', {
  search: s.string('texte recherché dans le nom ou la catégorie (chaîne vide = pas de filtre)'),
  category: s.enumeration('catégorie à filtrer, ou "all" pour toutes', [
    'all',
    DataCategory.Infrastructure,
    DataCategory.Reseau,
    DataCategory.Logiciel,
    DataCategory.Securite,
    DataCategory.Mobilite,
    DataCategory.Stockage,
    DataCategory.Materiel,
  ] as const),
  status: dataStatusSchema,
});

/** Paramètres pour l'outil getSortedAndFilteredData */
export const sortedDataParamsSchema = s.object('critères de filtrage et de tri', {
  search: s.string('texte recherché dans le nom ou la catégorie (chaîne vide = pas de filtre)'),
  category: s.enumeration('catégorie à filtrer, ou "all" pour toutes', [
    'all',
    DataCategory.Infrastructure,
    DataCategory.Reseau,
    DataCategory.Logiciel,
    DataCategory.Securite,
    DataCategory.Mobilite,
    DataCategory.Stockage,
    DataCategory.Materiel,
  ] as const),
  status: dataStatusSchema,
  sortField: sortFieldSchema,
  sortDir: sortDirSchema,
});
