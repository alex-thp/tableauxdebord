import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  dateDebut: string = '2025-01-01';
  dateFin: string = '2025-08-25';

  constructor(private boussoleService: BoussoleService, private gatewayService: GatewayService) {}

  ngOnInit(): void {
    this.loadBoussoleData();
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

  loadBoussoleData() {
    const dateDebut = new Date(this.dateDebut);
    const dateFin = new Date(this.dateFin);
    this.chargement = true;

    this.boussoleService.getBoussoleData(dateDebut, dateFin).subscribe(data => {
      this.chargement = false; 
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
    
    });
  }
}
