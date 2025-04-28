import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IBienEtre extends Document {
  record_id: string;
  date?: Date;
  atelier_lieu?: string;
  statut?: string;
  type_prestation?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const BienEtreSchema: Schema<IBienEtre> = new Schema({
  record_id: { type: String, required: true },
  date: { type: Date },
  atelier_lieu: { type: String },
  statut: { type: String },
  type_prestation: { type: String },
});

// Créer et exporter le modèle
const BienEtre: Model<IBienEtre> = mongoose.model<IBienEtre>("BienEtre", BienEtreSchema);

export default BienEtre;
