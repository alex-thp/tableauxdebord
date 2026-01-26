import { GenerateImagesConfig } from '@google/genai';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { GeminiService } from './../../services/gemini/gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private geminiService: GeminiService) {}

  @Post('default')
  async askGemini(@Body('question') question: string): Promise<any> {
    console.log('Question reçue :', question);
    const instruction =
      "Your answer has to have this JSON format : { action: 'action_name', action_localite: 'locality_name', sujet: 'subject_name', sujet_localite: 'suject_localité', sujet_critère: 'critère' }. The input is a description of an activity we have to achieve. The format you answer is an object that helps an algorithm calculate the activity. For example if the input is : Nous allons accompagner des candidats au rsa en atelier fixe dans Paris, the output should be : { action: 'Accompagnement - CDP Fixe', action_localite: '75', sujet: 'Candidat', sujet_localite: '', sujet_critère: 'RSA' }. Tout ce qui n'est pas explicitement indiqué ne doit pas être défini, en particulier pour sujet_localite et action_localite. Attention à bien différencier action_localite de sujet_localite: un lieu lié à l'action ira dans action_localite tandis qu'un lieu lié au sujet ira dans sujet_localite. Point de vigilance : le format de réponse est un format JSON. Il faut faire attention aux guillemets et ne pas les mettre n'importe où. action_localite, sujet_localite, sujet_critere sont des arrays. les possibilités d'action sont : Accompagnement - Atelier Bien-être, Accompagnement - Atelier Collectif, Accompagnement - Atelier Un temps pour elle, Accompagnement - CDP + Atelier collectif, Accompagnement - CDP Feminin, Accompagnement - CDP Fixe, Accompagnement - CDP Fixe ou Mobile, Accompagnement - CDP Mobile, Accompagnement - CDPALM, Accompagnement - Mentorat, PC - Bénévole, PC - Site, PC - Tri, Nouveaux partenariats, Formation, PC - Fresque, PC - Presentation. PC singnifie Parcours Cravate, ce terme est utilisé pour qualifier un ensemble d'actions regroupant de la mobilisation de collaborateurs avec une entreprise partenaire. Si l'action n'est pas accompagnée de fixe ou de mobile alors elle sera Accompagnement - Fixe ou Mobile. Les sujets possibles sont : Candidat, Atelier, Bénévole, Site, Tri, Structure prescriptrice, Association, Référent.";
    return this.geminiService.askGemini(question, instruction);
  }

  @Post('rapport_activite')
  async askGeminiToSelect(@Body('question') question: string[]): Promise<any> {
    console.log('Question reçue :', question);
    const instruction =
      "Here is a list of what we will call 'Verbatim' associated to a benevole that you can identify using the nom and prenom field. You have to select the three that suits the best to the following rules: 1. A Verbatim can't be choose if it contains any insult or any bad word. 2. The verbatim has to be nice. By nice I mean that it has to be positive. 3. The more the verbatim is talking about the benevole, the more it has to be selected if it is a positive one. 4. The longest a Verbatim is, the best it is. Netherless, the verbatim shouldn't be too long. (600 char maximum). 5. The verbatim should not be about someone but it can be about the team or the structure. 6. The verbatim has to be understandable. If it is not understandable, it can't be selected. 7. The verbatim has to be relevant with the benevole's activity. If it is not relevant, it can't be selected. 8. The verbatim has to be grammatically correct. If it is not grammatically correct, it can't be selected. 9. The verbatim has to be unique. If two verbatims are very similar, only one of them can be selected. 10. The verbatim has to be in French.";

    return this.geminiService.askGeminiArray(question, instruction);
  }
}
