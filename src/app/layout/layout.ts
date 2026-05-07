import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../shared/components/icon/icon';
import { AiChatComponent } from '../shared/components/ai-chat/ai-chat';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, AiChatComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);
  chatOpen         = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'grid',     route: '/dashboard' },
    { label: 'Utilisateurs', icon: 'users',    route: '/users' },
    { label: 'Messagerie',   icon: 'mail',     route: '/mails' },
    { label: 'Données',      icon: 'database', route: '/data' },
    { label: 'Canvas IA',    icon: 'layout',   route: '/canvas' },
  ];

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleChat(): void {
    this.chatOpen.update(v => !v);
  }
}
