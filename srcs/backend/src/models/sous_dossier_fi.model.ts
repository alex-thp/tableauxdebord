import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface ISousDossierFi extends Document {
  record_id: string;
  rapport_ids?: string[];
  label?: string;
  contact_ids?: string;
  asso_lcs_concernee?: string;
  montant_soutien?: number;
  detail_financier?: string;
  respo_dev?: string;
  soutien_par_candidat_fixe?: number;
  soutien_par_candidat_mobile?: number;
  soutien_par_candidat_cdpalm?: number;
  soutien_par_candidat_at_co?: number;
  soutien_par_candidat_bien_etre?: number;
  soutien_par_candidat_mentorat?: number;
  sous_dossier_fi_x_structure_beneficiaire?: string[];
  commentaire?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const SousDossierFiSchema: Schema<ISousDossierFi> = new Schema({
  record_id: { type: String, required: true },
  rapport_ids: { type: [String] },
  label: { type: String },
  contact_ids: { type: String },
  asso_lcs_concernee: { type: String },
  montant_soutien: { type: Number },
  detail_financier: { type: String },
  respo_dev: { type: String },
  soutien_par_candidat_fixe: { type: Number },
  soutien_par_candidat_mobile: { type: Number },
  soutien_par_candidat_cdpalm: { type: Number },
  soutien_par_candidat_at_co: { type: Number },
  soutien_par_candidat_bien_etre: { type: Number },
  soutien_par_candidat_mentorat: { type: Number },
  sous_dossier_fi_x_structure_beneficiaire: { type: [String] },
  commentaire: { type: String },
});

// Créer et exporter le modèle
const SousDossierFi: Model<ISousDossierFi> = mongoose.model<ISousDossierFi>("SousDossierFi", SousDossierFiSchema);

export default SousDossierFi;
