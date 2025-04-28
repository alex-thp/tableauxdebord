import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IContactDeStructure extends Document {
  type_interlocuteur?: string;
  structure_type?: string;
  dispositif_insertion?: string;
  structure_id?: string;
  record_id: string;
  date_creation?: string; // Si vous souhaitez un champ de type Date, changez `String` par `Date`
}

// Créer le schéma Mongoose basé sur l'interface
const ContactDeStructureSchema: Schema<IContactDeStructure> = new Schema({
  type_interlocuteur: { type: String },
  structure_type: { type: String },
  dispositif_insertion: { type: String },
  structure_id: { type: String },
  record_id: { type: String, required: true },
  date_creation: { type: String }, // Si vous souhaitez un champ de type Date, changez `String` par `Date`
});

// Créer et exporter le modèle
const ContactDeStructure: Model<IContactDeStructure> = mongoose.model<IContactDeStructure>("ContactDeStructure", ContactDeStructureSchema);

export default ContactDeStructure;
