import { Component, ChangeDetectionStrategy } from '@angular/core';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { BarChartComponent, BarData } from '../../shared/components/bar-chart/bar-chart';
import { LineChartComponent, LineData } from '../../shared/components/line-chart/line-chart';
import { IconComponent } from '../../shared/components/icon/icon';

interface StatItem {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
}

interface Activity {
  id: number;
  user: string;
  initials: string;
  action: string;
  target: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'danger';
}

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatCardComponent, BarChartComponent, LineChartComponent, IconComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  readonly stats: StatItem[] = [
    { label: 'Utilisateurs',  value: '2 845',   change: '+12.4%', positive: true,  icon: 'users',         color: 'primary' },
    { label: 'Revenus',       value: '€ 48 250', change: '+8.2%',  positive: true,  icon: 'dollar',        color: 'success' },
    { label: 'Commandes',     value: '1 247',    change: '-3.1%',  positive: false, icon: 'shopping-cart', color: 'warning' },
    { label: 'Taux croissance', value: '18.6 %', change: '+2.4%',  positive: true,  icon: 'activity',      color: 'info'    },
  ];

  readonly barData: BarData[] = [
    { label: 'Jan', value: 42000 },
    { label: 'Fév', value: 58000 },
    { label: 'Mar', value: 51000 },
    { label: 'Avr', value: 67000 },
    { label: 'Mai', value: 73000 },
    { label: 'Jun', value: 88000 },
  ];

  readonly lineData: LineData[] = [
    { label: 'S1', value: 1200 },
    { label: 'S2', value: 1850 },
    { label: 'S3', value: 1430 },
    { label: 'S4', value: 2100 },
    { label: 'S5', value: 1920 },
    { label: 'S6', value: 2450 },
    { label: 'S7', value: 2210 },
    { label: 'S8', value: 2860 },
  ];

  readonly activities: Activity[] = [
    { id: 1, user: 'Alice Martin',   initials: 'AM', action: 'a créé',    target: 'un nouvel utilisateur',     time: 'Il y a 5 min',   type: 'success' },
    { id: 2, user: 'Bob Dupont',     initials: 'BD', action: 'a modifié', target: 'la configuration système',  time: 'Il y a 18 min',  type: 'warning' },
    { id: 3, user: 'Clara Moreau',   initials: 'CM', action: 'a exporté', target: 'le rapport mensuel',        time: 'Il y a 32 min',  type: 'info'    },
    { id: 4, user: 'David Leroy',    initials: 'DL', action: 'a supprimé','target': '3 entrées obsolètes',    time: 'Il y a 1 h',     type: 'danger'  },
    { id: 5, user: 'Emma Bernard',   initials: 'EB', action: 'a envoyé',  target: 'une campagne e-mail',       time: 'Il y a 2 h',     type: 'success' },
  ];
}

