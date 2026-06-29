import { Injectable } from '@nestjs/common';
const Airtable = require('airtable');
require('dotenv').config();

@Injectable()
export class ReservationService {
  private base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE,
  );

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private extractTime(row: any): string {
    if (!row) return '';
    return (
      row['HEURE_RDV'] ??
      row['heure_rdv'] ??
      row['Heure_rdv'] ??
      row['Heure RDV'] ??
      row['HEURE'] ??
      row['HEURE_RV'] ??
      row['HEURE-RDV'] ??
      row['LABEL']?.match(/^(\d{1,2}[:hH\.\s]\d{2})/)?.[1] ??
      ''
    )
      .toString()
      .trim();
  }

  private timeToMinutes(s: string): number {
    if (!s) return Number.MAX_SAFE_INTEGER;
    const m = s.match(/^\s*(\d{1,2})[:hH\. ](\d{2})\s*$/);
    if (!m) return Number.MAX_SAFE_INTEGER;
    return Number(m[1]) * 60 + Number(m[2]);
  }

  private formatDateForAirtable(input: string | Date): string {
    if (!input) throw new Error('Date de naissance manquante');

    let dateObj: Date;
    if (input instanceof Date) {
      dateObj = input;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      dateObj = new Date(input);
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) {
      const [day, month, year] = input.split('/');
      dateObj = new Date(
        `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`,
      );
    } else {
      throw new Error(`Format de date non reconnu : ${input}`);
    }

    if (isNaN(dateObj.getTime())) throw new Error(`Date invalide : ${input}`);
    return dateObj.toISOString().split('T')[0];
  }

  private sortSlots(slots: any[]): any[] {
    return slots.sort(
      (a, b) =>
        this.timeToMinutes(this.extractTime(a)) -
        this.timeToMinutes(this.extractTime(b)),
    );
  }

  private sortResults(
    results: { date: Date; slotsLibres: any[] }[],
  ): typeof results {
    return results.sort((a, b) => {
      const d = a.date.getTime() - b.date.getTime();
      if (d !== 0) return d;
      return (
        this.timeToMinutes(this.extractTime(a.slotsLibres[0] ?? null)) -
        this.timeToMinutes(this.extractTime(b.slotsLibres[0] ?? null))
      );
    });
  }

  // ─── Méthodes publiques ──────────────────────────────────────────────────────

  async verifyPrescriptionAvailability(
    record_id: string,
  ): Promise<{ available: boolean }[]> {
    if (!record_id) return [{ available: false }];
    const record = await this.base(process.env.TABLE_CDP_ENR_CAND).find(
      record_id,
    );
    return [{ available: record.fields['STATUT'] === 'A Positionner' }];
  }

  async setPrescriptionOnSlot(
    record_id: string,
    cdp_record_id: string,
    heure_rdv: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.base(process.env.TABLE_CDP_ENR_CAND).find(record_id);

    await this.base(process.env.TABLE_CDP_ENR_CAND).update(record_id, {
      CDP_ID: [cdp_record_id],
      STATUT: 'Positionné',
      HEURE_RDV: heure_rdv,
      PRESCRIPTION_DOCTOLIB: 'Oui',
    });

    return {
      success: true,
      message: `Prescription ${record_id} assigned to CDP ${cdp_record_id} and status set to 'Positionné'.`,
    };
  }

  async getReservationSlots(reservation_record_id: string): Promise<any[]> {
    const tableCdp = process.env.TABLE_CDP!;
    const tableEnrCand = process.env.TABLE_CDP_ENR_CAND!;
    const tableLieux = process.env.TABLE_ZONE_GEO!;

    const cdpEnrCandRecords = await this.base(tableEnrCand)
      .select({
        filterByFormula: `{RESERVATION - RECORD_ID} = '${reservation_record_id}'`,
      })
      .all();

    const cdpMap: { [cdpId: string]: any[] } = {};
    for (const r of cdpEnrCandRecords) {
      const cdpId = r.fields['CDP - RECORD_ID'] as string;
      if (!cdpMap[cdpId]) cdpMap[cdpId] = [];
      cdpMap[cdpId].push(r);
    }

    const cdpIds = Object.keys(cdpMap);
    const cdpRecords = await this.base(tableCdp)
      .select({
        filterByFormula: `OR(${cdpIds.map((id) => `{RECORD_ID} = '${id}'`).join(',')})`,
      })
      .all();

    const results: any[] = [];

    for (const cdp of cdpRecords) {
      const slots = cdpMap[cdp.id] || [];
      const lieuLabel = await this.resolveLieuLabel(cdp, tableLieux);

      const slotsLibres = this.sortSlots(
        slots
          .filter((r) => r.fields['STATUT'] === 'Créneau libre')
          .map((r) => ({ id: r.id, ...r.fields })),
      );

      if (slotsLibres.length === 0) continue;

      results.push({
        label: (cdp.fields['LABEL'] as string) ?? '',
        date: new Date((cdp.fields['DATE'] as string) ?? ''),
        lieu: lieuLabel,
        record_id: cdp.id,
        slotsLibres,
      });
    }

    return this.sortResults(results);
  }

  async getCdpEnrCand(
    candidat_nom: string,
    candidat_prenom: string,
    candidat_date_naissance: string,
  ): Promise<{ record_id: string } | null> {
    const tableEnrCand = process.env.TABLE_CDP_ENR_CAND!;

    try {
      const formattedDate = this.formatDateForAirtable(candidat_date_naissance);
      const formula = `AND(
        {CANDIDAT - NOM} = '${candidat_nom}',
        {CANDIDAT - PRENOM} = '${candidat_prenom}',
        IS_SAME({CANDIDAT - DATE_NAISSANCE}, '${formattedDate}', 'day')
      )`;

      const records = await this.base(tableEnrCand)
        .select({ filterByFormula: formula, maxRecords: 1 })
        .all();

      if (!records || records.length === 0) return null;

      console.log('✅ record.id trouvé :', records[0].id);
      return { record_id: records[0].id };
    } catch (err: any) {
      console.error('❌ Erreur dans getCdpEnrCand:', err?.message ?? err);
      throw err;
    }
  }

  async getAvailableSlots(record_id: string): Promise<any[]> {
    const today = new Date();
    const dateDebut = new Date(today);
    dateDebut.setDate(today.getDate() + 1);
    const dateFin = new Date(today);
    dateFin.setDate(today.getDate() + 7);

    const tableCdp = process.env.TABLE_CDP!;
    const tableEnrCand = process.env.TABLE_CDP_ENR_CAND!;
    const tableLieux = process.env.TABLE_ZONE_GEO!;

    const forbiddenForMen = ['38 rue de la Folie-Regnault, PARIS (75011)'];

    const prescription = await this.base(tableEnrCand).find(record_id);
    const genre = (prescription.fields['CANDIDAT - GENRE'][0] as string) ?? '';

    const cdpRecords = await this.base(tableCdp)
      .select({
        filterByFormula: `AND(
          IS_AFTER({DATE}, '${this.formatDateForAirtable(dateDebut)}'),
          IS_BEFORE({DATE}, '${this.formatDateForAirtable(dateFin)}'),
          {FIXE - LIEU_ATELIER} != ''
        )`,
      })
      .all();

    const results: any[] = [];

    for (const cdp of cdpRecords) {
      const lieuLabel = await this.resolveLieuLabel(cdp, tableLieux);

      if (genre !== 'Femme' && forbiddenForMen.includes(lieuLabel)) continue;

      const enrCandRecords = await this.base(tableEnrCand)
        .select({
          filterByFormula: `AND(
            {CDP - RECORD_ID} = '${cdp.id}',
            {STATUT} = 'Créneau libre'
          )`,
        })
        .all();

      const slotsLibres = this.sortSlots(
        enrCandRecords.map((r) => ({ id: r.id, ...r.fields })),
      );

      if (slotsLibres.length === 0) continue;

      results.push({
        label: (cdp.fields['LABEL'] as string) ?? '',
        date: new Date((cdp.fields['DATE'] as string) ?? ''),
        lieu: lieuLabel,
        record_id: cdp.id,
        slotsLibres,
      });
    }

    return this.sortResults(results);
  }

  async eraseOldSlot(
    slotId: string,
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const record = await this.base(process.env.TABLE_CDP_ENR_CAND).find(
        slotId,
      );

      if (!record) throw new Error(`Slot ${slotId} introuvable`);

      await this.base(process.env.TABLE_CDP_ENR_CAND).destroy(slotId);

      return { success: true, message: `Slot ${slotId} libéré avec succès.` };
    } catch (error: unknown) {
      console.error('Erreur eraseOldSlot:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Impossible de libérer le slot ${slotId}`,
        error: errorMessage,
      };
    }
  }

  // ─── Helpers privés ──────────────────────────────────────────────────────────

  private async resolveLieuLabel(
    cdp: any,
    tableLieux: string,
  ): Promise<string> {
    const fixeLieu = cdp.fields['FIXE - LIEU_ATELIER'];
    const mobileLieu = cdp.fields['MOBILE - LIEU_ATELIER'];
    const lieuId = Array.isArray(fixeLieu) && fixeLieu.length > 0
      ? fixeLieu[0]
      : Array.isArray(mobileLieu) && mobileLieu.length > 0
        ? mobileLieu[0]
        : null;
    if (!lieuId) return '';
    try {
      const lieuRecord = await this.base(tableLieux).find(lieuId);
      return (lieuRecord.fields?.['LABEL'] as string) ?? '';
    } catch {
      return '';
    }
  }
}
