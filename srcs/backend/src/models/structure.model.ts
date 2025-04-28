import mongoose, { Document, Schema, Model } from "mongoose";

// Définition de l'interface en étendant Document pour profiter du typage Mongoose.
export interface IStructure extends Document {
  record_id: string;
  label?: string;
  type?: string;
  date_creation?: string; // Ici date_creation est une chaîne de caractères. Si vous préférez le stocker en tant que Date, changez le type en Date.
}

// Création du schéma Mongoose en se basant sur l'interface
const StructureSchema: Schema<IStructure> = new Schema({
  record_id: { type: String, required: true },
  label: { type: String },
  type: { type: String },
  date_creation: { type: String } // Modifier en { type: Date } si besoin
});

// Création et export du modèle
const Structure: Model<IStructure> = mongoose.model<IStructure>("Structure", StructureSchema);

export default Structure;
