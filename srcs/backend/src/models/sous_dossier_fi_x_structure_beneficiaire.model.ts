import mongoose, { Document, Schema, Model } from 'mongoose';

// Définir l'interface Mongoose en étendant Document
export interface ISousDossierFiXStructureBeneficiaire extends Document {
  record_id: string;
  dossier_fi_id: string;
  structure_id: string[];
}

const sousDossierFiXStructureBeneficiaireSchema: Schema<ISousDossierFiXStructureBeneficiaire> = new Schema(
  {
    record_id: { type: String, required: true },
    dossier_fi_id: { type: String },
    structure_id: { type: [String] },
  }
);

// Créer et exporter le modèle avec le typage de l'interface ISousDossierFiXStructureBeneficiaire
const SousDossierFiXStructureBeneficiaire: Model<ISousDossierFiXStructureBeneficiaire> = mongoose.model<ISousDossierFiXStructureBeneficiaire>(
  'SousDossierFiXStructureBeneficiaire',
  sousDossierFiXStructureBeneficiaireSchema
);

export default SousDossierFiXStructureBeneficiaire;
