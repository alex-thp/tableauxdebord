import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IIndicateur extends Document {
  record_id: string;
  label?: string;
  numero_indicateur?: number;
  action?: string;
  action_localite?: string[];
  sujet?: string;
  sujet_critere?: string[];
  sujet_indicateur?: string;
  rapport_x_indicateur_ids?: string[];
  sujet_localite?: string[];
}

// Créer le schéma Mongoose basé sur l'interface
const IndicateurSchema: Schema<IIndicateur> = new Schema({
  record_id: { type: String, required: true },
  label: { type: String },
  numero_indicateur: { type: Number },
  action: { type: String },
  action_localite: { type: [String] },
  sujet: { type: String },
  sujet_critere: { type: [String] },
  sujet_indicateur: { type: String },
  rapport_x_indicateur_ids: { type: [String] },
  sujet_localite: { type: [String] },
});

// Créer et exporter le modèle
const Indicateur: Model<IIndicateur> = mongoose.model<IIndicateur>("Indicateur", IndicateurSchema);

export default Indicateur;
