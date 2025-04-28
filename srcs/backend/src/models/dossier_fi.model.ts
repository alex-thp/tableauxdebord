import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface IDossierFi extends Document {
  record_id: string;
  contact_id?: string;
  date_creation?: Date;
  titre_dossier?: string;
  type_dossier?: string;
  date_debut?: Date;
  date_fin?: Date;
  projet_soutenu?: string;
  code_analytique?: number;
  echelle_partenariat?: string;
  statut?: string;
  sous_dossier_fi_ids?: string[];
  dossier_fi_x_structure_financeur_id?: string;
  structures_financeurs?: string[];
}

// Créer le schéma Mongoose basé sur l'interface
const DossierFiSchema: Schema<IDossierFi> = new Schema({
  record_id: { type: String, required: true },
  contact_id: { type: String },
  date_creation: { type: Date },
  titre_dossier: { type: String },
  type_dossier: { type: String },
  date_debut: { type: Date },
  date_fin: { type: Date },
  projet_soutenu: { type: String },
  code_analytique: { type: Number },
  echelle_partenariat: { type: String },
  statut: { type: String },
  sous_dossier_fi_ids: { type: [String] },
  dossier_fi_x_structure_financeur_id: { type: String },
  structures_financeurs: { type: [String] },
});

// Créer et exporter le modèle
const DossierFi: Model<IDossierFi> = mongoose.model<IDossierFi>("DossierFi", DossierFiSchema);

export default DossierFi;
