import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IAtCoEnrCand extends Document {
  record_id: string;
  candidat_genre?: string;
  candidat_age?: number;
  candidat_residence?: string;
  statut?: string;
  date_atelier?: Date;
  atelier_lieu?: string;
  a_deja_fait_cdp?: string;
  qpv?: string;
  epa?: string;
  aide_sociale?: string;
  sous_main_justice?: string;
  candidat_record_id?: string;
  note_satisfaction?: number;
  type_atelier?: string;
  prescripteur_record_id?: string;
  statut_atelier?: string;
  candidat_numero_et_rue?: string;
  candidat_code_postal?: string;
  candidat_commune_ville?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const AtCoEnrCandSchema: Schema<IAtCoEnrCand> = new Schema({
  record_id: { type: String, required: true },
  candidat_genre: { type: String },
  candidat_age: { type: Number },
  candidat_residence: { type: String },
  statut: { type: String },
  date_atelier: { type: Date },
  atelier_lieu: { type: String },
  a_deja_fait_cdp: { type: String },
  qpv: { type: String },
  epa: { type: String },
  aide_sociale: { type: String },
  sous_main_justice: { type: String },
  candidat_record_id: { type: String },
  note_satisfaction: { type: Number },
  type_atelier: { type: String },
  prescripteur_record_id: { type: String },
  statut_atelier: { type: String },
  candidat_numero_et_rue: { type: String },
  candidat_code_postal: { type: String },
  candidat_commune_ville: { type: String },
});

// Créer et exporter le modèle
const AtCoEnrCand: Model<IAtCoEnrCand> = mongoose.model<IAtCoEnrCand>("AtCoEnrCand", AtCoEnrCandSchema);

export default AtCoEnrCand;
