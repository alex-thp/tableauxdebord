import { Component, OnInit } from '@angular/core';
import { LocaliteCardComponent } from '../localite-card/localite-card.component';
import { GatewayService } from '../../gateway.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accompagnement',
  standalone: true,
  imports: [CommonModule, LocaliteCardComponent],
  templateUrl: './accompagnement.component.html',
  styleUrl: './accompagnement.component.css'
})
export class AccompagnementComponent implements OnInit {
  data: any[] = [];
  syntheseLocalites: {
    action_localite: string;
    objectifs_realises: number;
    objectifs: number;
    date_prochaine_echeance: string | null;
  }[] = [];

  syntheseGroupes: {
    departement: string | 'Autres';
    items: {
      action_localite: string;
      objectifs_realises: number;
      objectifs: number;
      date_prochaine_echeance: string | null;
    }[];
  }[] = [];

  constructor(private gatewayService: GatewayService) {}

  ngOnInit(): void {
    this.gatewayService.getdashboardData(new Date()).subscribe(res => {
      this.data = res;
      this.syntheseLocalites = this.getSyntheseParLocaliteEnCours(this.data);

      // Tri par date_prochaine_echeance (plus proche d'abord)
      this.syntheseLocalites.sort((a, b) => {
        if (!a.date_prochaine_echeance) return 1;
        if (!b.date_prochaine_echeance) return -1;

        return this.parseDate(a.date_prochaine_echeance).getTime() - this.parseDate(b.date_prochaine_echeance).getTime();
      });

      // Regroupement par département
      this.syntheseGroupes = this.getSyntheseGroupeeParDepartement();

      // Tri des groupes par date la plus proche parmi leurs items
      this.syntheseGroupes.sort((a, b) => {
        const date1 = this.getClosestDateInGroup(a);
        const date2 = this.getClosestDateInGroup(b);

        if (!date1) return 1;
        if (!date2) return -1;

        return date1.getTime() - date2.getTime();
      });
    });
  }

  parseDate(dateStr: string): Date {
    if (!dateStr) return new Date('Invalid');
    const [day, month, year] = dateStr.split('/');
    return new Date(+year, +month - 1, +day);
  }

  getSyntheseParLocaliteEnCours(data: any[]): {
    action_localite: string;
    objectifs: number;
    objectifs_realises: number;
    date_prochaine_echeance: string | null;
  }[] {
    const today = new Date();

    return data.map(loc => {
      let objectifsCount = 0;
      let objectifsRealisesCount = 0;
      const echeances: { date: string; dateParsed: Date }[] = [];

      loc.next.forEach((sujet_loc: any) => {
        sujet_loc.next.forEach((action: any) => {
          action.next.forEach((Sujet: any) => {
            Sujet.next.forEach((critere: any) => {
              critere.next.forEach((val: any) => {
                const debut = this.parseDate(val.date_debut);
                const fin = this.parseDate(val.date_fin);

                if (debut <= today && today <= fin) {
                  objectifsCount += 1;

                  if (val.realise >= val.objectif) {
                    objectifsRealisesCount += 1;
                  } else {
                    echeances.push({ date: val.date_fin, dateParsed: fin });
                  }
                }
              });
            });
          });
        });
      });

      echeances.sort((a, b) => a.dateParsed.getTime() - b.dateParsed.getTime());

      return {
        action_localite: loc.label,
        objectifs: objectifsCount,
        objectifs_realises: objectifsRealisesCount,
        date_prochaine_echeance: echeances[0]?.date || null
      };
    });
  }

  extractDepartement(label: string): string | null {
    // Match deux chiffres consécutifs isolés (ex: "93" dans "93 - est ensemble")
    const match = label.match(/\b(\d{2})\b/);
    return match ? match[1] : null;
  }

  getSyntheseGroupeeParDepartement(): {
    departement: string | 'Autres';
    items: {
      action_localite: string;
      objectifs_realises: number;
      objectifs: number;
      date_prochaine_echeance: string | null;
    }[];
  }[] {
    const groupes: Record<string, typeof this.syntheseLocalites> = {};

    this.syntheseLocalites.forEach(item => {
      const dep = this.extractDepartement(item.action_localite) || 'Autres';
      if (!groupes[dep]) groupes[dep] = [];
      groupes[dep].push(item);
    });

    return Object.entries(groupes).map(([departement, items]) => ({
      departement,
      items
    }));
  }

  // Retourne la date la plus proche (la plus petite) parmi les items du groupe
  getClosestDateInGroup(group: { items: { date_prochaine_echeance: string | null }[] }): Date | null {
    const dates = group.items
      .map(item => item.date_prochaine_echeance ? this.parseDate(item.date_prochaine_echeance) : null)
      .filter((d): d is Date => d !== null);

    if (dates.length === 0) return null;

    dates.sort((a, b) => a.getTime() - b.getTime());
    return dates[0];
  }
}