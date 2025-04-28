import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IRapport extends Document {
  record_id: string;
  sous_dossier_fi_ids?: string[];
  date_remplissage?: Date;
  rapport_x_indicateur_ids?: string[];
  label?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const RapportSchema: Schema<IRapport> = new Schema({
  record_id: { type: String, required: true },
  sous_dossier_fi_ids: { type: [String] },
  date_remplissage: { type: Date },
  rapport_x_indicateur_ids: { type: [String] },
  label: { type: String },
});

// Créer et exporter le modèle
const Rapport: Model<IRapport> = mongoose.model<IRapport>("Rapport", RapportSchema);

export default Rapport;
