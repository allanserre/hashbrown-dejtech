/* eslint-disable @typescript-eslint/no-explicit-any */
import { Type } from '@angular/core';
import { s } from '@hashbrownai/core';
import { lineDataSchema } from '../../hashbrown-schema/hashbrown-data-schema';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { LineChartComponent } from '../../shared/components/line-chart/line-chart';
import { CanvasBlock } from './canvas.service';

// ── Interface de définition d'un type de bloc ─────────────────────────────────

export interface CanvasBlockDef {
  /** Discriminant utilisé dans le tool (ex: 'stat-card') */
  type: string;
  /** Description pour le prompt IA */
  description: string;
  /** Composant Angular à instancier via NgComponentOutlet */
  component: Type<unknown>;
  /** Champs Hashbrown spécifiques à ce type — préfixés [type] dans la description */
  schemaFields: Record<string, any>;
  /** Convertit les params bruts du tool → props du composant Angular */
  buildProps(params: Record<string, any>): Record<string, unknown>;
}

// ── Registre ──────────────────────────────────────────────────────────────────
// Ajouter un composant = une entrée ici. Rien d'autre à modifier.

export const CANVAS_REGISTRY: CanvasBlockDef[] = [
  {
    type:        'stat-card',
    description: 'carte de statistique / KPI avec valeur, tendance et icône colorée',
    component:   StatCardComponent,
    schemaFields: {
      label:    s.string('[stat-card] libellé, ex : "Chiffre d\'affaires"'),
      value:    s.string('[stat-card] valeur formatée, ex : "12 500 €"'),
      change:   s.string('[stat-card] texte de tendance, ex : "+8 %"'),
      positive: s.enumeration(
        '[stat-card] "true" si tendance positive (hausse), "false" sinon',
        ['true', 'false'] as const,
      ),
      icon: s.string(
        '[stat-card] icône parmi : trending-up, trending-down, package, users, ' +
        'euro, box, shield, cpu, database, bar-chart, check-circle',
      ),
      color: s.enumeration(
        '[stat-card] thème couleur',
        ['primary', 'success', 'warning', 'info', 'danger'] as const,
      ),
    },
    buildProps: (p) => ({
      label:    p['label'],
      value:    p['value'],
      change:   p['change'],
      positive: p['positive'] === 'true',
      icon:     p['icon'],
      color:    p['color'],
    }),
  },
  {
    type:        'line-chart',
    description: 'graphique linéaire avec une série de points (label, value)',
    component:   LineChartComponent,
    schemaFields: {
      title: s.string('[line-chart] titre affiché au-dessus du graphique'),
      data:  s.array('[line-chart] série de points à tracer', lineDataSchema),
    },
    buildProps: (p) => ({
      title: p['title'],
      data:  p['data'],
    }),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Résout le composant Angular correspondant à un type de bloc. */
export function resolveComponent(type: string): Type<unknown> | null {
  return CANVAS_REGISTRY.find(r => r.type === type)?.component ?? null;
}

/**
 * Construit un CanvasBlock générique depuis les params bruts du tool.
 * Les props sont validées/transformées par le `buildProps` de l'entrée de registre.
 */
export function createCanvasBlock(id: string, params: Record<string, any>): CanvasBlock {
  const type = params['type'] as string;
  const def  = CANVAS_REGISTRY.find(r => r.type === type);
  if (!def) throw new Error(`[Canvas] Type de bloc inconnu : "${type}"`);
  return { id, type, props: def.buildProps(params) };
}

/**
 * Construit un unique schema Hashbrown pour le tool addBlockToCanvas.
 * Toutes les clés de tous les types sont fusionnées — le champ `type`
 * agit comme discriminant. L'IA ne remplit que les champs préfixés par le type choisi.
 */
export function buildCanvasToolSchema() {
  const merged: Record<string, any> = {
    type: s.enumeration(
      'type de composant à créer — détermine quels champs remplir',
      CANVAS_REGISTRY.map(r => r.type) as [string, ...string[]],
    ),
  };
  for (const def of CANVAS_REGISTRY) {
    Object.assign(merged, def.schemaFields);
  }
  const typeList = CANVAS_REGISTRY
    .map(r => `• ${r.type} : ${r.description}`)
    .join('\n');
  return s.object(
    `bloc canvas — types disponibles :\n${typeList}\nRemplir uniquement les champs [type] correspondants.`,
    merged,
  );
}
