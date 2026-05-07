/**
 * canvas-tools.ts
 *
 * Déclaration explicite des tools Hashbrown pour le canvas.
 * ► Ajouter un nouveau composant = ajouter une fonction `create<NomComposant>Tool` ici.
 */

import { createTool } from '@hashbrownai/angular';
import { s } from '@hashbrownai/core';
import { CanvasService } from './canvas.service';
import { DataStoreService } from '../data/data-store.service';
import { lineDataSchema } from '../../hashbrown-schema/hashbrown-data-schema';

// ── getData (source de données pour calculer les KPIs) ────────────────────────

export function createGetDataTool(dataStore: DataStoreService) {
  return createTool({
    name: 'getData',
    description:
      'Récupère tous les enregistrements produits. ' +
      'Appelle cet outil en premier pour calculer les valeurs à afficher.',
    handler: async () => dataStore.getAll(),
  });
}

// ── addStatCard ───────────────────────────────────────────────────────────────

export function createAddStatCardTool(canvas: CanvasService) {
  return createTool({
    name: 'addStatCard',
    description:
      'Ajoute une carte de statistique / KPI au canvas. ' +
      'Utilise getData pour calculer les valeurs avant d\'appeler cet outil.',
    schema: s.object('paramètres de la stat card', {
      label: s.string('libellé de la statistique, ex : "Produits actifs"'),
      value: s.string('valeur formatée à afficher, ex : "13" ou "12 500 €"'),
      change: s.string('texte de tendance vs période précédente, ex : "+8 %" ou "−2"'),
      positive: s.enumeration(
        '"true" si la tendance est positive (hausse), "false" sinon',
        ['true', 'false'] as const,
      ),
      icon: s.string(
        'nom de l\'icône parmi : trending-up, trending-down, package, users, ' +
        'euro, box, shield, cpu, database, bar-chart, check-circle',
      ),
      color: s.enumeration(
        'thème couleur de la carte',
        ['primary', 'success', 'warning', 'info', 'danger'] as const,
      ),
    }),
    handler: async (params: {
      label:    string;
      value:    string;
      change:   string;
      positive: 'true' | 'false';
      icon:     string;
      color:    string;
    }) => {
      console.log(`Adding stat card: ${params.label} = ${params.value} (${params.change})`);
      canvas.add({
        id:   canvas.generateId(),
        type: 'stat-card',
        props: {
          label:    params.label,
          value:    params.value,
          change:   params.change,
          positive: params.positive === 'true',
          icon:     params.icon,
          color:    params.color,
        },
      });
      return { added: true, type: 'stat-card', label: params.label };
    },
  });
}

// ── addLineChart ──────────────────────────────────────────────────────────────

export function createAddLineChartTool(canvas: CanvasService) {
  return createTool({
    name: 'addLineChart',
    description:
      'Ajoute un graphique linéaire au canvas. ' +
      'Utilise getData pour construire la série de points avant d\'appeler cet outil.',
    schema: s.object('paramètres du graphique linéaire', {
      title: s.string('titre affiché au-dessus du graphique, ex : "Évolution des prix"'),
      data:  s.array('série de points (label + value) à tracer', lineDataSchema),
    }),
    handler: async (params: {
      title: string;
      data:  { label: string; value: number }[];
    }) => {
      canvas.add({
        id:   canvas.generateId(),
        type: 'line-chart',
        props: { title: params.title, data: params.data },
      });
      return { added: true, type: 'line-chart', title: params.title, points: params.data.length };
    },
  });
}

// ── clearCanvas ───────────────────────────────────────────────────────────────

export function createClearCanvasTool(canvas: CanvasService) {
  return createTool({
    name: 'clearCanvas',
    description: 'Efface tous les blocs actuellement affichés sur le canvas.',
    handler: async () => {
      canvas.clear();
      return { cleared: true };
    },
  });
}

