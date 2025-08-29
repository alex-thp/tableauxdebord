import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface ICdpEnrBenev extends Document {
  record_id: string;
  benev_structure?: string;
  est_be?: string;
  lieu_atelier?: string;
  nb_cand_acc?: number;
  date_atelier?: Date; 
  matchings?: string[];  // Tableau de chaînes de caractères
  benevole_id?: string;
  cdp_record_id?: string;
  statut?: string;
  type_cdp?: string;
  label?: string;
  intervention_utile?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const CdpEnrBenevSchema: Schema<ICdpEnrBenev> = new Schema({
  record_id: { type: String, required: true },
  benev_structure: { type: String },
  est_be: { type: String },
  lieu_atelier: { type: String },
  nb_cand_acc: { type: Number },
  date_atelier: { type: Date },
  matchings: { type: [String] },  // Définir comme un tableau de chaînes de caractères
  benevole_id: { type: String },
  cdp_record_id: { type: String },
  statut: { type: String },
  type_cdp: { type: String },
  label: { type: String },
  intervention_utile: { type: String },
});

// Créer et exporter le modèle
const CdpEnrBenev: Model<ICdpEnrBenev> = mongoose.model<ICdpEnrBenev>("CdpEnrBenev", CdpEnrBenevSchema);

export default CdpEnrBenev;
