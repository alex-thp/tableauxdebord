import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IBenev extends Document {
  record_id: string;
  benev_structure?: string;
  cdp_x_benev?: string[];
  date_atelier?: string[];
  date_premier_atelier?: Date;
  formation_sensi_recap?: string;
  nom?: string;
  prenom?: string;
  mail?: string;
  tableau_date_adhesion?: [Date];
}

// Créer le schéma Mongoose basé sur l'interface
const BenevSchema: Schema<IBenev> = new Schema({
  record_id: { type: String, required: true },
  benev_structure: { type: String },
  cdp_x_benev: { type: [String] },
  date_atelier: { type: [String] },
  date_premier_atelier: { type: Date },
  formation_sensi_recap: { type: String },
  nom: { type: String },
  prenom: { type: String },
  mail: { type: String },
  tableau_date_adhesion: { type: [Date] },
});

// Créer et exporter le modèle
const Benev: Model<IBenev> = mongoose.model<IBenev>("Benev", BenevSchema);

export default Benev;