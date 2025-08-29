import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GatewayService } from '../../gateway.service';
import { AskGeminiService } from '../../ask-gemini/ask-gemini.service';

@Component({
  selector: 'app-pdf-maker',
  templateUrl: './pdf-maker.component.html',
  styleUrls: ['./pdf-maker.component.css'],
  imports: [FormsModule],
})
export class PdfMakerComponent {
  fileOriginal!: File;
  fileInsert!: File;
  htmlContent: string = '<h1>Hello PDF</h1><p>Ce texte vient du champ HTML</p>';

  formData = {
    fromFile1: 1,
    toFile1: 1,
    fromFile2: 1,
    toFile2: 1,
  };

  insertData = {
    index: 1,
  }

  constructor(private gatewayService: GatewayService, private askGeminiService: AskGeminiService) {}

  onFileChange(event: Event, type: 'original' | 'insert') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (type === 'original') {
        this.fileOriginal = input.files[0];
      } else {
        this.fileInsert = input.files[0];
      }
    }
  }

  mergeByIndex() {
    const insertData = new FormData();
    insertData.append('files', this.fileOriginal);
    insertData.append('files', this.fileInsert);
    insertData.append('index', this.insertData.index.toString());

    this.gatewayService.mergePdfAtIndex(insertData).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de la fusion du PDF :', error);
      }
    });

  }

  onSubmit() {
    const formData = new FormData();
    formData.append('files', this.fileOriginal);
    formData.append('files', this.fileInsert);
    formData.append('fromFile1', this.formData.fromFile1.toString());
    formData.append('toFile1', this.formData.toFile1.toString());
    formData.append('fromFile2', this.formData.fromFile2.toString());
    formData.append('toFile2', this.formData.toFile2.toString());

    this.gatewayService.mergePdf(formData).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de la fusion du PDF :', error);
      }
    });
  }

  generatePdf() {
    this.gatewayService.generatePdfFromHtml(this.htmlContent).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mon_pdf.pdf';
      a.click();
    });
  }

  benevolePdf() {
    this.gatewayService.benevolePdf().subscribe((response) => {
      let note_satisfaction = 0;
      let nb_notes = 0;
      console.log('Bénévole PDF response:');
      const data = response as any[]; // 👈 cast ici
      let benevStats : { 
        nom?: string, 
        prenom?: string,
        mail?: string,
        print_secteur?: string, 
        nb_cand_acc?: number, 
        note_satisfaction?: number, 
        nb_notes?: number,
        verbatims?: string[],
      } = {};
      let benevoles: any[] = [];
      data.forEach(benev => {
        let verbatims = [];
        const benev_nom = this.capitalizeFirstLetter(benev.nom) || 'Inconnu';
        const benev_prenom = this.capitalizeFirstLetter(benev.prenom) || 'Inconnu';
        console.log(`Bénévole: ${benev_nom} ${benev_prenom}`);
        benevStats.nom = benev_nom;
        benevStats.prenom = benev_prenom;
        benevStats.mail = benev.mail || 'Inconnu@gmail.com';
        if (benev.cdp_x_benev && benev.cdp_x_benev.length > 0 && benev_nom != "Inconnu" && benev_prenom != "Inconnu") {
        const secteurCount: { [secteur: string]: number } = {};
          for (const cdp of benev.cdp_x_benev || []) {
            note_satisfaction += cdp?.cand?.note_satisfaction;
            nb_notes++;
            const secteur = cdp?.cand?.secteur_recherche;
            verbatims.push(cdp?.verbatim);
            if (secteur) {
              secteurCount[secteur] = (secteurCount[secteur] || 0) + 1;
            }
          }

        // 🔎 Affiche le classement dans la console
        const sorted = Object.entries(secteurCount)
          .sort((a, b) => b[1] - a[1]) // tri décroissant
          .map(([secteur, count]) => ({ secteur, count }));
          const print_secteur = `- ${sorted[0]?.secteur}\\n- ${sorted[1]?.secteur}\\n- ${sorted[2]?.secteur}`
          benevStats.print_secteur = print_secteur;
        const nb_cand_acc = benev.cdp_x_benev?.length || 0;
        benevStats.nb_cand_acc = nb_cand_acc;
        benevStats.note_satisfaction = note_satisfaction;
        benevStats.nb_notes = nb_notes;
        benevStats.verbatims = verbatims;
    }
    note_satisfaction = 0;
    nb_notes = 0;
    verbatims = [];
    benevoles.push(benevStats);
    benevStats = {};
  });
      console.table(benevoles);
      console.log('Fin de la fonction');
    });
    }

    capitalizeFirstLetter(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}