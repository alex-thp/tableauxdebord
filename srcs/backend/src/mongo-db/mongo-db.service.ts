import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import {
  Indicateur,
  RapportXIndicateur,
  Rapport,
  DossierFi,
  SousDossierFiXStructureBeneficiaire,
  SousDossierFi,
  CdpEnrCand,
  AtCoEnrCand,
  BienEtre,
  BienEtreEnrCand,
  CdpEnrBenev,
  Benev,
  ZoneGeo,
  Cdp,
  AtCo,
  Candidat,
  ContactDeStructure,
  CdpSuivi,
  CdpEnrCandXCdpEnrBenev,
  Structure,
  EvenementPc,
  EvenementBenev,
  EvenementBenevXBenev,
} from "../models";

@Injectable()
export class MongoDbService {

  uri = process.env.MONGODB_URL as string;
  client: MongoClient = new MongoClient(this.uri);
  BATCH_SIZE = 2000;

  async insertInBatches<T>(collection: mongoose.Model<T>, data: T[] = []) {
    for (let i = 0; i < data.length; i += this.BATCH_SIZE) {
      const batch = data.slice(i, i + this.BATCH_SIZE);
      await collection.insertMany(batch);
    }
  }

  async eraseDatabase(): Promise<string> {
    await mongoose.connect(this.uri);
    await Promise.all([
      DossierFi.deleteMany({}),
      SousDossierFi.deleteMany({}),
      Rapport.deleteMany({}),
      RapportXIndicateur.deleteMany({}),
      Indicateur.deleteMany({}),
      SousDossierFiXStructureBeneficiaire.deleteMany({}),
      CdpEnrCand.deleteMany({}),
      AtCoEnrCand.deleteMany({}),
      BienEtre.deleteMany({}),
      BienEtreEnrCand.deleteMany({}),
      CdpEnrBenev.deleteMany({}),
      Benev.deleteMany({}),
      ZoneGeo.deleteMany({}),
      Cdp.deleteMany({}),
      AtCo.deleteMany({}),
      Candidat.deleteMany({}),
      ContactDeStructure.deleteMany({}),
      CdpSuivi.deleteMany({}),
      CdpEnrCandXCdpEnrBenev.deleteMany({}),
      Structure.deleteMany({}),
      EvenementPc.deleteMany({}),
    ]);
    await mongoose.connection.close();
    return "ended";
  }

  async copyBaseFunction(baseToInsert: any): Promise<string> {
    try {
      await mongoose.connect(this.uri);
      console.log("Start of deletion");

      await Promise.all([
        DossierFi.deleteMany({}),
        SousDossierFi.deleteMany({}),
        Rapport.deleteMany({}),
        RapportXIndicateur.deleteMany({}),
        Indicateur.deleteMany({}),
        SousDossierFiXStructureBeneficiaire.deleteMany({}),
        CdpEnrCand.deleteMany({}),
        AtCoEnrCand.deleteMany({}),
        BienEtre.deleteMany({}),
        BienEtreEnrCand.deleteMany({}),
        CdpEnrBenev.deleteMany({}),
        Benev.deleteMany({}),
        ZoneGeo.deleteMany({}),
        Cdp.deleteMany({}),
        AtCo.deleteMany({}),
        Candidat.deleteMany({}),
        ContactDeStructure.deleteMany({}),
        CdpSuivi.deleteMany({}),
        CdpEnrCandXCdpEnrBenev.deleteMany({}),
        Structure.deleteMany({}),
        EvenementPc.deleteMany({}),
        EvenementBenev.deleteMany({}),
        EvenementBenevXBenev.deleteMany({}),
      ]);
      console.log("End of deletion");

      const tmp = baseToInsert;
      console.log("End of getDatabase");

      await Promise.all([
        this.insertInBatches(DossierFi, tmp[0]),
        this.insertInBatches(SousDossierFi, tmp[1]),
        this.insertInBatches(Rapport, tmp[2]),
        this.insertInBatches(RapportXIndicateur, tmp[3]),
        this.insertInBatches(Indicateur, tmp[4]),
        this.insertInBatches(SousDossierFiXStructureBeneficiaire, tmp[5]),
        this.insertInBatches(CdpEnrCand, tmp[6]),
        this.insertInBatches(AtCoEnrCand, tmp[7]),
        this.insertInBatches(BienEtre, tmp[8]),
        this.insertInBatches(BienEtreEnrCand, tmp[9]),
        this.insertInBatches(CdpEnrBenev, tmp[10]),
        this.insertInBatches(Benev, tmp[11]),
        this.insertInBatches(ZoneGeo, tmp[12]),
        this.insertInBatches(Cdp, tmp[13]),
        this.insertInBatches(AtCo, tmp[14]),
        this.insertInBatches(Candidat, tmp[15]),
        this.insertInBatches(ContactDeStructure, tmp[16]),
        this.insertInBatches(CdpSuivi, tmp[17]),
        this.insertInBatches(CdpEnrCandXCdpEnrBenev, tmp[18]),
        this.insertInBatches(Structure, tmp[19]),
        this.insertInBatches(EvenementPc, tmp[20]),
        this.insertInBatches(EvenementBenev, tmp[21]),
        this.insertInBatches(EvenementBenevXBenev, tmp[22]),
      ]);

      console.log("End of copybase function");
      return "ended";
    } catch (error) {
      console.error("An error occurred:", error);
      return "error";
    } finally {
      console.log("Copie de la BDD terminée");
      await mongoose.connection.close();
    }
  }
}
