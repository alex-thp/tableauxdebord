import {
  Controller,
  Post,
  UploadedFiles,
  Body,
  UseInterceptors,
  Res,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PdfMakerService } from '../../services/pdf-maker/pdf-maker.service';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';

@Controller('pdf')
export class PdfMakerController {
  candidatIndex = 0;

  constructor(private readonly pdfMakerService: PdfMakerService) {}

  retoursAtelier = [
    { nom: "AGOUZAL", prenom: "OTHMANE", date_et_lieu: "11/09/24 - Atelier mobile", verbatim: "Très satisfait en général, surtout des conseils de l'équipe chargée de la simulation des entretiens." },
    { nom: "DAGNON", prenom: "JASON", date_et_lieu: "11/09/24 - Atelier fixe", verbatim: "Je suis très content, non seulement de l'accueil que j'ai reçu, mais aussi des vêtements qui m'ont été offerts, et j'aimerais vous dire merci." },
    { nom: "BAAROUN", prenom: "WISSEM", date_et_lieu: "17/09/24 - Atelier mobile", verbatim: "Je me suis senti très à l'aise. Des personnes très cool, très gentilles et très professionnelles. Ça m'a fait du bien cette expérience, merci à toute l'équipe." },
    { nom: "BANGOURA", prenom: "ABOUBACAR", date_et_lieu: "19/09/24 - Atelier fixe", verbatim: "Comme je l’ai dit aux coachs, on ne repart pas d’ici bredouille. J’ai vraiment aimé cette rencontre et l’atelier auquel j’ai participé en début de semaine. Ça a été une expérience enrichissante." },
    { nom: "LEQUEN", prenom: "JEROME", date_et_lieu: "26/09/24 - Atelier mobile", verbatim: "J'ai été reçu et guidé avec beaucoup d'attention et de bienveillance par des personnes très à l'écoute, très professionnelles, qui ont su répondre à mes questions, me conseiller tout en me mettant à l'aise. Je tiens à les remercier." },
    { nom: "GREMEZ", prenom: "MAXIME", date_et_lieu: "19/10/24 - Atelier fixe", verbatim: "C’était très enrichissant et cela m’a permis de comprendre ce que je devais revoir pendant les entretiens pour mieux structurer mon discours." },
    { nom: "AISSAOUI", prenom: "FAYÇAL", date_et_lieu: "17/10/2024 - Atelier fixe", verbatim: "C'était un coaching très utile pour me valoriser et réussir un entretien d'embauche. Merci." },
    { nom: "JEAN-FRANCOIS", prenom: "MARLEY", date_et_lieu: "26/10/24 - Atelier fixe", verbatim: "C’était super, cela m'a permis d’améliorer mon attitude en entretien d'embauche, de revoir les différents points de mon CV ainsi que d’obtenir une tenue !" },
    { nom: "ARIYAI", prenom: "FARZAN", date_et_lieu: "14/10/24 - Atelier fixe", verbatim: "Bonjour, je suis très heureux d'être passé par cet atelier coup de pouce. Toutes les personnes qui y travaillent sont magnifiques. Je les remercie toutes et tous." },
    { nom: "SOUMAH", prenom: "SALIFOU", date_et_lieu: "17/10/24 - Atelier mobile", verbatim: "Je remercie l'initiative pour cet atelier. J'ai aimé, c'était cool, j'adore la tenue. Je suis très satisfait. Je remercie toute l'équipe qui est présente pour nous accompagner." },
    { nom: "TABALA", prenom: "GEORDDY", date_et_lieu: "17/10/24 - Atelier mobile", verbatim: "C'était cool, les gens sont agréables. Cela permet de trouver son identité professionnelle et d'avoir une tenue pro pour aller en entretien." },
    { nom: "MEKOUEN", prenom: "TIMOTHEE", date_et_lieu: "19/10/24 - Atelier fixe", verbatim: "Je suis très satisfait de mon passage, cela m’a permis de découvrir d’autres expériences en entretien afin de réussir un futur entretien d’embauche." },
    { nom: "SAMBA", prenom: "MODOU", date_et_lieu: "04/11/24 - Atelier fixe", verbatim: "C'était incroyable, bien accueilli, et durant l'entretien on m’a conseillé sur ma posture et ma manière de parler. Franchement, vous avez répondu à mes attentes et c'était un plaisir de participer à cet atelier. Merci !" },
    { nom: "GARBA", prenom: "IBRAHIM", date_et_lieu: "06/11/24 - Atelier fixe", verbatim: "C’était vraiment agréable. J’ai aimé cet atelier car j'ai appris comment me comporter, les questions qu’on peut me poser, et je vous remercie pour l’ensemble veste et chaussures. Merci une fois de plus à vous." },
    { nom: "SYLLA", prenom: "SÉKOU", date_et_lieu: "09/11/24 - Atelier fixe", verbatim: "Enrichissant de dingue ! J’ai bien aimé pour la suite de mes recherches, un vrai coup de pouce ! Des personnes géniales." },
    { nom: "BOUFOUROU", prenom: "SYFEDINE", date_et_lieu: "14/11/24 - Atelier fixe", verbatim: "J'ai beaucoup apprécié cet atelier. Cela m'a permis d'en apprendre plus sur les entretiens et les postures professionnelles. Merci." },
    { nom: "MARIE", prenom: "JEAN-MANUEL", date_et_lieu: "15/11/24 - Atelier fixe", verbatim: "Très instructif, de bons conseils vestimentaires et également personnels sur l'attitude, comment me mettre en avant, avoir confiance en moi et me vendre en entretien." },
    { nom: "BIBI", prenom: "MOUSSA", date_et_lieu: "19/11/24 - Atelier fixe", verbatim: "C'était une découverte pour moi, mais j'ai aimé qu'on me mette en confiance et que je sois écouté. Je les remercie pour ça !" },
    { nom: "AGNON", prenom: "LARIOS", date_et_lieu: "20/11/24 - Atelier fixe", verbatim: "Très enrichissant. Tout le monde est convivial, l'atelier est rassurant. On repart d'ici la tête pleine de conseils. Belle expérience." },
    { nom: "SAINVIL", prenom: "FRANTZ", date_et_lieu: "20/11/24 - Atelier fixe", verbatim: "La cravate c'est trop bien ! Ce que j'ai vécu aujourd'hui m'a aidé et m'a fait du bien, je suis vraiment satisfait." },
    { nom: "BITEGUE_DIT_MANGA", prenom: "YANIS", date_et_lieu: "28/11/24 - Atelier fixe", verbatim: "Équipe moderne et accueillante. J’ai été impressionné par l’ambiance chaleureuse et le cœur que mettent les bénévoles et salariés à l’ouvrage." },
    { nom: "DIAOUNE", prenom: "DIAWOYE", date_et_lieu: "30/11/24 - Atelier fixe", verbatim: "Un bon accueil bien chaleureux. Une bonne voie pour décrocher un travail. Très content d'avoir connu ce lieu." },
    { nom: "DELMAS", prenom: "VINCENT", date_et_lieu: "30/11/24 - Atelier fixe", verbatim: "Accueil très sympathique, personnel avenant et impliqué. Nous avons le sentiment de repartir avec de bonnes bases pour mener à bien notre aventure professionnelle." },
    { nom: "DIABATE", prenom: "Lonceny", date_et_lieu: "7/12/24 - Atelier fixe", verbatim: "J'ai beaucoup aimé, je me sens très bien et j'ai appris plein de choses ici sur les entretiens d'embauche. Je suis très content. Le costume me va très bien." },
    { nom: "SIGNORI", prenom: "YANN", date_et_lieu: "7/12/24 - Atelier fixe", verbatim: "Un moment de partage et de bons conseils dans une atmosphère incroyablement chaleureuse. On se sent à l’aise pour les entretiens. Super accueil, équipe de professionnels." },
    { nom: "OUEADROGO", prenom: "VERONIQUE", date_et_lieu: "13/12/24 - Atelier fixe", verbatim: "J'ai été très bien accueillie, mise à l'aise, dans une ambiance très bienveillante et détendue. Cela m'a beaucoup aidée dans mon parcours. Énorme merci à toute l'équipe." },
    { nom: "PINVILLE", prenom: "THIERRY", date_et_lieu: "18/12/24 - Atelier fixe", verbatim: "Les personnes qui nous ont reçus ont été très attentives à notre personne et nous ont donné l’envie de persévérer dans nos recherches et de réussir à trouver un travail. Merci beaucoup." },
    { nom: "CISSE", prenom: "IBRAHIMA", date_et_lieu: "10/01/24 - Atelier fixe", verbatim: "Toute l’équipe est très accueillante, ils ont su me mettre à l’aise. Bonne ambiance, franchement rien à changer. C'était un super moment. Si c’était à refaire, je le referais sans hésitation. Merci." },
    { nom: "MENDES", prenom: "ZILDA", date_et_lieu: "19/01/24 - Atelier fixe", verbatim: "J'ai beaucoup aimé mon passage à la Cravate, le choix de tenue ainsi que la simulation d'entretien m'ont été très utiles. Cela me sera utile pour mes futurs entretiens d'embauche." },
    { nom: "AVODANOU", prenom: "AYABA", date_et_lieu: "24/01/24 - Atelier mobile", verbatim: "Je suis satisfaite de l'opportunité que l'atelier donne à toute personne qui en a besoin. Je me sens mieux pour mon prochain entretien. Merci." },
    { nom: "LOUDIERE", prenom: "JOYCE", date_et_lieu: "30/01/24 - Atelier fixe", verbatim: "L’atelier m’a reboostée et m’a aidée à reprendre confiance en moi. L’équipe est vraiment joyeuse, avec une super ambiance." },
    { nom: "IDJABOU", prenom: "MOHAMED", date_et_lieu: "1/02/24 - Atelier mobile", verbatim: "L’atelier m'a redonné confiance en moi." },
    { nom: "LESSUEUR", prenom: "RYAN", date_et_lieu: "1/02/24 - Atelier mobile", verbatim: "Une excellente préparation aux entretiens, encadrée par des personnes dévouées et très sympathiques :)." },
    { nom: "DATCHA_ADIA", prenom: "LUC", date_et_lieu: "2/02/24 - Atelier fixe", verbatim: "Ça m'a beaucoup apporté, j'ai envie de rester. L'humour que vous avez apporté, l'accueil était top. J'ai appris comment me tenir en face d'un patron... c'est inoubliable, je vous remercie pour ça." },
    { nom: "SAGANOGO", prenom: "DJELEA", date_et_lieu: "23/02/24 - Atelier fixe", verbatim: "D'abord, avec les coachs en image, je sais désormais comment m'habiller pour un entretien. Ensuite, j'ai été reboosté par les coachs lors de mon entretien et prendrai en compte leurs conseils. C'était enrichissant pour moi, ce moment de coaching, et je le recommande." },
    { nom: "AICHAT TAKIDINE", prenom: "SALIM", date_et_lieu: "09/03/24 - Atelier fixe", verbatim: "L'atelier m'a permis de rencontrer des personnes sympas, de sortir de ma zone de confort, de visualiser mes faiblesses et d'apprendre à les améliorer, et surtout d'avoir confiance en moi !" },
    { nom: "GOURPIL", prenom: "MARTHE", date_et_lieu: "15/03/24 - Atelier fixe", verbatim: "J’avais un réel besoin de connaître mon blocage, pourquoi je ne réussissais pas mes entretiens. Les conseils sur comment parler de moi et le changement vestimentaire m'ont fait du bien. Être venue chez vous m'a vraiment fait du bien. Ça m'a aidée à savoir quoi changer et comment. Maintenant, je suis plus rassurée pour aller plus loin dans mes recherches." },
    { nom: "CHARMI", prenom: "MEHDI", date_et_lieu: "23/03/24 - Atelier fixe", verbatim: "Je suis confiant et je me sens entièrement prêt pour mon futur entretien, notamment grâce au coaching d'entretien d'embauche et surtout grâce à la professionnalisation de mon image, grâce à la tenue professionnelle fournie par La Cravate Solidaire. Merci beaucoup !!" },
    { nom: "MOKHBI", prenom: "AGNES", date_et_lieu: "28/03/24 - Atelier mobile", verbatim: "Mon passage à la Cravate a été un moment très agréable, très utile, rassurant et encourageant pour la suite de mes recherches d'emploi. J'arrive à mieux situer mes axes de progression et ce que je dois mettre en avant pour optimiser mes chances d'obtenir un emploi. Mais j'ai aussi beaucoup repris confiance en moi lors de ce passage. Merci." },
    { nom: "BREME", prenom: "MALARMADI", date_et_lieu: "02/04/2024 - Atelier mobile", verbatim: "Une très sympathique expérience. L'accueil de l'équipe est chaleureux. J'ai apprécié les conseils pertinents à apporter sur mon CV ainsi que ma lettre de motivation. Je félicite et remercie l'équipe pour son concept. Selon moi, il est bénéfique aussi bien pour les novices que pour les personnes aguerries." },
    { nom: "LELIEVRE", prenom: "ELODIE", date_et_lieu: "12/04/2024 - Atelier fixe", verbatim: "Je suis très heureuse de cette journée. J'ai reçu beaucoup de soutien dans une période pas facile, j'avais perdu confiance en moi et en mes projets professionnels. Venir chez vous m'a reboostée. Un immense merci à toute l'équipe !!!" },
    { nom: "NGUEGANG", prenom: "JOELLE", date_et_lieu: "26/04/2024 - Atelier fixe", verbatim: "J'ai appris comment mieux me valoriser pendant mon entretien en m'appuyant davantage sur mon projet professionnel du passé, et à identifier mes qualités professionnelles pour les relier à celles que je rencontrerai dans mon futur métier. Merci pour votre aide !" },
    { nom: "SBAA", prenom: "SONIA", date_et_lieu: "01/06/2025 - Atelier fixe", verbatim: "Je suis très satisfaite de l'atelier entretien RH. Merci beaucoup pour votre accueil et les conseils pour me présenter. J'ai pu sortir avec une tenue vestimentaire de mon choix et qui me va bien. Bonne expérience +++" },
    { nom: "DESIR", prenom: "YANIS", date_et_lieu: "08/06/2024 - Atelier fixe", verbatim: "Juste incroyable, un accompagnement aux petits oignons, des personnes chaleureuses, et je suis ressorti avec plein de conseils ! Vraiment merci pour votre bienveillance et votre soutien. C'est ce dont j'avais besoin !" }
  ];


