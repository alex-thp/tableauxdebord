import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BoussoleService } from './boussole.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GatewayService } from '../gateway.service';

@Component({
  selector: 'app-boussole',
  templateUrl: './boussole.component.html',
  imports: [
    CommonModule,
    FormsModule
  ],
  styleUrls: ['./boussole.component.css']
})
export class BoussoleComponent implements OnInit {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  imageUrl = "assets/images/boussole.jpg";
  boussoleData = {
    accompagnement: {
      nb_cand_cdp_fixe: 0,
      nb_cand_cdp_mobile: 0,
      nb_cand_at_co: 0,
      nb_cand_bien_etre: 0,
      nb_cand_mentorat: 0,
      nb_cand_cdp_et_at_co: 0,
      nb_absent_cdp: 0,
      nb_absent_bien_etre: 0,
      nb_cand_qpv_fixe: 0,
      nb_cand_qpv_mobile: 0,
      nb_fin_parcours: 0,
      nb_remob: 0,
      taux_satisfaction_cdp: 0,
      taux_sortie_positive_fin_parcours: 0,
      taux_sortie_positive_remob: 0,
      taux_sortie_negative_fin_parcours: 0,
      taux_sortie_negative_remob: 0,
      nb_cand_unique_at_co : 0,
      nb_cand_unique_at_co_avec_cdp : 0,
    },
    benevoles: {
      nb_actions_benevole_mobilisees: 0,
      nb_actions_benevole_mobilisees_93_95: 0,
      nb_ateliers_par_benevole_unique: 0,
      nb_nouveaux_benevoles_session_accueil: 0,
      taux_transformation_session_accueil: 0,
      nb_evenements_sensi_visites: 0,
      nb_participants_uniques_sensi_visites: 0,
      nb_venues_ateliers: { "1x": 0, "2x": 0, "3x": 0, "4x et plus": 0 },
      pourcent_be_vs_bc: 0,
      pourcent_benevoles_adherents: 0,
      taux_satisfaction_utilite_benevolat: 0,
    },
    pc: {
      nb_collectes: 0,
      nb_tri: 0,
      nb_collab: 0,
      nb_collab_plus_un_atelier: 0,
      nb_ateliers_par_collab_unique: 0,
      nb_collab_3x_plus: 0,
      taux_satisfaction_collecte: 0,
      taux_satisfaction_tri: 0,
      pourcent_souhaitant_engager: 0,
      nb_cdp_moyen_be: 0,
    }
  };

  chargement = true; //LOADER

  // Variables calculées pour l'affichage
  taux_presence_cdp = 0;
  taux_presence_bien_etre = 0;
  taux_qpv_fixe = 0;
  taux_qpv_mobile = 0;
  taux_qpv_total = 0;
  taux_fin_parcours = 0;
  taux_remob = 0;
  pourcent_fin_parcours = 0;
  pourcent_remob = 0;
  pourcent_fin_parcours_string = "";
  pourcent_remob_string = "";
  taux_cdp_et_at_co = 0;
  taux_cdp_et_at_co_objectif = 0;

