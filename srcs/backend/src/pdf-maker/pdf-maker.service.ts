import { Injectable, InternalServerErrorException } from '@nestjs/common';
import PDFMerger from 'pdf-merger-js';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
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
          let: { benevId: "$record_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$benevole_id", "$$benevId"] },
                    { $gte: ["$date_atelier", new Date("2024-01-01")] },
                    { $lte: ["$date_atelier", new Date("2024-12-31")] }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "cdpenrcandxcdpenrbenevs",
                localField: "record_id",
                foreignField: "record_id",
                as: "matchings"
              }
            },
            {
              $unwind: {
                path: "$matchings",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "cdpenrcands",
                localField: "matchings.cdp_enr_cand_record_id",
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
                as: "suivis"
              }
            },
            {
              $group: {
                _id: "$record_id",
                record_id: { $first: "$record_id" },
                date_atelier: { $first: "$date_atelier" },
                matchings: {
                  $push: {
                    record_id: "$matchings.record_id",
                    cdpenrcand: {
                      record_id: "$cand.record_id",
                      statut: "$cand.statut",
                      cdp_suivi: "$suivis"
                    }
                  }
                }
              }
            }
          ],
          as: "cdp_x_benev"
        }
      },
      {
        $project: {
          record_id: 1,
          cdp_x_benev: 1
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

async generatePdfFromHtml(html: string): Promise<Buffer> {
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
  }
}
