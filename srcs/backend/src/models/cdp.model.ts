import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface ICdp extends Document {
  date?: Date;
  type?: string;
  statut?: string;
  lieu?: string;
  record_id: string;
  mobile_vehicule?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const CdpSchema: Schema<ICdp> = new Schema({
  date: { type: Date },
  type: { type: String },
  statut: { type: String },
  lieu: { type: String },
  record_id: { type: String, required: true },
  mobile_vehicule: { type: String },
});

// Créer et exporter le modèle
const Cdp: Model<ICdp> = mongoose.model<ICdp>("Cdp", CdpSchema);

export default Cdp;
