import mongoose, { Schema, Document } from 'mongoose';

// Définition de l'interface Candidat pour le typage
interface ICandidat extends Document {
  record_id: string;
  date_naissance: Date;
  cdp_enr_cand_record_id: string;
  bien_etre_enr_cand_record_id: string;
  at_co_enr_cand_record_id: string;
}

const candidatSchema: Schema = new Schema(
  {
    record_id: {
      type: String,
    },
    date_naissance: {
      type: Date,
    },
    cdp_enr_cand_record_id: {
      type: String,
    },
    bien_etre_enr_cand_record_id: {
      type: String,
    },
    at_co_enr_cand_record_id: {
      type: String,
    },
  }
);


// Création du modèle avec le typage de l'interface ICandidat
const Candidat = mongoose.model<ICandidat>('Candidat', candidatSchema);

export default Candidat;
