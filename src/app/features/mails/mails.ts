import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon';

export interface Mail {
  id: number;
  sender: string;
  initials: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
  category: 'inbox' | 'sent' | 'draft';
}

const MOCK_MAILS: Mail[] = [
  { id: 1,  sender: 'Alice Martin',   initials: 'AM', subject: 'Rapport mensuel Q1 2026',          preview: 'Veuillez trouver en pièce jointe le rapport complet du premier trimestre 2026.',    date: 'Aujourd\'hui 09:41', read: false, starred: true,  category: 'inbox' },
  { id: 2,  sender: 'Support DejTech',initials: 'SD', subject: 'Mise à jour système planifiée',    preview: 'Une maintenance est prévue ce dimanche de 02h00 à 06h00. Les services seront...',     date: 'Aujourd\'hui 08:15', read: false, starred: false, category: 'inbox' },
  { id: 3,  sender: 'Bob Dupont',     initials: 'BD', subject: 'Re: Proposition de projet',        preview: 'Suite à notre réunion de hier, voici mes commentaires sur les points abordés...',     date: 'Hier 17:30',         read: true,  starred: false, category: 'inbox' },
  { id: 4,  sender: 'RH',             initials: 'RH', subject: 'Invitation : Réunion d\'équipe',   preview: 'Vous êtes invité à la réunion mensuelle de l\'équipe le vendredi 11 avril à 14h.',   date: 'Hier 14:22',         read: true,  starred: true,  category: 'inbox' },
  { id: 5,  sender: 'Clara Moreau',   initials: 'CM', subject: 'Question sur la facturation',      preview: 'Bonjour, je souhaitais vous poser une question concernant la facture du mois...',     date: 'Lun. 11:05',         read: true,  starred: false, category: 'inbox' },
  { id: 6,  sender: 'Newsletter',     initials: 'NL', subject: 'Tendances tech — Avril 2026',      preview: 'Découvrez les dernières actualités du monde de la technologie ce mois-ci : IA,..', date: 'Lun. 08:00',         read: true,  starred: false, category: 'inbox' },
  { id: 7,  sender: 'David Leroy',    initials: 'DL', subject: 'Accès refusé — Action requise',    preview: 'Votre compte a tenté d\'accéder à une ressource protégée. Veuillez vérifier...',     date: 'Dim. 20:14',         read: false, starred: true,  category: 'inbox' },
  { id: 8,  sender: 'Emma Bernard',   initials: 'EB', subject: 'Retour sur la démo client',        preview: 'La démonstration s\'est très bien passée. Le client est intéressé et souhaite...',    date: 'Ven. 16:48',         read: true,  starred: false, category: 'inbox' },
];

@Component({
  selector: 'app-mails',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './mails.html',
  styleUrl: './mails.css',
})
export class MailsComponent {
  private mailsState = signal<Mail[]>(MOCK_MAILS);

  activeTab   = signal<'inbox' | 'sent' | 'draft'>('inbox');
  selectedId  = signal<number | null>(null);
  searchQuery = signal('');

  filteredMails = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.mailsState().filter(m => {
      const matchTab = m.category === this.activeTab();
      const matchQ   = !q || m.sender.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
      return matchTab && matchQ;
    });
  });

  selectedMail = computed(() =>
    this.selectedId() != null
      ? this.mailsState().find(m => m.id === this.selectedId()) ?? null
      : null
  );

  unreadCount = computed(() => this.mailsState().filter(m => !m.read && m.category === 'inbox').length);

  openMail(mail: Mail): void {
    this.selectedId.set(mail.id);
    if (!mail.read) {
      this.mailsState.update(mails =>
        mails.map(m => m.id === mail.id ? { ...m, read: true } : m)
      );
    }
  }

  closeMail(): void {
    this.selectedId.set(null);
  }

  toggleStar(mail: Mail, event: Event): void {
    event.stopPropagation();
    this.mailsState.update(mails =>
      mails.map(m => m.id === mail.id ? { ...m, starred: !m.starred } : m)
    );
  }

  setTab(tab: 'inbox' | 'sent' | 'draft'): void {
    this.activeTab.set(tab);
    this.selectedId.set(null);
    this.searchQuery.set('');
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }
}

