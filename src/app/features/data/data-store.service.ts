import { Injectable } from '@angular/core';
import { DataCategory, DataRecord } from './data.models';

const MOCK_DATA: DataRecord[] = [
  { id: 1,  name: 'Serveur NAS Pro',         category: DataCategory.Infrastructure, price: 1299.99, stock: 12,  status: 'active',   updatedAt: '07/04/2026' },
  { id: 2,  name: 'Switch 24 ports',         category: DataCategory.Reseau,         price:  349.00, stock: 28,  status: 'active',   updatedAt: '06/04/2026' },
  { id: 3,  name: 'Licence ERP Standard',    category: DataCategory.Logiciel,       price:  899.00, stock: 100, status: 'active',   updatedAt: '05/04/2026' },
  { id: 4,  name: 'Caméra IP 4K',            category: DataCategory.Securite,       price:  189.50, stock: 7,   status: 'active',   updatedAt: '04/04/2026' },
  { id: 5,  name: 'Onduleur 1500VA',         category: DataCategory.Infrastructure, price:  275.00, stock: 3,   status: 'active',   updatedAt: '03/04/2026' },
  { id: 6,  name: 'Tablette Pro 12"',        category: DataCategory.Mobilite,       price:  799.00, stock: 0,   status: 'inactive', updatedAt: '02/04/2026' },
  { id: 7,  name: 'Firewall UTM',            category: DataCategory.Securite,       price: 2499.00, stock: 5,   status: 'active',   updatedAt: '01/04/2026' },
  { id: 8,  name: 'Antivirus Entreprise',    category: DataCategory.Logiciel,       price:  199.00, stock: 50,  status: 'active',   updatedAt: '31/03/2026' },
  { id: 9,  name: 'Borne WiFi AX',           category: DataCategory.Reseau,         price:  249.00, stock: 15,  status: 'active',   updatedAt: '30/03/2026' },
  { id: 10, name: 'Backup Cloud 1 To',       category: DataCategory.Stockage,       price:   12.00, stock: 999, status: 'active',   updatedAt: '29/03/2026' },
  { id: 11, name: 'Moniteur 27" 4K',         category: DataCategory.Materiel,       price:  549.00, stock: 9,   status: 'active',   updatedAt: '28/03/2026' },
  { id: 12, name: 'Projet IA (pilote)',       category: DataCategory.Logiciel,       price:    0.00, stock: 1,   status: 'draft',    updatedAt: '27/03/2026' },
  { id: 13, name: 'Imprimante laser Pro',    category: DataCategory.Materiel,       price:  429.00, stock: 6,   status: 'active',   updatedAt: '26/03/2026' },
  { id: 14, name: 'Carte SIM IoT (x10)',     category: DataCategory.Mobilite,       price:   85.00, stock: 200, status: 'inactive', updatedAt: '25/03/2026' },
  { id: 15, name: 'Rack 42U',               category: DataCategory.Infrastructure, price:  695.00, stock: 2,   status: 'active',   updatedAt: '24/03/2026' },
];

@Injectable({ providedIn: 'root' })
export class DataStoreService {
  /** Retourne tous les enregistrements (lecture seule). */
  getAll(): readonly DataRecord[] {
    return MOCK_DATA;
  }

  /** Toutes les catégories uniques triées alphabétiquement. */
  getCategories(): DataCategory[] {
    return Object.values(DataCategory).sort();
  }
}

