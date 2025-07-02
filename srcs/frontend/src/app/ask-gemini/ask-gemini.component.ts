import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AskGeminiService } from './ask-gemini.service';

interface Indicateur {
  action: string;
  action_localite: [string];
  sujet: string;
  sujet_localite: [string];
  sujet_critere: [string];
  [key: string]: string | string[];
}

@Component({
  selector: 'app-ask-gemini',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './ask-gemini.component.html',
  styleUrls: ['./ask-gemini.component.css']
})
export class AskGeminiComponent {
  question: string = '';
  answer: string = '';
  indicateur: Indicateur | null = {
    action: '',
    action_localite: [''],
    sujet: '',
  sujet_localite: [''],
  sujet_critere: [''],
};

  constructor(private askGeminiService: AskGeminiService) {}

  askGemini(question: string) {
  this.askGeminiService.askGemini(question).subscribe(response => {
    try {
      // Nettoyer le markdown
      let cleanedText = response.text.replace(/```json|```/g, '').trim();

      // S'assurer que les clés sont entre guillemets
      cleanedText = cleanedText.replace(/(\w+):/g, '"$1":');

      this.answer = cleanedText;

      // Parser
      this.indicateur = JSON.parse(cleanedText);

      console.log('Parsed Indicateur:', this.indicateur);
    } catch (error) {
      console.error('Erreur de parsing JSON :', error);
    }
  });
}

  saveModifications() {
    console.log('Données modifiées :', this.indicateur);
    // À connecter à une API POST/PUT si besoin
  }

  getKey(key: unknown): string {
    return key as string;
  }
}
