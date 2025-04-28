import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IEvenementPc extends Document {
  record_id: string;
  label?: string;
  structure_id?: string;
  date?: Date;
  nombre_be_present?: number;
  nombre_candidat_acc?: number;
  poids_kg?: number;
  type?: string;
  fresque_presente?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const EvenementPcSchema: Schema<IEvenementPc> = new Schema({
  record_id: { type: String, required: true },
  label: { type: String },
  structure_id: { type: String },
  date: { type: Date },
  nombre_be_present: { type: Number },
  nombre_candidat_acc: { type: Number },
  poids_kg: { type: Number },
  type: { type: String },
  fresque_presente: { type: String },
});

// Créer et exporter le modèle
const EvenementPc: Model<IEvenementPc> = mongoose.model<IEvenementPc>("EvenementPc", EvenementPcSchema);

export default EvenementPc;
