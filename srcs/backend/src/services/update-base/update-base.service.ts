import { Injectable } from '@nestjs/common';
import { AirtableService } from '../airtable/airtable.service';
import { MongoDbService } from '../mongo-db/mongo-db.service';

@Injectable()
export class UpdateBaseService {
    
    constructor(private airtableService: AirtableService, private mongoDBService: MongoDbService) {}

    async retrieveBase(): Promise<any> {
      let tmp = await this.airtableService.getDatabase();
      let result = await this.mongoDBService.copyBaseFunction(tmp);
      console.log(result);
    }

}
