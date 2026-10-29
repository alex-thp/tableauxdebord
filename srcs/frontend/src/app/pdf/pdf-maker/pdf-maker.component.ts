import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GatewayService } from '../../gateway.service';
import { AskGeminiService } from '../../ask-gemini/ask-gemini.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pdf-maker',
  standalone: true,
  templateUrl: './pdf-maker.component.html',
  styleUrls: ['./pdf-maker.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class PdfMakerComponent {
  htmlContent = '';

  // Statut de l'envoi d'email : tant que le backend n'a pas EMAIL_SENDING_ENABLED=true,
  // le mode est toujours 'dry-run' (aucun email réellement envoyé).
  mailMode: 'dry-run' | 'live' | null = null;

  previewing = false;
  previewUrl: SafeResourceUrl | null = null;
  private previewObjectUrl: string | null = null;

  sendingAll = false;
  sendProgress = { sent: 0, total: 0 };
  sendSummary: { dryRun: number; live: number; errors: number } | null = null;

  // Pied de page de la page dynamique générée — rien n'est fixé dans l'image,
  // les deux textes sont entièrement saisis ici.
  footerLeftText = 'La Cravate Solidaire Paris';
  footerRightText = "Rapport d'activité 2025";

  // Administration du RA de base (document dans lequel la partie dynamique est insérée)
  raInfo: {
    exists: boolean;
    pageCount?: number;
    insertPage?: number;
    sizeBytes?: number;
    updatedAt?: string;
    error?: string;
  } | null = null;
  selectedRaFile: File | null = null;
  raInsertPage: number | null = null;
  updatingRa = false;
  raUpdateResult: { success: boolean; message: string } | null = null;

  constructor(
    private gatewayService: GatewayService,
    private askGeminiService: AskGeminiService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadHtmlTemplate();
    this.loadMailStatus();
    this.loadRaInfo();
  }

  /** Chargement du template HTML au démarrage */
  private loadHtmlTemplate() {
    this.http
      .get('assets/templates/modele_de_ra.html', { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.htmlContent = data;
          console.log('Template HTML chargé');
        },
        error: (err) => console.error('Erreur chargement HTML', err),
      });
  }

  private loadMailStatus() {
    this.gatewayService.getMailStatus().subscribe({
      next: (res) => (this.mailMode = res.mode),
      error: (err) => console.error('Erreur récupération statut mail', err),
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
    const { nom, prenom, blob } = await this.generatePdfBlobForBenev(benev);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nom}_${prenom}_RA.pdf`;
    a.click(); // ✅ Déclenchement dans le contexte du clic initial
    window.URL.revokeObjectURL(url);
  }

  /**
   * 👁️ Prévisualise le PDF du premier bénévole éligible, affiché inline
   * (pas de téléchargement) — pour vérifier le rendu avant un envoi éventuel.
   */
  previewFirstPdf() {
    this.previewing = true;
    this.clearPreview();

    this.gatewayService.benevolePdf().subscribe({
      next: async (data: any[]) => {
        if (!data.length) {
          console.error('Aucun bénévole éligible à prévisualiser');
          this.previewing = false;
          return;
        }
        try {
          const { blob } = await this.generatePdfBlobForBenev(data[0]);
          this.previewObjectUrl = window.URL.createObjectURL(blob);
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.previewObjectUrl
          );
        } catch (err) {
          console.error('Erreur génération aperçu PDF', err);
        } finally {
          this.previewing = false;
        }
      },
      error: (err) => {
        console.error('Erreur récupération bénévoles', err);
        this.previewing = false;
      },
    });
  }

  closePreview() {
    this.clearPreview();
  }

  private clearPreview() {
    if (this.previewObjectUrl) {
      window.URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
    this.previewUrl = null;
  }

  /**
   * ✉️ Envoie par email le rapport d'activité à tous les bénévoles éligibles.
   * Tant que le backend est en mode 'dry-run', RIEN n'est réellement envoyé :
   * chaque appel est simulé et loggé côté serveur.
   */
  sendAllEmails() {
    this.gatewayService.benevolePdf().subscribe({
      next: (data: any[]) => {
        const modeLabel =
          this.mailMode === 'live'
            ? 'RÉEL — les emails seront vraiment envoyés'
            : 'TEST (dry-run) — aucun email ne sera réellement envoyé';
        const confirmed = window.confirm(
          `Envoyer le rapport d'activité par email à ${data.length} bénévole(s) ?\n\nMode actuel : ${modeLabel}.`
        );
        if (!confirmed) return;

        this.runSendAll(data);
      },
      error: (err) => console.error('Erreur récupération bénévoles', err),
    });
  }

  private async runSendAll(data: any[]) {
    this.sendingAll = true;
    this.sendSummary = null;
    this.sendProgress = { sent: 0, total: data.length };

    const summary = { dryRun: 0, live: 0, errors: 0 };

    for (const benev of data) {
      try {
        const { nom, prenom, blob } = await this.generatePdfBlobForBenev(
          benev
        );

        if (!benev.mail) {
          console.warn(`Bénévole ${nom} ${prenom} sans email, ignoré.`);
          summary.errors++;
        } else {
          const formData = new FormData();
          formData.append('pdf', blob, `${nom}_${prenom}_RA.pdf`);
          formData.append('to', benev.mail);
          formData.append('benevNom', nom);
          formData.append('benevPrenom', prenom);
          formData.append('year', '2025');

          const result: any = await firstValueFrom(
            this.gatewayService.sendPdfByMail(formData)
          );
          if (result?.dryRun) summary.dryRun++;
          else summary.live++;
        }
      } catch (err) {
        console.error(`Erreur envoi email pour bénévole`, benev, err);
        summary.errors++;
      }
      this.sendProgress.sent++;
    }

    this.sendSummary = summary;
    this.sendingAll = false;
  }

  /** Construit le HTML personnalisé puis génère le PDF côté serveur pour un bénévole */
  private async generatePdfBlobForBenev(
    benev: any
  ): Promise<{ nom: string; prenom: string; blob: Blob }> {
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
      .replace('{{secteur 3}}', top_secteurs[2] || '')
      .replace('{{footer_left}}', this.footerLeftText || '')
      .replace('{{footer_right}}', this.footerRightText || '');

    const blob = await firstValueFrom(
      this.gatewayService.generatePdfFromHtml(htmlForBenev)
    );

    return { nom, prenom, blob: blob as Blob };
  }

  private capitalizeFirstLetter(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  }

  // ─────────────────────────────────────────────
  // Administration du RA de base
  // ─────────────────────────────────────────────

  private loadRaInfo() {
    this.gatewayService.getRaInfo().subscribe({
      next: (info) => {
        this.raInfo = info;
        this.raInsertPage = info?.insertPage ?? null;
      },
      error: (err) => console.error('Erreur récupération info RA', err),
    });
  }

  onRaFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedRaFile = input.files?.[0] ?? null;
    this.raUpdateResult = null;
  }

  updateRaDocument() {
    if (!this.selectedRaFile) return;

    const pageCountInfo = this.raInfo?.pageCount
      ? `Le RA actuel a ${this.raInfo.pageCount} page(s).`
      : '';
    const confirmed = window.confirm(
      `Remplacer le RA de base par "${this.selectedRaFile.name}" ?\n\n` +
        `${pageCountInfo} La partie dynamique sera insérée après la page ${this.raInsertPage}.\n\n` +
        `L'ancien RA sera sauvegardé automatiquement avant remplacement.`
    );
    if (!confirmed) return;

    this.updatingRa = true;
    this.raUpdateResult = null;

    const formData = new FormData();
    formData.append('ra', this.selectedRaFile);
    if (this.raInsertPage !== null) {
      formData.append('insertPage', this.raInsertPage.toString());
    }

    this.gatewayService.updateRa(formData).subscribe({
      next: (res) => {
        this.raUpdateResult = {
          success: true,
          message: `RA mis à jour : ${res.pageCount} page(s), insertion après la page ${res.insertPage}.`,
        };
        this.selectedRaFile = null;
        this.updatingRa = false;
        this.loadRaInfo();
      },
      error: (err) => {
        console.error('Erreur mise à jour RA', err);
        this.raUpdateResult = {
          success: false,
          message: err?.error?.error || 'Erreur lors de la mise à jour du RA.',
        };
        this.updatingRa = false;
      },
    });
  }
}
