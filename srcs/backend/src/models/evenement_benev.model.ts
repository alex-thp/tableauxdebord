import mongoose, { Document, Schema, Model } from 'mongoose';

// Définir l'interface Mongoose en étendant Document
export interface IEvenementBenev extends Document {
  record_id: string;
  date?: Date;
  theme?: string;
  statut?: string;
  evenement_benevole_x_benevole_record_id?: [string];
}

// Schema
export const EvenementBenevSchema = new Schema<IEvenementBenev>({
  record_id: { type: String, required: true },
  date: { type: Date },
  theme: { type: String },
  statut: { type: String },
  evenement_benevole_x_benevole_record_id: [{ type: String }],
});

// Créer et exporter le modèle
const EvenementBenev: Model<IEvenementBenev> = mongoose.model<IEvenementBenev>(
  'EvenementBenev',
  EvenementBenevSchema,
);

export default EvenementBenev;