  old_boussoleData = {
    accompagnement: {
      nb_cand_cdp_fixe: 0,
      nb_cand_cdp_mobile: 0,
      nb_cand_at_co: 0,
      nb_cand_bien_etre: 0,
      nb_cand_mentorat: 0,
      nb_cand_cdp_et_at_co: 0,
      nb_absent_cdp: 0,
      nb_absent_bien_etre: 0,
      nb_cand_qpv_fixe: 0,
      nb_cand_qpv_mobile: 0,
      nb_fin_parcours: 0,
      nb_remob: 0,
      taux_satisfaction_cdp: 0,
      taux_sortie_positive_fin_parcours: 0,
      taux_sortie_positive_remob: 0,
      taux_sortie_negative_fin_parcours: 0,
      taux_sortie_negative_remob: 0,
      nb_cand_unique_at_co : 0,
      nb_cand_unique_at_co_avec_cdp : 0,
    },
    benevoles: {
      nb_actions_benevole_mobilisees: 0,
      nb_actions_benevole_mobilisees_93_95: 0,
      nb_ateliers_par_benevole_unique: 0,
      nb_nouveaux_benevoles_session_accueil: 0,
      taux_transformation_session_accueil: 0,
      nb_evenements_sensi_visites: 0,
      nb_participants_uniques_sensi_visites: 0,
      nb_venues_ateliers: { "1x": 0, "2x": 0, "3x": 0, "4x et plus": 0 },
      pourcent_be_vs_bc: 0,
      pourcent_benevoles_adherents: 0,
      taux_satisfaction_utilite_benevolat: 0,
    },
    pc: {
      nb_collectes: 0,
      nb_tri: 0,
      nb_collab: 0,
      nb_collab_plus_un_atelier: 0,
      nb_ateliers_par_collab_unique: 0,
      nb_collab_3x_plus: 0,
      taux_satisfaction_collecte: 0,
      taux_satisfaction_tri: 0,
      pourcent_souhaitant_engager: 0,
      nb_cdp_moyen_be: 0,
    }
  };

  // Variables calculées pour l'affichage de n-1
  old_taux_presence_cdp = 0;
  old_taux_presence_bien_etre = 0;
  old_taux_qpv_fixe = 0;
  old_taux_qpv_mobile = 0;
  old_taux_qpv_total = 0;
  old_taux_fin_parcours = 0;
  old_taux_remob = 0;
  old_pourcent_fin_parcours = 0;
  old_pourcent_remob = 0;
  old_pourcent_fin_parcours_string = "";
  old_pourcent_remob_string = "";
  old_taux_cdp_et_at_co = 0;

  currentYear = new Date().getFullYear();
  dateDebut:Date;
  dateFin:Date;
  
  @ViewChildren('bloc') blocs!: QueryList<ElementRef>;

  constructor(private boussoleService: BoussoleService, private gatewayService: GatewayService) {
    this.dateFin = new Date();
    this.dateDebut = new Date(this.currentYear, 0, 1); // 1er janvier de l'année en cours
    /*this.dateFin = new Date(); // aujourd'hui
    this.dateDebut = new Date(this.dateFin);
    this.dateDebut.setFullYear(this.dateFin.getFullYear() - 1);
    this.dateDebut.setDate(this.dateFin.getDate() + 1); // pile 12 mois en arrière*/
  }

  ngOnInit(): void {
    this.loadBoussoleData();
    this.loadBoussoleLastYearData();
  }

