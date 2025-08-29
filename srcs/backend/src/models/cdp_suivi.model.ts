import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface ICdpSuivi extends Document {
  record_id: string;
  situation_pro?: string;
  candidat_record_id?: string;
  niveau_lcs?: string;
  date_suivi?: string; // Si vous souhaitez stocker `date_suivi` comme un objet Date, vous pouvez changer `String` en `Date`
}

// Créer le schéma Mongoose basé sur l'interface
const CdpSuiviSchema: Schema<ICdpSuivi> = new Schema({
  record_id: { type: String, required: true },
  situation_pro: { type: String },
  candidat_record_id: { type: String },
  niveau_lcs: { type: String },
  date_suivi: { type: Date }, // Si vous souhaitez stocker en tant que Date, modifiez `String` par `Date`
});

// Créer et exporter le modèle
const CdpSuivi: Model<ICdpSuivi> = mongoose.model<ICdpSuivi>("CdpSuivi", CdpSuiviSchema);

export default CdpSuivi;
