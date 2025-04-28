import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IRapportXIndicateur extends Document {
  record_id: string;
  label?: string;
  rapport_id?: string;
  indicateur_id?: string;
  objectif_quality?: string;
  objectif_quantity?: number;
  objectif_commentaire?: string;
  resultat_quality?: string;
  resultat_quantity?: number;
  resultat_commentaire?: string;
  date_debut?: Date;
  date_fin?: Date;
  structure_beneficiaire?: string[];
  structure_financeur?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const RapportXIndicateurSchema: Schema<IRapportXIndicateur> = new Schema({
  record_id: { type: String, required: true },
  label: { type: String },
  rapport_id: { type: String },
  indicateur_id: { type: String },
  objectif_quality: { type: String },
  objectif_quantity: { type: Number },
  objectif_commentaire: { type: String },
  resultat_quality: { type: String },
  resultat_quantity: { type: Number },
  resultat_commentaire: { type: String },
  date_debut: { type: Date },
  date_fin: { type: Date },
  structure_beneficiaire: { type: [String] },
  structure_financeur: { type: String },
});

// Créer et exporter le modèle
const RapportXIndicateur: Model<IRapportXIndicateur> = mongoose.model<IRapportXIndicateur>(
  "RapportXIndicateur",
  RapportXIndicateurSchema
);

export default RapportXIndicateur;
