import mongoose, { Document, Schema, Model } from "mongoose";

// 1. Définir une interface qui étend Document pour bénéficier du typage Mongoose
export interface IZoneGeo extends Document {
  label?: string;
  type?: string;
  surnom?: string;
  communes?: string[];
}

// 2. Définir le schéma Mongoose en se basant sur l'interface
const ZoneGeoSchema: Schema<IZoneGeo> = new Schema(
  {
    label: { type: String },
    type: { type: String },
    surnom: { type: String },
    communes: { type: [String] },
  },
  {
    // Optionnel: ajouter des options ici si nécessaire (par exemple, timestamps)
    timestamps: true, // Ajoute des champs createdAt et updatedAt automatiquement
  }
);

// (Optionnel) Vous pouvez ajouter des plugins ou options supplémentaires au schéma ici.
// Par exemple : ZoneGeoSchema.plugin(toJSON); ZoneGeoSchema.plugin(paginate);

// 3. Créer et exporter le modèle
const ZoneGeo: Model<IZoneGeo> = mongoose.model<IZoneGeo>("ZoneGeo", ZoneGeoSchema);

export default ZoneGeo;
