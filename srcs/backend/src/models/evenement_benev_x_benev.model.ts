import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IEvenementBenevXBenev extends Document {
  record_id: string;
  benevole_record_id?: string;
  statut?: string;
  evenement_benevole_record_id?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const EvenementBenevXBenevSchema: Schema<IEvenementBenevXBenev> = new Schema({
  record_id: { type: String, required: true },
  benevole_record_id: { type: String },
  statut: { type: String },
  evenement_benevole_record_id: { type: String },
});

// Créer et exporter le modèle
const EvenementBenevXBenev: Model<IEvenementBenevXBenev> = mongoose.model<IEvenementBenevXBenev>("EvenementBenevXBenev", EvenementBenevXBenevSchema);

export default EvenementBenevXBenev;
