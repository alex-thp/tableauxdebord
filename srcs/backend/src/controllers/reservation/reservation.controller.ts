import { Body, Controller, Get, Post, Query } from '@nestjs/common';
const Airtable = require("airtable");
require("dotenv").config();

interface CdpResult {
  cdp: { id: string; [key: string]: any };
  slotsLibres: { id: string; [key: string]: any }[];
}

@Controller('reservation')
export class ReservationController {

    base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE);

@Get('verifyPrescription')
async verifyPrescriptionAvailability(@Query('prescriptionId') record_id: string): Promise<any[]> {
    const record = await this.base(process.env.TABLE_CDP_ENR_CAND).find(record_id);
    return [{ available: record.fields['STATUT'] === 'A Positionner' }];
}

@Post('setPrescriptionOnSlot')
async setPrescriptionOnSlot(
  @Body('prescriptionId') record_id: string,
  @Body('cdpId') cdp_record_id: string
): Promise<any> {
  // Récupérer la prescription
  const record = await this.base(process.env.TABLE_CDP_ENR_CAND).find(record_id);

  // Mettre l'ID du CDP dans le champ CDP_ID et changer le statut en 'Positionné'
  await this.base(process.env.TABLE_CDP_ENR_CAND).update(record_id, {
    CDP_ID: [cdp_record_id],
    STATUT: 'Positionné'
  });

  return { success: true, message: `Prescription ${record_id} assigned to CDP ${cdp_record_id} and status set to 'Positionné'.` };
}

@Get('availableSlots')
async getAvailableSlots(@Query('record_id') record_id: string): Promise<any[]> {
  const today = new Date();

  // Demain
  const dateDebut = new Date(today);
  dateDebut.setDate(today.getDate() + 1);

  // Une semaine plus tard
  const dateFin = new Date(today);
  dateFin.setDate(today.getDate() + 7);

  const tableCdp = process.env.TABLE_CDP!;
  const tableEnrCand = process.env.TABLE_CDP_ENR_CAND!;
  const tableLieux = process.env.TABLE_ZONE_GEO!;

  // helper: format pour Airtable (YYYY-MM-DD)
  const formatDateForAirtable = (d: Date) => d.toISOString().split('T')[0];

  // helper: extrait une string heure depuis différents noms de champ possibles
  const extractTime = (row: any): string => {
    if (!row) return '';
    return (
      row['HEURE_RDV'] ??
      row['heure_rdv'] ??
      row['Heure_rdv'] ??
      row['Heure RDV'] ??
      row['HEURE'] ??
      row['HEURE_RV'] ??
      row['HEURE-RDV'] ??
      row['LABEL']?.match(/^(\d{1,2}[:hH\.\s]\d{2})/)?.[1] ?? // parfois l'heure est dans le LABEL en prefixe
      ''
    ).toString().trim();
  };

  // helper: convertit "15:30" / "15h30" / "15.30" en minutes depuis minuit ; valeur grande si invalide
  const timeToMinutes = (s: string): number => {
    if (!s) return Number.MAX_SAFE_INTEGER;
    const m = s.match(/^\s*(\d{1,2})[:hH\. ](\d{2})\s*$/);
    if (!m) return Number.MAX_SAFE_INTEGER;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (isNaN(hh) || isNaN(mm)) return Number.MAX_SAFE_INTEGER;
    return hh * 60 + mm;
  };
  const prescription = await this.base(tableEnrCand).find(record_id);
  const genre = (prescription.fields['CANDIDAT - GENRE'][0] as string) ?? '';

  const forbiddenForMen = ['38 rue de la Folie-Regnault, PARIS (75011)']; //La liste des ateliers interdits aux hommes (que pour les femmes)

  // 1️⃣ Récupérer les CDP dont la date est comprise entre dateDebut et dateFin
  const cdpRecords = await this.base(tableCdp)
    .select({
      filterByFormula: `AND(
        IS_AFTER({DATE}, '${formatDateForAirtable(dateDebut)}'),
        IS_BEFORE({DATE}, '${formatDateForAirtable(dateFin)}'),
        {FIXE - LIEU_ATELIER} != ''
      )`,
    })
    .all();

  const results: {
    label: string;
    date: Date;
    lieu: string;
    record_id: string;
    slotsLibres: any[];
  }[] = [];

  for (const cdp of cdpRecords) {
    const cdpId = cdp.id;

    // récupérer les slots libres liés au CDP
    const enrCandRecords = await this.base(tableEnrCand)
      .select({
        filterByFormula: `AND(
          {CDP - RECORD_ID} = '${cdpId}',
          {STATUT} = 'Créneau libre'
        )`,
      })
      .all();

    // récupérer le label du lieu lié (si présent)
    let lieuLabel = '';
    const fixeLieu = cdp.fields['FIXE - LIEU_ATELIER'];
    if (Array.isArray(fixeLieu) && fixeLieu.length > 0) {
      const lieuId = fixeLieu[0];
      try {
        const lieuRecord = await this.base(tableLieux).find(lieuId);
        lieuLabel = (lieuRecord.fields?.['LABEL'] as string) ?? '';
      } catch (err) {
        // silent fail : on laisse lieuLabel vide si lookup échoue
        lieuLabel = '';
      }
    }

    // 👉 filtre : si c’est un homme et que le lieu est interdit → on skip
    if (genre !== 'Femme' && forbiddenForMen.includes(lieuLabel)) {
      continue;
    }

    // transformer les slots et trier par heure croissante (les slots sans heure vont à la fin)
    const slotsLibres = enrCandRecords
      .map(r => ({ id: r.id, ...r.fields }))
      .sort((a, b) => {
        const ta = timeToMinutes(extractTime(a));
        const tb = timeToMinutes(extractTime(b));
        return ta - tb;
      });

    // 👉 On skip l'atelier si aucun slot libre
    if (slotsLibres.length === 0) {
        continue;
    }

    results.push({
      label: (cdp.fields['LABEL'] as string) ?? '',
      date: new Date((cdp.fields['DATE'] as string) ?? ''),
      lieu: lieuLabel,
      record_id: cdpId,
      slotsLibres,
    });
  }

  // 2️⃣ Trier les ateliers par date croissante ; si même date, par premier créneau disponible
  results.sort((a, b) => {
    const d = a.date.getTime() - b.date.getTime();
    if (d !== 0) return d;

    const firstA = a.slotsLibres?.[0] ?? null;
    const firstB = b.slotsLibres?.[0] ?? null;
    const ta = timeToMinutes(extractTime(firstA));
    const tb = timeToMinutes(extractTime(firstB));
    return ta - tb;
  });

  return results;
}

@Post('eraseOldSlot')
async eraseOldSlot(@Body('slotId') slotId: string): Promise<any> {
  try {
    // On récupère le record correspondant au slot
    const record = await this.base(process.env.TABLE_CDP_ENR_CAND).find(slotId);

    if (!record) {
      throw new Error(`Slot ${slotId} introuvable`);
    }

    // On supprime le record
    await this.base(process.env.TABLE_CDP_ENR_CAND).destroy(slotId);

    return { success: true, message: `Slot ${slotId} libéré avec succès.` };
  } catch (error) {
    console.error('Erreur eraseOldSlot:', error);
    return { success: false, message: `Impossible de libérer le slot ${slotId}`, error: error.message };
  }
}

}
