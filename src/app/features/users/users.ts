import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon';
import { FormsModule } from '@angular/forms';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  initials: string;
  joinedAt: string;
}

const MOCK_USERS: User[] = [
  { id: 1,  name: 'Alice Martin',    email: 'alice.martin@exemple.fr',    role: 'Administrateur', status: 'active',   initials: 'AM', joinedAt: '12 jan. 2025' },
  { id: 2,  name: 'Bob Dupont',      email: 'bob.dupont@exemple.fr',      role: 'Éditeur',        status: 'active',   initials: 'BD', joinedAt: '3 fév. 2025'  },
  { id: 3,  name: 'Clara Moreau',    email: 'clara.moreau@exemple.fr',    role: 'Lecteur',        status: 'pending',  initials: 'CM', joinedAt: '27 fév. 2025' },
  { id: 4,  name: 'David Leroy',     email: 'david.leroy@exemple.fr',     role: 'Éditeur',        status: 'inactive', initials: 'DL', joinedAt: '5 mar. 2025'  },
  { id: 5,  name: 'Emma Bernard',    email: 'emma.bernard@exemple.fr',    role: 'Administrateur', status: 'active',   initials: 'EB', joinedAt: '14 mar. 2025' },
  { id: 6,  name: 'François Petit',  email: 'f.petit@exemple.fr',         role: 'Lecteur',        status: 'active',   initials: 'FP', joinedAt: '2 avr. 2025'  },
  { id: 7,  name: 'Gaëlle Simon',    email: 'g.simon@exemple.fr',         role: 'Éditeur',        status: 'active',   initials: 'GS', joinedAt: '18 avr. 2025' },
  { id: 8,  name: 'Hugo Roux',       email: 'hugo.roux@exemple.fr',       role: 'Lecteur',        status: 'pending',  initials: 'HR', joinedAt: '29 avr. 2025' },
  { id: 9,  name: 'Isabelle Faure',  email: 'i.faure@exemple.fr',         role: 'Éditeur',        status: 'active',   initials: 'IF', joinedAt: '7 mai 2025'   },
  { id: 10, name: 'Julien Blanc',    email: 'j.blanc@exemple.fr',         role: 'Lecteur',        status: 'inactive', initials: 'JB', joinedAt: '20 mai 2025'  },
  { id: 11, name: 'Karine Durand',   email: 'k.durand@exemple.fr',        role: 'Administrateur', status: 'active',   initials: 'KD', joinedAt: '1 jun. 2025'  },
  { id: 12, name: 'Laurent Michel',  email: 'l.michel@exemple.fr',        role: 'Éditeur',        status: 'active',   initials: 'LM', joinedAt: '15 jun. 2025' },
];

@Component({
  selector: 'app-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersComponent {
  private readonly allUsers = MOCK_USERS;

  searchQuery  = signal('');
  statusFilter = signal<string>('all');
  currentPage  = signal(1);
  readonly pageSize = 6;

  filteredUsers = computed(() => {
    const q  = this.searchQuery().toLowerCase().trim();
    const sf = this.statusFilter();
    return this.allUsers.filter(u => {
      const matchQ  = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchSt = sf === 'all' || u.status === sf;
      return matchQ && matchSt;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));

  pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onFilterStatus(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}

