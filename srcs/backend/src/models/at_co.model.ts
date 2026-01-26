import mongoose, { Document, Schema, Model } from 'mongoose';

// Définir l'interface Mongoose en étendant Document
export interface IAtCo extends Document {
  record_id: string;
  date?: Date;
  statut?: string;
  lieu?: string;
  commune?: string;
  structure_prescriptrice?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const AtCoSchema: Schema<IAtCo> = new Schema({
  record_id: { type: String, required: true },
  date: { type: Date },
  statut: { type: String },
  lieu: { type: String },
  commune: { type: String },
  structure_prescriptrice: { type: String },
});

// Créer et exporter le modèle
const AtCo: Model<IAtCo> = mongoose.model<IAtCo>('AtCo', AtCoSchema);

export default AtCo;
