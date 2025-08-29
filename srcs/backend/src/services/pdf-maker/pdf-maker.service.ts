import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import puppeteer from 'puppeteer';
import { MongoDbService } from '../mongo-db/mongo-db.service';
import { AirtableService } from '../airtable/airtable.service';

type MulterFile = {
  path: string;
  mimetype: string;
};

@Injectable()
export class PdfMakerService {

  constructor(private mongodbService: MongoDbService, private airtableService: AirtableService){}

  async getDataToGeneratePdf() {
    const benev = await this.mongodbService.getTable('benevs');

const pipeline = [
  {
    $lookup: {
      from: "cdpenrbenevs",
      let: { cdpIds: "$cdp_x_benev" }, // tableau de record_id (strings)
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $in: ["$record_id", "$$cdpIds"] },
                { $gte: ["$date_atelier", new Date("2024-01-01")] },
                { $lte: ["$date_atelier", new Date("2024-12-31")] },
                { $eq: ["$statut", "Présent"] },
              ]
            }
          }
        },
        {
          $lookup: {
            from: "cdpenrcandxcdpenrbenevs",
            let: { matchingIds: "$matchings" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$record_id", "$$matchingIds"]
                  }
                }
              }
            ],
            as: "matchings_docs"
          }
        },
        {
          $unwind: {
            path: "$matchings_docs",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "cdpenrcands",
            localField: "matchings_docs.cdp_enr_cand_record_id",
            foreignField: "record_id",
            as: "cand"
          }
        },
        {
          $unwind: {
            path: "$cand",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "cdpsuivis",
            localField: "cand.candidat_record_id",
            foreignField: "candidat_record_id",
            as: "cdp_suivis"
          }
        },
        {
          $addFields: {
            "cand.cdp_suivi": "$cdp_suivis"
          }
        },
        {
          $project: {
            cdp_suivis: 0
          }
        }
      ],
      as: "cdp_x_benev" // champ enrichi dans benevs
    }
  },
  {
    // ✅ Ne garde que les benevs ayant au moins un lien avec un cdpenrbenev
    $match: {
      "cdp_x_benev.0": { $exists: true }
    }
  },
  {
    $project: {
      record_id: 1,
      benev_structure: 1,
      cdp_x_benev: 1,
      nom: 1,
      prenom: 1,
      mail: 1,
    }
  }
];
    const result = await benev.aggregate(pipeline).toArray();
    console.log("ready to return")
    return result;
  }

  private getRange(from: number, to: number, max: number): number[] {
  const safeFrom = Math.max(0, from - 1);
  const safeTo = Math.min(max - 1, to - 1);
  if (safeFrom > safeTo) {
    throw new Error(`❌ Plage invalide : from ${from} > to ${to}`);
  }
  return Array.from({ length: safeTo - safeFrom + 1 }, (_, i) => i + safeFrom);
}

async mergePdfAtIndex(
  file1: Express.Multer.File, 
  file2: Express.Multer.File, 
  index: number, 
): Promise<Buffer> {
  try {
    const pdf1 = await PDFDocument.load(file1.buffer);
    const pdf2 = await PDFDocument.load(file2.buffer);
    const mergedPdf = await PDFDocument.create();

    const pages1 = await mergedPdf.copyPages(pdf1, this.getRange(1, index, pdf1.getPageCount()));
    const insertedPages = await mergedPdf.copyPages(pdf2, this.getRange(1, pdf2.getPageCount(), pdf2.getPageCount()));
    const pages2 = await mergedPdf.copyPages(pdf1, this.getRange(index, pdf1.getPageCount(), pdf1.getPageCount()));

    pages1.forEach((page) => mergedPdf.addPage(page));
    insertedPages.forEach((page) => mergedPdf.addPage(page));
    pages2.forEach((page) => mergedPdf.addPage(page));

    const mergedPdfBytes = await mergedPdf.save();
    return Buffer.from(mergedPdfBytes);
  } catch (error) {
    console.error('❌ Erreur dans mergePdf:', error);
    throw error;
  }
}

async mergePdf(
  file1: Express.Multer.File, 
  file2: Express.Multer.File, 
  from1: number, 
  to1: number, 
  from2: number, 
  to2: number
): Promise<Buffer> {
  try {
    console.log('➡️ mergePdf - Plages demandées:', { from1, to1, from2, to2 });

    const pdf1 = await PDFDocument.load(file1.buffer);
    const pdf2 = await PDFDocument.load(file2.buffer);
    const mergedPdf = await PDFDocument.create();

    const pages1 = await mergedPdf.copyPages(pdf1, this.getRange(from1, to1, pdf1.getPageCount()));
    const insertedPages = await mergedPdf.copyPages(pdf2, this.getRange(1, pdf2.getPageCount(), pdf2.getPageCount()));
    const pages2 = await mergedPdf.copyPages(pdf1, this.getRange(from2, to2, pdf1.getPageCount()));

    pages1.forEach((page) => mergedPdf.addPage(page));
    insertedPages.forEach((page) => mergedPdf.addPage(page));
    pages2.forEach((page) => mergedPdf.addPage(page));

    const mergedPdfBytes = await mergedPdf.save();
    return Buffer.from(mergedPdfBytes);
  } catch (error) {
    console.error('❌ Erreur dans mergePdf:', error);
    throw error;
  }
}

/*async generatePdfFromHtml(html: string, rotation: number): Promise<Buffer> {
  console.log('➡️ generatePdfFromHtml - Génération PDF à partir du HTML');
    const browser = await puppeteer.launch({
      headless: true, // depuis Puppeteer v20
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // utile en prod / docker
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }*/

async generatePdfFromHtml(html: string, rotation: number): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Viewport standard
  await page.setViewport({ width: 1200, height: 1600 });
  await page.emulateMediaType('screen');

  const htmlWithStyles = `
    <html>
      <head>
        <style>
          @page { size: A4 ${rotation === 1 ? 'landscape' : 'portrait'}; margin: 10mm; }
          body { margin: 0; padding: 0; }
          .pdf-container { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="pdf-container">${html}</div>
      </body>
    </html>
  `;

  await page.setContent(htmlWithStyles, { waitUntil: 'networkidle0' });

  // Scale légèrement réduit si paysage pour éviter la page blanche
  const scale = rotation === 1 ? 0.87 : 1;

  const pdfBuffer = await page.pdf({
    format: 'A4',
    landscape: rotation === 1,
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    scale,
    preferCSSPageSize: true,
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}
}
