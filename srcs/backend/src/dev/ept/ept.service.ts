import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';


@Injectable()
export class EptService {
    uri : string = process.env.MONGODB_URL || "";
    client = new MongoClient(this.uri);

    async setEPT() {
        try {
        let concat : any = "[]";
        await this.client.connect();
        const db = this.client.db("test");
        const zone_geo = db.collection("zonegeos");
        let result : any = [];
        let tab = await zone_geo.find({ type: "EPT (ETABLISSEMENT PUBLIC TERRITORIAL), TERRITOIRE" }).toArray();
        for (let item of tab) {
            concat = [];
            for (let ville of item.communes) {
                concat.push(ville);
            }
            concat.push(item.surnom);
            result.push(concat);
        }
            return result;
        } catch (error) {
            console.error("An error occurred while fetching EPT:", error);
        } finally {
            await this.client.close();
        }
    }
}