  // ------------------ UTILITAIRE ------------------
  private toBase64DataUrl(filePath: string, mimeType: string): string {
    if (!fs.existsSync(filePath)) return '';
    const fileBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
    return `data:${mimeType};base64,${fileBase64}`;
  }

  private async getPhotoCandidat(
  retoursAtelier: { nom: string; prenom: string; date_et_lieu?: string; verbatim?: string }[],
  indexActuel: number,
): Promise<{ photoPath: string; candidat: any }> {
  if (!retoursAtelier || retoursAtelier.length === 0) {
    return { photoPath: '', candidat: null };
  }

  const total = retoursAtelier.length;
  let attempts = 0;
  let photoPath = '';
  let currentIndex = indexActuel;

  while (attempts < total) {
    const candidat = retoursAtelier[currentIndex];
    if (candidat && candidat.nom && candidat.prenom) {
      const fileName = `${candidat.nom.toUpperCase()}_${candidat.prenom.toUpperCase()}.jpg`;
      const fullPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'photos_candidats',
        fileName,
      );

      if (fs.existsSync(fullPath)) {
        const resizedDir = path.join(process.cwd(), 'uploads', 'RA_benevole', 'photos_candidats', 'resized');
        if (!fs.existsSync(resizedDir)) fs.mkdirSync(resizedDir, { recursive: true });

        const resizedPath = path.join(resizedDir, fileName);
        await sharp(fullPath)
          .rotate()
          .resize({ width: 1000, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(resizedPath);

        photoPath = resizedPath;
        return { photoPath, candidat };
      }
    }

    currentIndex = (currentIndex + 1) % total;
    attempts++;
  }

  return { photoPath: '', candidat: null };
}
  // ------------------ GENERATION PDF ------------------
  @Post('generate')
async generatePdf(@Body('html') html: string, @Res() res: Response) {
  try {
    if (!html) return res.status(400).send('Aucun HTML fourni');

    // ------------------ Images fixes ------------------
    const images = {
      fondPage: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Fond_page/fond_1.png'), 'image/png'),
      persoOrdi: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/personnage_ordi_haut_de_page.png'), 'image/png'),
      route: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/ROUTE_1.png'), 'image/png'),
      persoDepart: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/personnage_depart.png'), 'image/png'),
      persoRh: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/personnage_rh_2.png'), 'image/png'),
      verbatim1: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/Verbatim_1.png'), 'image/png'),
      verbatim2: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/Verbatim_2.png'), 'image/png'),
      persoCoteVeste: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/personnage_cote_veste.png'), 'image/png'),
      panneau: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/panneau.png'), 'image/png'),
      herbe: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/herbe.png'), 'image/png'),
      fleur: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/fleur.png'), 'image/png'),
      fleur2: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/fleur_2.png'), 'image/png'),
      papillon: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/papillons.png'), 'image/png'),
      mapImg: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/map.png'), 'image/png'),
      un: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/1.png'), 'image/png'),
      deux: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/2.png'), 'image/png'),
      trois: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/3.png'), 'image/png'),
      photoAction: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/photo_action.png'), 'image/png'),
    };

    // ------------------ Candidat et photo ------------------
    const { photoPath: photoCandidatPath, candidat: candidatCourant } = await this.getPhotoCandidat(
      this.retoursAtelier,
      this.candidatIndex
    );

    if (!candidatCourant) return res.status(404).send('Aucun candidat trouvé');

    // Incrémenter l'index pour le prochain PDF
    this.candidatIndex = (this.candidatIndex + 1) % this.retoursAtelier.length;

    const photoCandidatBase64 = photoCandidatPath ? fs.readFileSync(photoCandidatPath, { encoding: 'base64' }) : '';
    const photoCandidatDataUrl = `data:image/jpeg;base64,${photoCandidatBase64}`;
    const verbatimCandidat = candidatCourant.verbatim || '';
    const signatureCandidat = `${candidatCourant.prenom.toUpperCase()} - ${candidatCourant.date_et_lieu || ''}`;

    // ------------------ Remplacement des placeholders ------------------
    let htmlContent = html
      .replace('{{fondUrl}}', images.fondPage)
      .replace('{{personnageUrl}}', images.persoOrdi)
      .replace('{{routeUrl}}', images.route)
      .replace('{{persoDepartUrl}}', images.persoDepart)
      .replace('{{persoRhUrl}}', images.persoRh)
      .replace('{{verbatim1Url}}', images.verbatim1)
      .replace('{{verbatim2Url}}', images.verbatim2)
      .replace('{{persoCoteVesteUrl}}', images.persoCoteVeste)
      .replace('{{panneauUrl}}', images.panneau)
      .replace('{{panneau2Url}}', images.panneau)
      .replace('{{panneau3Url}}', images.panneau)
      .replace('{{herbeUrl}}', images.herbe)
      .replace('{{fleurUrl}}', images.fleur)
      .replace('{{fleur2Url}}', images.fleur2)
      .replace('{{papillonUrl}}', images.papillon)
      .replace('{{mapUrl}}', images.mapImg)
      .replace('{{unUrl}}', images.un)
      .replace('{{deuxUrl}}', images.deux)
      .replace('{{troisUrl}}', images.trois)
      .replace('{{photoUrl}}', images.photoAction)
      .replace('{{photoCandidatUrl}}', photoCandidatDataUrl)
      .replace('{{verbatimCandidat}}', verbatimCandidat)
      .replace('{{signatureCandidat}}', signatureCandidat);

    // ------------------ Génération PDF ------------------
    const page1Pdf: Buffer = await this.pdfMakerService.generatePdfFromHtml(htmlContent, 0);
    const pdfPath = path.join(process.cwd(), 'uploads/RA_benevole/LCS_RA.pdf');
    const pdf2Buffer = fs.readFileSync(pdfPath);
    const finalPdf = await this.pdfMakerService.mergePdfAtPosition(pdf2Buffer, page1Pdf, 29);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="generated.pdf"',
    });
    res.send(finalPdf);

  } catch (err) {
    console.error('❌ Erreur génération PDF bénévole :', err);
    res.status(500).send('Erreur génération PDF bénévole');
  }
}

  // ------------------ RÉCUPÉRATION BÉNÉVOLE ------------------
  @Get('benevolePdf')
  async generateBenevolePdf() {
    return this.pdfMakerService.getDataToGeneratePdf();
  }

  // ------------------ MERGE PDF SIMPLE ------------------
  @Post('merge')
  @UseInterceptors(FilesInterceptor('files', 2))
  async mergePdf(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      if (!files || files.length !== 2) return res.status(400).send('Deux fichiers PDF sont requis.');
      const [fileOriginal, fileInsert] = files;
      let pdfBuffer = await this.pdfMakerService.mergePdfSimple(fileOriginal.buffer, fileInsert.buffer);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
      });
      const pdfPath = path.join(process.cwd(), 'uploads/RA_benevole/LCS_RA.pdf');
      const pdf2Buffer = fs.readFileSync(pdfPath);
      
      pdfBuffer = await this.pdfMakerService.mergePdfAtPosition(pdf2Buffer, pdfBuffer, 29)
      res.send(pdfBuffer);
    } catch (err) {
      console.error('❌ Erreur fusion PDF :', err);
      res.status(500).send('Erreur lors de la fusion des PDF.');
    }
  }
}