  ngAfterViewInit() {
    setTimeout(() => { // petit délai pour être sûr que tout est rendu
      let maxHeight = 0;

      // on cherche la hauteur max
      this.blocs.forEach(bloc => {
        const h = bloc.nativeElement.offsetHeight;
        if (h > maxHeight) maxHeight = h;
      });

      // on applique la hauteur max à tous les blocs
      this.blocs.forEach(bloc => {
        bloc.nativeElement.style.height = maxHeight + 'px';
      });
    });
  }

generatePdf() {
  const htmlContent = this.pdfContent.nativeElement.outerHTML;

  // Récupère le contenu du <style> généré par Angular (qui est dans le <head>)
  const styles = Array.from(document.querySelectorAll('style'))
    .map(style => style.outerHTML)
    .join('\n');

  const fullHtml = `
    <html>
      <head>
        ${styles}
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  this.gatewayService.downloadBoussolePdf(fullHtml).subscribe((blob: Blob | MediaSource) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mon_pdf.pdf';
    a.click();
  });
}

loadBoussoleLastYearData() {
  const dateDebut = new Date(this.dateDebut);
  dateDebut.setFullYear(dateDebut.getFullYear() - 1);

  const dateFin = new Date(this.dateFin);
  dateFin.setFullYear(dateFin.getFullYear() - 1);
    this.chargement = true;

    this.boussoleService.getBoussoleData(dateDebut, dateFin).subscribe(data => {
      this.chargement = false; 
    this.old_boussoleData = data;

      // Calculs pour le HTML
      const acomp = this.old_boussoleData.accompagnement;

      this.old_taux_presence_cdp = acomp.nb_cand_cdp_fixe +  acomp.nb_cand_cdp_mobile > 0 ? (acomp.nb_cand_cdp_fixe +  acomp.nb_cand_cdp_mobile) / (acomp.nb_cand_cdp_fixe + acomp.nb_cand_cdp_mobile + acomp.nb_absent_cdp) * 100 : 0;
      this.old_taux_presence_bien_etre = acomp.nb_cand_bien_etre > 0 ? (acomp.nb_cand_bien_etre) / (acomp.nb_cand_bien_etre + acomp.nb_absent_bien_etre) * 100 : 0;

      this.old_taux_qpv_fixe = acomp.nb_cand_cdp_fixe > 0 ? acomp.nb_cand_qpv_fixe / acomp.nb_cand_cdp_fixe * 100 : 0;
      this.old_taux_qpv_mobile = acomp.nb_cand_cdp_mobile > 0 ? acomp.nb_cand_qpv_mobile / acomp.nb_cand_cdp_mobile * 100 : 0;
      this.old_taux_qpv_total = (acomp.nb_cand_qpv_fixe + acomp.nb_cand_qpv_mobile) / (acomp.nb_cand_cdp_fixe + acomp.nb_cand_cdp_mobile) * 100;

      this.old_taux_fin_parcours = this.old_boussoleData.accompagnement.taux_sortie_positive_fin_parcours + this.old_boussoleData.accompagnement.taux_sortie_negative_fin_parcours > 0 ? this.old_boussoleData.accompagnement.taux_sortie_positive_fin_parcours / (this.old_boussoleData.accompagnement.taux_sortie_positive_fin_parcours + this.old_boussoleData.accompagnement.taux_sortie_negative_fin_parcours) * 100 : 0;
      this.old_taux_remob = this.old_boussoleData.accompagnement.taux_sortie_positive_remob + this.old_boussoleData.accompagnement.taux_sortie_negative_remob > 0 ? this.old_boussoleData.accompagnement.taux_sortie_positive_remob / (this.old_boussoleData.accompagnement.taux_sortie_positive_remob + this.old_boussoleData.accompagnement.taux_sortie_negative_remob) * 100 : 0;
    
      this.old_pourcent_fin_parcours = this.old_boussoleData.accompagnement.nb_fin_parcours / (this.old_boussoleData.accompagnement.nb_fin_parcours + this.old_boussoleData.accompagnement.nb_remob) * 100;
      this.old_pourcent_remob = this.old_boussoleData.accompagnement.nb_remob / (this.old_boussoleData.accompagnement.nb_fin_parcours + this.old_boussoleData.accompagnement.nb_remob) * 100;
      this.old_pourcent_fin_parcours_string = this.old_pourcent_fin_parcours.toFixed(2);
      this.old_pourcent_remob_string = this.old_pourcent_remob.toFixed(2);

      this.old_taux_cdp_et_at_co = acomp.nb_cand_at_co > 0 ? acomp.nb_cand_unique_at_co_avec_cdp / acomp.nb_cand_unique_at_co * 100 : 0;
      this.old_taux_cdp_et_at_co = this.old_taux_cdp_et_at_co.toFixed(2) as unknown as number;
    
    });
  }

  loadBoussoleData() {
    const dateDebut = new Date(this.dateDebut);
    const dateFin = new Date(this.dateFin);
    this.chargement = true;

    this.boussoleService.getBoussoleData(dateDebut, dateFin).subscribe(data => {
    this.boussoleData = data;

      // Calculs pour le HTML
      const acomp = this.boussoleData.accompagnement;

      this.taux_presence_cdp = acomp.nb_cand_cdp_fixe +  acomp.nb_cand_cdp_mobile > 0 ? (acomp.nb_cand_cdp_fixe +  acomp.nb_cand_cdp_mobile) / (acomp.nb_cand_cdp_fixe + acomp.nb_cand_cdp_mobile + acomp.nb_absent_cdp) * 100 : 0;
      this.taux_presence_bien_etre = acomp.nb_cand_bien_etre > 0 ? (acomp.nb_cand_bien_etre) / (acomp.nb_cand_bien_etre + acomp.nb_absent_bien_etre) * 100 : 0;

      this.taux_qpv_fixe = acomp.nb_cand_cdp_fixe > 0 ? acomp.nb_cand_qpv_fixe / acomp.nb_cand_cdp_fixe * 100 : 0;
      this.taux_qpv_mobile = acomp.nb_cand_cdp_mobile > 0 ? acomp.nb_cand_qpv_mobile / acomp.nb_cand_cdp_mobile * 100 : 0;
      this.taux_qpv_total = (acomp.nb_cand_qpv_fixe + acomp.nb_cand_qpv_mobile) / (acomp.nb_cand_cdp_fixe + acomp.nb_cand_cdp_mobile) * 100;

      this.taux_fin_parcours = this.boussoleData.accompagnement.taux_sortie_positive_fin_parcours + this.boussoleData.accompagnement.taux_sortie_negative_fin_parcours > 0 ? this.boussoleData.accompagnement.taux_sortie_positive_fin_parcours / (this.boussoleData.accompagnement.taux_sortie_positive_fin_parcours + this.boussoleData.accompagnement.taux_sortie_negative_fin_parcours) * 100 : 0;
      this.taux_remob = this.boussoleData.accompagnement.taux_sortie_positive_remob + this.boussoleData.accompagnement.taux_sortie_negative_remob > 0 ? this.boussoleData.accompagnement.taux_sortie_positive_remob / (this.boussoleData.accompagnement.taux_sortie_positive_remob + this.boussoleData.accompagnement.taux_sortie_negative_remob) * 100 : 0;
    
      this.pourcent_fin_parcours = this.boussoleData.accompagnement.nb_fin_parcours / (this.boussoleData.accompagnement.nb_fin_parcours + this.boussoleData.accompagnement.nb_remob) * 100;
      this.pourcent_remob = this.boussoleData.accompagnement.nb_remob / (this.boussoleData.accompagnement.nb_fin_parcours + this.boussoleData.accompagnement.nb_remob) * 100;
      this.pourcent_fin_parcours_string = this.pourcent_fin_parcours.toFixed(2);
      this.pourcent_remob_string = this.pourcent_remob.toFixed(2);

      this.taux_cdp_et_at_co = acomp.nb_cand_at_co > 0 ? acomp.nb_cand_unique_at_co_avec_cdp / acomp.nb_cand_unique_at_co * 100 : 0;
      this.taux_cdp_et_at_co = this.taux_cdp_et_at_co.toFixed(2) as unknown as number;

      this.taux_cdp_et_at_co_objectif =  acomp.nb_cand_at_co > 0 ? 210 / acomp.nb_cand_unique_at_co * 100 : 0; // objectif annuel
      this.taux_cdp_et_at_co_objectif = this.taux_cdp_et_at_co_objectif.toFixed(2) as unknown as number;
    });
  }

getDiffPercent(newValue: any, oldValue: any): { value: number, color: string } {
  const newNum = Number(newValue);
  const oldNum = Number(oldValue);

  if (oldNum === 0) {
    return { value: 0, color: 'black' };
  }

  const diff = ((newNum - oldNum) / oldNum) * 100;
  return {
    value: Math.round(diff),
    color: diff >= 0 ? 'green' : 'red'
  };
}
}
