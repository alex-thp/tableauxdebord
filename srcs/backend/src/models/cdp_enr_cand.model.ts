import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface ICdpEnrCand extends Document {
  record_id: string;
  candidat_genre?: string;
  candidat_age?: number;
  candidat_residence?: string;
  statut?: string;
  date_atelier?: Date;
  atelier_lieu?: string;
  type_atelier?: string;
  qpv?: string;
  epa?: string;
  aide_sociale?: string;
  sous_main_justice?: string;
  candidat_record_id?: string;
  note_satisfaction?: number;
  prescripteur_record_id?: string;
  statut_atelier?: string;
  rqth?: string;
  niveau_lcs?: string;
  cdp_enr_cand_x_cdp_enr_benev_record_id?: string[];
  cdp_suivi?: string;
  orphelin?: string;
  candidat_numero_et_rue?: string;
  candidat_code_postal?: string;
  candidat_commune_ville?: string;
  metier_recherche?: string;
  secteur_recherche?: string;
  code_postal?: string;
  date_creation?: Date;
  type_prescription?: string;
  ressources_mensuelles?: number;
  verbatim?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const CdpEnrCandSchema: Schema<ICdpEnrCand> = new Schema({
  record_id: { type: String, required: true },
  candidat_genre: { type: String },
  candidat_age: { type: Number },
  candidat_residence: { type: String },
  statut: { type: String },
  date_atelier: { type: Date },
  atelier_lieu: { type: String },
  type_atelier: { type: String },
  qpv: { type: String },
  epa: { type: String },
  aide_sociale: { type: String },
  sous_main_justice: { type: String },
  candidat_record_id: { type: String },
  note_satisfaction: { type: Number },
  prescripteur_record_id: { type: String },
  statut_atelier: { type: String },
  rqth: { type: String },
  niveau_lcs: { type: String },
  cdp_enr_cand_x_cdp_enr_benev_record_id: { type: [String] }, // Tableau de chaînes de caractères
  cdp_suivi: { type: String },
  orphelin: { type: String },
  candidat_numero_et_rue: { type: String },
  candidat_code_postal: { type: String },
  candidat_commune_ville: { type: String },
  metier_recherche: { type: String },
  secteur_recherche: { type: String },
  code_postal: { type: String },
  date_creation: { type: Date },
  type_prescription: { type: String },
  ressources_mensuelles: { type: Number },
  verbatim: { type: String },
});

// Créer et exporter le modèle
const CdpEnrCand: Model<ICdpEnrCand> = mongoose.model<ICdpEnrCand>("CdpEnrCand", CdpEnrCandSchema);

export default CdpEnrCand;
