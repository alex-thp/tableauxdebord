import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class GeminiService {
    private genAI: GoogleGenAI; // Utilisez cette instance partout

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Correction du message d'erreur pour correspondre à la variable recherchée
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }

    this.genAI = new GoogleGenAI({ apiKey: apiKey });
  }

  // Supprimez cette ligne car elle initialise une nouvelle instance avec une clé invalide
  // ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" }); 

  async askGemini(question) {
    // Utilisez l'instance correctement initialisée this.genAI
    const response = await this.genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: question,
      config: {
        systemInstruction: "Your answer has to have this JSON format : { action: 'action_name', action_localite: 'locality_name', sujet: 'subject_name', sujet_localite: 'suject_localité', sujet_critère: 'critère' }. The input is a description of an activity we have to achieve. The format you answer is an object that helps an algorithm calculate the activity. For example if the input is : Nous allons accompagner des candidats au rsa en atelier fixe dans Paris, the output should be : { action: 'Accompagnement - CDP Fixe', action_localite: '75', sujet: 'Candidat', sujet_localite: '', sujet_critère: 'RSA' }. Tout ce qui n'est pas explicitement indiqué ne doit pas être défini, en particulier pour sujet_localite et action_localite. Attention à bien différencier action_localite de sujet_localite: un lieu lié à l'action ira dans action_localite tandis qu'un lieu lié au sujet ira dans sujet_localite. Point de vigilance : le format de réponse est un format JSON. Il faut faire attention aux guillemets et ne pas les mettre n'importe où. action_localite, sujet_localite, sujet_critere sont des arrays. les possibilités d'action sont : Accompagnement - Atelier Bien-être, Accompagnement - Atelier Collectif, Accompagnement - Atelier Un temps pour elle, Accompagnement - CDP + Atelier collectif, Accompagnement - CDP Feminin, Accompagnement - CDP Fixe, Accompagnement - CDP Fixe ou Mobile, Accompagnement - CDP Mobile, Accompagnement - CDPALM, Accompagnement - Mentorat, PC - Bénévole, PC - Site, PC - Tri, Nouveaux partenariats, Formation, PC - Fresque, PC - Presentation. PC singnifie Parcours Cravate, ce terme est utilisé pour qualifier un ensemble d'actions regroupant de la mobilisation de collaborateurs avec une entreprise partenaire. Si l'action n'est pas accompagnée de fixe ou de mobile alors elle sera Accompagnement - Fixe ou Mobile. Les sujets possibles sont : Candidat, Atelier, Bénévole, Site, Tri, Structure prescriptrice, Association, Référent.",
      },
    });
    console.log(response.text);
    return { text: response.text };
  }
}
