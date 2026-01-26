import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GatewayService } from '../../gateway.service';
import { AskGeminiService } from '../../ask-gemini/ask-gemini.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-pdf-maker',
  standalone: true,
  templateUrl: './pdf-maker.component.html',
  styleUrls: ['./pdf-maker.component.css'],
  imports: [FormsModule, HttpClientModule],
})
export class PdfMakerComponent {
  htmlContent = '';

  constructor(
    private gatewayService: GatewayService,
    private askGeminiService: AskGeminiService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadHtmlTemplate();
  }

  /** Chargement du template HTML au démarrage */
  private loadHtmlTemplate() {
    this.http
      .get('assets/templates/modele_de_ra.html', { responseType: 'text' })
      .subscribe({
        next: (data) => {
          // On remplace directement le fond dès le chargement
          const fondUrl = 'uploads/RA_benevole/Fond_page/fond_1.png';
          this.htmlContent = data.replace('{{FOND_PAGE}}', fondUrl);
          console.log('Template HTML chargé');
        },
        error: (err) => console.error('Erreur chargement HTML', err),
      });
  }

  /**
   * ✅ Un seul clic utilisateur déclenche TOUT :
   * génération de chaque PDF puis téléchargement immédiat
   */
  benevolePdfSimplified() {
    console.log('Début génération pour tous les bénévoles');

    // 1️⃣ Récupérer la liste des bénévoles
    this.gatewayService.benevolePdf().subscribe({
      next: (data: any[]) => {
        // 2️⃣ Chaîner les requêtes de génération de PDF dans la même exécution
        const tasks = data.map((benev) =>
          this.generateAndDownloadForBenev(benev)
        );
        Promise.all(tasks).then(() =>
          console.log('Tous les PDFs ont été téléchargés')
        );
      },
      error: (err) => console.error('Erreur récupération bénévoles', err),
    });
  }

  /** Génère et télécharge le PDF d'un bénévole */
  private async generateAndDownloadForBenev(benev: any): Promise<void> {
    const nom = this.capitalizeFirstLetter(benev.nom) || 'Inconnu';
    const prenom = this.capitalizeFirstLetter(benev.prenom) || 'Inconnu';

    // Compter les coachings / ateliers
    let nb_coachings = 0;
    const secteurCount: Record<string, number> = {};
    if (benev.cdp_x_benev) {
      for (const cdp of benev.cdp_x_benev) {
        if (cdp?.cand) {
          nb_coachings++;
          const secteur = cdp.cand.secteur_recherche;
          if (secteur) secteurCount[secteur] = (secteurCount[secteur] || 0) + 1;
        }
      }
    }

    const top_secteurs = Object.entries(secteurCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([secteur]) => secteur);

    // Remplacer les placeholders du template
    const htmlForBenev = this.htmlContent
      .replace('{{benev_prenom}}', prenom)
      .replace(
        '{{heure_coaching}}',
        `${((nb_coachings * 40) / 60).toFixed(0)}h`
      )
      .replace('{{nb_personnes_accompagnees}}', nb_coachings.toString())
      .replace('{{secteur 1}}', top_secteurs[0] || '')
      .replace('{{secteur 2}}', top_secteurs[1] || '')
      .replace('{{secteur 3}}', top_secteurs[2] || '');

    // 3️⃣ Génération côté serveur puis téléchargement direct
    return new Promise<void>((resolve, reject) => {
      this.gatewayService.generatePdfFromHtml(htmlForBenev).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${nom}_${prenom}_RA.pdf`;
          a.click(); // ✅ Déclenchement dans le contexte du clic initial
          window.URL.revokeObjectURL(url);
          resolve();
        },
        error: (err) => {
          console.error(`Erreur génération PDF pour ${nom} ${prenom}`, err);
          reject(err);
        },
      });
    });
  }

  private capitalizeFirstLetter(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  }
}
