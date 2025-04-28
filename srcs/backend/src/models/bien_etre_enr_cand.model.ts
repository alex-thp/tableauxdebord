import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IBienEtreEnrCand extends Document {
  record_id: string;
  candidat_record_id?: string;
  candidat_age?: number;
  candidat_genre?: string;
  candidat_residence?: string;
  statut?: string;
  date_atelier?: Date;
  atelier_lieu?: string;
  qpv?: string;
  aide_sociale?: string;
  sous_main_justice?: string;
  epa?: string;
  type_prestation?: string;
  prescripteur_record_id?: string;
  atelier_statut?: string;
  candidat_numero_et_rue?: string;
  candidat_code_postal?: string;
  candidat_commune_ville?: string;
  code_postal?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const BienEtreEnrCandSchema: Schema<IBienEtreEnrCand> = new Schema({
  record_id: { type: String, required: true },
  candidat_record_id: { type: String },
  candidat_age: { type: Number },
  candidat_genre: { type: String },
  candidat_residence: { type: String },
  statut: { type: String },
  date_atelier: { type: Date },
  atelier_lieu: { type: String },
  qpv: { type: String },
  aide_sociale: { type: String },
  sous_main_justice: { type: String },
  epa: { type: String },
  type_prestation: { type: String },
  prescripteur_record_id: { type: String },
  atelier_statut: { type: String },
  candidat_numero_et_rue: { type: String },
  candidat_code_postal: { type: String },
  candidat_commune_ville: { type: String },
  code_postal: { type: String }
});

// Créer et exporter le modèle
const BienEtreEnrCand: Model<IBienEtreEnrCand> = mongoose.model<IBienEtreEnrCand>("BienEtreEnrCand", BienEtreEnrCandSchema);

export default BienEtreEnrCand;
