import mongoose, { Document, Schema, Model } from "mongoose";

// Définir l'interface Mongoose en étendant Document
export interface ICdpEnrCandXCdpEnrBenev extends Document {
  record_id: string;
  type_cdp?: string;
  cdp_enr_cand_record_id?: string;
  date_atelier?: string;
}

// Créer le schéma Mongoose basé sur l'interface
const CdpEnrCandXCdpEnrBenevSchema: Schema<ICdpEnrCandXCdpEnrBenev> = new Schema({
  record_id: { type: String, required: true },
  type_cdp: { type: String },
  cdp_enr_cand_record_id: { type: String },
  date_atelier: { type: String }, // Si vous souhaitez que ce soit une Date, vous pouvez utiliser `Date` ici
});

// Créer et exporter le modèle
const CdpEnrCandXCdpEnrBenev: Model<ICdpEnrCandXCdpEnrBenev> = mongoose.model<ICdpEnrCandXCdpEnrBenev>("CdpEnrCandXCdpEnrBenev", CdpEnrCandXCdpEnrBenevSchema);

export default CdpEnrCandXCdpEnrBenev;
