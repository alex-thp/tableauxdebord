import { Injectable } from '@nestjs/common';
import { MongoClient, Collection } from 'mongodb';
import { EptService } from './ept/ept.service';

interface QueryCondition {
  [key: string]: any;
  $or?: QueryCondition[];
  $and?: QueryCondition[];
  $in?: any[];
  $eq?: any;
  $gte?: number;
  $lt?: number;
  $lte?: number;
  $regex?: string;
  $options?: string;
}

interface DatabaseCollections {
  cdp: Collection;
  cdpenrbenev: Collection;
  cdpenrcand: Collection;
  cdpsuivi: Collection;
  bienetreenrcand: Collection;
  atcoenrcand: Collection;
  contactdestructure: Collection;
  candidat: Collection;
  entreprisexcollecte: Collection;
  collecte: Collection;
  entreprisextri: Collection;
  tri: Collection;
  benev: Collection;
  structures: Collection;
  referents: Collection;
  atco: Collection;
  bienetre: Collection;
  matching: Collection;
  evenement_pc: Collection;
}

interface IndicateurItem {
  action: string;
  sujet: string;
  sujet_critere: string[];
  action_localite: string[];
  sujet_localite: string[];
  structure_beneficiaire: string[];
  date_debut: Date;
  date_fin: Date;
}

@Injectable()
export class DevService {
  uri: any = process.env.MONGODB_URL;
  private client: MongoClient;

  constructor(private eptService: EptService) {
    this.client = new MongoClient(this.uri);
  }

  async getRapportXIndicateur(rapport_x_indicateur: string): Promise<any> {
    if (!rapport_x_indicateur) {
      throw new Error('rapport_x_indicateur is required');
    }
    const db = this.client.db('test');
    const rapportxindicateur = db.collection('rapportxindicateurs');
    return await rapportxindicateur.findOne({ record_id: rapport_x_indicateur });
  }

  async getIndicateur(indicateur: string): Promise<any> {
    if (!indicateur) {
      throw new Error('indicateur is required');
    }
    const db = this.client.db('test');
    const rapportxindicateur = db.collection('indicateurs');
    return await rapportxindicateur.findOne({ record_id: indicateur });
  }

  updateQuery(
    currentQuery: QueryCondition,
    field: string,
    value: any,
    comparisonToken: string,
    value2?: any,
  ): QueryCondition {
    switch (comparisonToken) {
      case '$eq':
        currentQuery[field] = { $eq: value };
        return currentQuery;
      case '$all':
        currentQuery[field] = { $all: [value] };
        return currentQuery;
      case '$in':
        currentQuery[field] = { $in: [value, value2] };
        return currentQuery;
      case '$gte':
        currentQuery[field] = { $gte: value };
        return currentQuery;
      case '$lt':
        currentQuery[field] = { $lt: value };
        return currentQuery;
      case '$lte':
        currentQuery[field] = { $lte: value };
        return currentQuery;
      case '$gte-$lt':
        currentQuery[field] = { $gte: value, $lt: value2 };
        return currentQuery;
      case '$in-tab':
        currentQuery[field] = { $in: value };
    }
    return currentQuery;
  }

  add_localite_to_query(currentQuery: QueryCondition, field: string, values: string[]): QueryCondition {
    if (!currentQuery) currentQuery = {};
    if (!Array.isArray(values)) values = [values];

    // Crée un tableau de conditions regex
    const regexConditions = values.map((value) => {
      const tmp = value.split(' : ');
      if (tmp[0] === 'code postal') {
        return { code_postal: { $regex: tmp[1], $options: 'i' } };
      } else {
        return { [field]: { $regex: value, $options: 'i' } };
      }
    });

    // Vérifie si $and existe déjà
    if (!currentQuery.$and) {
      currentQuery.$and = [];
    }

    // Ajoute un nouveau bloc $or distinct pour chaque champ
    currentQuery.$and.push({ $or: regexConditions });

    return currentQuery;
  }

  forge_request_sujet_critere(sujet_critere: string[], structure_beneficiaire: string[] = []): QueryCondition {
    if (!sujet_critere || sujet_critere.length === 0) {
      return {};
    }

    // Vérifier s'il y a un OU dans la liste
    const hasOU = sujet_critere.includes('OU');

    if (!hasOU) {
      // Pas de OU : tout est en ET
      return this.buildAndQuery(sujet_critere, structure_beneficiaire);
    }

    // Séparer les critères en deux groupes :
    // 1. Les critères qui font partie de chaînes OU (séparés par "OU")
    // 2. Les autres critères (qui restent en ET)

    const etCriteres: string[] = [];
    const ouCriteres: string[] = [];

    for (let i = 0; i < sujet_critere.length; i++) {
      const token = sujet_critere[i];

      if (token === 'OU') {
        continue;
      }

      // Vérifier si ce token fait partie d'une chaîne OU
      // Un token fait partie d'une chaîne OU si :
      // - Il est précédé par "OU" (sauf pour le premier)
      // - Il est suivi par "OU" (sauf pour le dernier)
      const isInOUChain =
        (i > 0 && sujet_critere[i - 1] === 'OU') ||
        (i < sujet_critere.length - 1 && sujet_critere[i + 1] === 'OU');

      if (isInOUChain) {
        ouCriteres.push(token);
      } else {
        etCriteres.push(token);
      }
    }

    // Construire la query de base avec les critères ET
    const query = this.buildAndQuery(etCriteres, structure_beneficiaire);

    // Ajouter les critères OU s'il y en a
    if (ouCriteres.length > 0) {
      if (ouCriteres.length === 1) {
        // Un seul critère OU -> le traiter comme un ET
        const ouCondition = this.buildConditionFromToken(ouCriteres[0], structure_beneficiaire);
        Object.assign(query, ouCondition);
      } else {
        // Plusieurs critères OU -> créer un $or
        const orConditions = ouCriteres.map((critere) =>
          this.buildConditionFromToken(critere, structure_beneficiaire),
        );

        // Ajouter le $or à la query existante
        query.$or = orConditions;
      }
    }

    return query;
  }

  private buildAndQuery(criteres: string[], structure_beneficiaire: string[]): QueryCondition {
    let query: QueryCondition = {};
    for (const s_critere of criteres) {
      query = this.applyCritereToQuery(query, s_critere, structure_beneficiaire);
    }
    return query;
  }

  private buildConditionFromToken(token: string, structure_beneficiaire: string[]): QueryCondition {
    const condition: QueryCondition = {};

    if (token === '< 30 ans' || token === ' < 30 ans') {
      condition.candidat_age = { $gte: 12, $lt: 31 };
    } else if (token === '< 26 ans' || token === ' < 26 ans') {
      condition.candidat_age = { $gte: 12, $lt: 27 };
    } else if (token === '< 20 ans' || token === ' < 20 ans') {
      condition.candidat_age = { $gte: 12, $lt: 21 };
    } else if (token === '21-25 ans' || token === ' 21-25 ans') {
      condition.candidat_age = { $gte: 21, $lt: 26 };
    } else if (token === '26-49 ans' || token === ' 26-49 ans') {
      condition.candidat_age = { $gte: 26, $lt: 50 };
    } else if (token === '> 49 ans' || token === ' > 49 ans') {
      condition.candidat_age = { $gte: 49, $lt: 120 };
    } else if (token === 'Hommes' || token === ' Hommes') {
      condition.candidat_genre = { $eq: 'Homme' };
    } else if (token === 'Femmes' || token === ' Femmes') {
      condition.candidat_genre = { $eq: 'Femme' };
    } else if (token === 'Femme - 16-20 ans' || token === ' Femme - 16-20 ans') {
      condition.$and = [
        { candidat_genre: { $eq: 'Femme' } },
        { candidat_age: { $gte: 16, $lt: 21 } },
      ];
    } else if (token === 'QPV' || token === ' QPV') {
      condition.qpv = { $eq: 'Oui' };
    } else if (token === 'QPV_300' || token === ' QPV_300') {
      condition.qpv_300 = { $eq: 'Oui' };
    } else if (token === 'EPA' || token === ' EPA') {
      condition.epa = { $eq: 'EPA' };
    } else if (token === 'RSA' || token === ' RSA') {
      condition.aide_sociale = { $eq: 'Revenu de Solidarité Actif (RSA)' };
    } else if (token === 'ASE' || token === ' ASE') {
      condition.aide_sociale = { $eq: 'ASE' };
    } else if (token === 'PPSMJ' || token === ' PPSMJ') {
      condition.sous_main_justice = { $eq: 'Oui' };
    } else if (token === 'RQTH' || token === ' RQTH') {
      condition.rqth = { $eq: 'Oui' };
    } else if (token === 'Orphelin' || token === ' Orphelin') {
      condition.orphelin = { $eq: 'Oui' };
    } else if (token === 'structure prescriptrice' || token === ' structure prescriptrice') {
      if (Array.isArray(structure_beneficiaire) && structure_beneficiaire.length > 0) {
        condition.structure_prescriptrice = { $in: structure_beneficiaire };
      }
    } else if (token !== '') {
      const tmp = token.split(' : ');
      if (tmp[0] === 'metier' || tmp[0] === ' metier') {
        condition.metier_recherche = { $eq: tmp[1] };
      } else if (tmp[0] === 'secteur' || tmp[0] === ' secteur') {
        condition.secteur_recherche = { $eq: tmp[1] };
      } else if (tmp[0] === 'ressources mensuelle' || tmp[0] === ' ressources mensuelle') {
        condition.ressources_mensuelle = { $lt: Number(tmp[1]) };
      } else if (tmp[0] === 'type contrat' || tmp[0] === ' type contrat') {
        condition.type_contrat = { $eq: tmp[1] };
      } else if (tmp[0] === 'formation' || tmp[0] === ' formation') {
        condition.niveau_etude = { $gte: Number(tmp[1]) };
      }
    }

    return condition;
  }

  private applyCritereToQuery(
    currentQuery: QueryCondition,
    s_critere: string,
    structure_beneficiaire: string[],
  ): QueryCondition {
    const condition = this.buildConditionFromToken(s_critere, structure_beneficiaire);
    // Fusion simple
    return { ...currentQuery, ...condition };
  }

  async calculate_function(item: IndicateurItem): Promise<any> {
    console.log('starting calculate_function');
    const db = this.client.db('test');
    const cdp = db.collection('cdps');
    const cdpenrbenev = db.collection('cdpenrbenevs');
    const cdpenrcand = db.collection('cdpenrcands');
    const cdpsuivi = db.collection('cdpsuivis');
    const bienetreenrcand = db.collection('bienetreenrcands');
    const atcoenrcand = db.collection('atcoenrcands');
    const contactdestructure = db.collection('contactdestructures');
    const candidat = db.collection('candidats');
    const entreprisexcollecte = db.collection('entreprisexcollectes');
    const collecte = db.collection('collectes');
    const entreprisextri = db.collection('entreprisextris');
    const tri = db.collection('tris');
    const benev = db.collection('benevs');
    const structures = db.collection('structures');
    const referents = db.collection('contactdestructures');
    const atco = db.collection('atcos');
    const bienetre = db.collection('bienetres');
    const matching = db.collection('cdpenrcandxcdpenrbenevs');
    const evenement_pc = db.collection('evenementpcs');

    const database: DatabaseCollections = {
      cdp,
      cdpenrbenev,
      cdpenrcand,
      cdpsuivi,
      bienetreenrcand,
      atcoenrcand,
      contactdestructure,
      candidat,
      entreprisexcollecte,
      collecte,
      entreprisextri,
      tri,
      benev,
      structures,
      referents,
      atco,
      bienetre,
      matching,
      evenement_pc,
    };
    let data = '';
    const eptArray = await this.eptService.setEPT();
    if (item.action_localite && item.action_localite.length > 0) {
      if (item.action_localite[0] === "93 - paris terre d'envol") {
        item.action_localite = [eptArray[3]];
      } else if (item.action_localite[0] === '93 - est ensemble') {
        item.action_localite = [eptArray[2]];
      } else if (item.action_localite[0] === '93 - grand paris grand est') {
        item.action_localite = [eptArray[1]];
      } else if (item.action_localite[0] === '93 - plaine commune') {
        item.action_localite = [eptArray[0]];
      }
    }

    if (item.sujet_localite && item.sujet_localite.length > 0) {
      if (item.sujet_localite[0] === "93 - paris terre d'envol") {
        item.sujet_localite = [eptArray[3]];
      } else if (item.sujet_localite[0] === '93 - est ensemble') {
        item.sujet_localite = [eptArray[2]];
      } else if (item.sujet_localite[0] === '93 - grand paris grand est') {
        item.sujet_localite = [eptArray[1]];
      } else if (item.sujet_localite[0] === '93 - plaine commune') {
        item.sujet_localite = [eptArray[0]];
      }
    }
    item.sujet_critere = this.normalizeToArray(item.sujet_critere);
    item.action_localite = this.normalizeToArray(item.action_localite);
    item.sujet_localite = this.normalizeToArray(item.sujet_localite);
    item.structure_beneficiaire = this.normalizeToArray(item.structure_beneficiaire);
    if (
      item.action == 'Accompagnement - CDP Fixe' ||
      item.action == 'Accompagnement - CDP Fixe (Global)'
    ) {
      if (item.sujet === 'Candidat') {
        data = await this.forge_request_nb_prescriptions_present_cdp(item, 'CDP FIXE', database);
      } else if (item.sujet === 'Atelier') {
        data = await this.forge_request_nb_atelier_cdp(item, 'CDP FIXE', database);
      }
    } else if (
      item.action == 'Accompagnement - CDP Mobile' ||
      item.action == 'Accompagnement - CDP Mobile (Global)'
    ) {
      if (item.sujet === 'Candidat') {
        data = await this.forge_request_nb_prescriptions_present_cdp(item, 'CDP MOBILE', database);
      } else if (item.sujet === 'Atelier') {
        data = await this.forge_request_nb_atelier_cdp(item, 'CDP MOBILE', database);
      }
    } else if (
      item.action == 'Accompagnement - CDP Fixe ou Mobile' ||
      item.action == 'Accompagnement - CDP Fixe ou Mobile (Global)'
    ) {
      if (item.sujet === 'Candidat') {
        data = await this.forge_request_nb_prescriptions_present_cdp(
          item,
          'CDP FIXE, CDP MOBILE',
          database,
        );
      } else if (item.sujet === 'Atelier') {
        data = await this.forge_request_nb_atelier_cdp(item, 'CDP FIXE, CDP MOBILE', database);
      }
    } else if (
      item.action == 'Accompagnement - Atelier Collectif' ||
      item.action == 'Accompagnement - Atelier Collectif (Global)'
    ) {
      if (item.sujet === 'Candidat') {
        data = await this.forge_request_nb_prescriptions_present_at_co(item, database);
      } else if (item.sujet === 'Atelier') {
        data = await this.forge_request_nb_atelier_at_co(item, database);
      }
    } else if (
      item.action == 'Accompagnement - Atelier Bien-être' ||
      item.action == 'Accompagnement - Atelier Bien-être (Global)'
    ) {
      if (item.sujet === 'Candidat') {
        data = await this.forge_request_nb_prescriptions_present_bien_etre(item, database);
      } else if (item.sujet === 'Atelier') {
        data = await this.forge_request_nb_atelier_bien_etre(item, database);
      }
    } else if (
      item.action == 'Accompagnement - CDP + Atelier collectif' ||
      item.action == 'Accompagnement - CDP + Atelier Collectif (Global)'
    ) {
      if (item.sujet === 'Candidat') {
        data = await this.forge_request_nb_prescriptions_present_cdp_at_co(item, database);
      } else if (item.sujet === 'Atelier') {
      }
    } else if (item.action == 'Accompagnement - CDP Feminin') {
      if (item.sujet === 'Candidat') {
        data = await this.forge_request_nb_prescriptions_present_cdp_bien_etre(item, database);
      } else if (item.sujet === 'Atelier') {
      }
    } else if (item.action == 'Accompagnement - Atelier Un temps pour elle') {
      if (item.sujet === 'Candidat') {
        data = await this.forge_request_nb_prescriptions_present_un_temps_pour_elle(item, database);
      } else if (item.sujet === 'Atelier') {
        data = await this.forge_request_nb_atelier_un_temps_pour_elle(item, database);
      }
    } else if (item.action == 'PC - Bénévole') {
      if (item.sujet === 'Bénévole') {
        data = await this.forge_request_nb_be_atelier(item, database);
      }
    }
    return data;
  }

  async forge_request_nb_prescriptions_present_un_temps_pour_elle(
    item: IndicateurItem,
    database: DatabaseCollections,
  ): Promise<any> {
    let customQuery: QueryCondition = {};
    customQuery = this.forge_request_sujet_critere(item.sujet_critere, item.structure_beneficiaire);
    customQuery = this.updateQuery(
      customQuery,
      'type_prestation',
      ['SOIN DES MAINS', 'SOIN DU VISAGE', 'COIFFURE'],
      '$in-tab',
    );
    customQuery = this.updateQuery(customQuery, 'statut', 'Présent', '$eq');
    customQuery = this.updateQuery(
      customQuery,
      'date_atelier',
      new Date(item.date_debut),
      '$gte-$lt',
      new Date(item.date_fin),
    );

    let sujet_loc_check = 0; // Les termes du sujet à rechercher
    let action_loc_check = 0; // Les termes de l'action à rechercher

    for (const localite of item.sujet_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        sujet_loc_check = 1;
      }
    }
    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }

    if (sujet_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'code_postal', item.sujet_localite);
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'atelier_lieu', item.action_localite);
    }

    const data = await database.bienetreenrcand
      .aggregate([
        {
          $match: customQuery,
        },
      ])
      .toArray();

    return data;
  }

  async forge_request_nb_prescriptions_present_cdp_bien_etre(
    item: IndicateurItem,
    database: DatabaseCollections,
  ): Promise<any> {
    let customQuery = this.forge_request_sujet_critere(item.sujet_critere, item.structure_beneficiaire);
    customQuery = this.updateQuery(customQuery, 'statut', 'Présent', '$eq');
    customQuery = this.updateQuery(
      customQuery,
      'date_atelier',
      new Date(item.date_debut),
      '$gte-$lt',
      new Date(item.date_fin),
    );
    let sujet_loc_check = 0; // Les termes du sujet à rechercher
    let action_loc_check = 0; // Les termes de l'action à rechercher

    for (const localite of item.sujet_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        sujet_loc_check = 1;
      }
    }
    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }

    if (sujet_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'candidat_residence', item.sujet_localite);
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'atelier_lieu', item.action_localite);
    }

    const data = await database.bienetreenrcand
      .aggregate([
        // Partie 1 : Filtrage des données selon customQuery
        {
          $match: customQuery, // Applique les critères personnalisés
        },
        {
          $lookup: {
            from: 'candidats',
            localField: 'candidat_record_id',
            foreignField: 'record_id',
            as: 'candidatDetails',
          },
        },
        {
          $lookup: {
            from: 'cdpenrcands',
            localField: 'candidat_record_id',
            foreignField: 'candidat_record_id',
            as: 'cdpDetails',
          },
        },
        {
          $match: {
            'cdpDetails.statut': 'Présent',
          },
        },
        {
          $addFields: {
            // Si candidatDetails contient un seul élément, on peut l'aplatir
            candidat: { $arrayElemAt: ['$candidatDetails', 0] },
            cdpenrcand: { $arrayElemAt: ['$cdpDetails', 0] },
          },
        },
      ])
      .toArray();
    return data;
  }

  async forge_request_nb_prescriptions_present_cdp_at_co(
    item: IndicateurItem,
    database: DatabaseCollections,
  ): Promise<any> {
    let customQuery = this.forge_request_sujet_critere(item.sujet_critere, item.structure_beneficiaire);
    customQuery = this.updateQuery(customQuery, 'statut', 'Présent', '$eq');
    customQuery = this.updateQuery(
      customQuery,
      'date_atelier',
      new Date(item.date_debut),
      '$gte-$lt',
      new Date(item.date_fin),
    );

    let sujet_loc_check = 0; // Les termes du sujet à rechercher
    let action_loc_check = 0; // Les termes de l'action à rechercher

    for (const localite of item.sujet_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        sujet_loc_check = 1;
      }
    }
    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }

    if (sujet_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'candidat_residence', item.sujet_localite);
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'atelier_lieu', item.action_localite);
    }

    const data = await database.atcoenrcand
      .aggregate([
        // Partie 1 : Filtrage des données selon customQuery
        {
          $match: customQuery, // Applique les critères personnalisés
        },
        {
          $lookup: {
            from: 'candidats',
            localField: 'candidat_record_id',
            foreignField: 'record_id',
            as: 'candidatDetails',
          },
        },
        {
          $lookup: {
            from: 'cdpenrcands',
            localField: 'candidat_record_id',
            foreignField: 'candidat_record_id',
            as: 'cdpDetails',
          },
        },
        {
          $match: {
            'cdpDetails.statut': 'Présent',
          },
        },
        {
          $addFields: {
            // Si candidatDetails contient un seul élément, on peut l'aplatir
            candidat: { $arrayElemAt: ['$candidatDetails', 0] },
            cdpenrcand: { $arrayElemAt: ['$cdpDetails', 0] },
          },
        },
      ])
      .toArray();
    return data;
  }

  async forge_request_nb_atelier_bien_etre(item: IndicateurItem, database: DatabaseCollections): Promise<any> {
    let customQuery: QueryCondition = {};
    customQuery = this.updateQuery(customQuery, 'date', item.date_debut, '$gte-$lt', item.date_fin);
    customQuery = this.updateQuery(customQuery, 'statut', 'Validé', '$eq');

    let action_loc_check = 0;

    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'atelier_lieu', item.action_localite);
    }
    const data = await database.bienetre.aggregate([{ $match: customQuery }]).toArray();
    return data;
  }

  async forge_request_nb_atelier_un_temps_pour_elle(
    item: IndicateurItem,
    database: DatabaseCollections,
  ): Promise<any> {
    let customQuery: QueryCondition = {};
    customQuery = this.updateQuery(
      customQuery,
      'type_prestation',
      ['SOIN DES MAINS', 'SOIN DU VISAGE', 'COIFFURE'],
      '$in-tab',
    );
    customQuery = this.updateQuery(customQuery, 'date', item.date_debut, '$gte-$lt', item.date_fin);
    customQuery = this.updateQuery(customQuery, 'statut', 'Validé', '$eq');

    let action_loc_check = 0;

    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'atelier_lieu', item.action_localite);
    }

    let sujet_loc_check = 0;

    for (const localite of item.sujet_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        sujet_loc_check = 1;
      }
    }

    if (sujet_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'candidat_residence', item.sujet_localite);
    }

    const data = await database.bienetre.aggregate([{ $match: customQuery }]).toArray();
    return data;
  }

  async forge_request_nb_prescriptions_present_bien_etre(
    item: IndicateurItem,
    database: DatabaseCollections,
  ): Promise<any> {
    let customQuery = this.forge_request_sujet_critere(item.sujet_critere, item.structure_beneficiaire);
    customQuery = this.updateQuery(customQuery, 'statut', 'Présent', '$eq');
    customQuery = this.updateQuery(
      customQuery,
      'date_atelier',
      new Date(item.date_debut),
      '$gte-$lt',
      new Date(item.date_fin),
    );

    let sujet_loc_check = 0; // Les termes du sujet à rechercher
    let action_loc_check = 0; // Les termes de l'action à rechercher

    for (const localite of item.sujet_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        sujet_loc_check = 1;
      }
    }
    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }

    if (sujet_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'candidat_residence', item.sujet_localite);
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'atelier_lieu', item.action_localite);
    }

    const data = await database.bienetreenrcand
      .aggregate([
        // Partie 1 : Filtrage des données selon customQuery
        {
          $match: customQuery, // Applique les critères personnalisés
        },
        {
          $lookup: {
            from: 'candidats',
            localField: 'candidat_record_id',
            foreignField: 'record_id',
            as: 'candidatDetails',
          },
        },
        {
          $addFields: {
            // Si candidatDetails contient un seul élément, on peut l'aplatir
            candidat: { $arrayElemAt: ['$candidatDetails', 0] },
          },
        },
      ])
      .toArray();
    return data;
  }

  async forge_request_nb_atelier_at_co(item: IndicateurItem, database: DatabaseCollections): Promise<any> {
    let customQuery: QueryCondition = {};
    customQuery = this.updateQuery(customQuery, 'date', item.date_debut, '$gte-$lt', item.date_fin);
    customQuery = this.updateQuery(customQuery, 'statut', 'Validé', '$eq');

    let action_loc_check = 0;

    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'commune', item.action_localite);
    }
    const data = await database.atco.aggregate([{ $match: customQuery }]).toArray();
    return data;
  }

  async forge_request_nb_prescriptions_present_at_co(
    item: IndicateurItem,
    database: DatabaseCollections,
  ): Promise<any> {
    let sujet_loc_check = 0;
    let action_loc_check = 0;

    let customQuery = this.forge_request_sujet_critere(item.sujet_critere, item.structure_beneficiaire);
    customQuery = this.updateQuery(
      customQuery,
      'date_atelier',
      new Date(item.date_debut),
      '$gte-$lt',
      new Date(item.date_fin),
    );

    const sujetLocalite = item.sujet_localite; // Les termes du sujet à rechercher
    const actionLocalite = item.action_localite; // Les termes de l'action à rechercher

    for (const localite of item.sujet_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        sujet_loc_check = 1;
      }
    }
    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }

    if (sujet_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'candidat_residence', sujetLocalite);
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'atelier_lieu', actionLocalite);
    }

    const response = await database.atcoenrcand
      .aggregate([
        // Partie 1 : Filtrage des données selon customQuery
        {
          $match: customQuery, // Applique les critères personnalisés
        },
        {
          $lookup: {
            from: 'candidats',
            localField: 'candidat_record_id',
            foreignField: 'record_id',
            as: 'candidatDetails',
          },
        },
        {
          $addFields: {
            // Si candidatDetails contient un seul élément, on peut l'aplatir
            candidat: { $arrayElemAt: ['$candidatDetails', 0] },
          },
        },
      ])
      .toArray();
    return response;
  }

  async forge_request_nb_atelier_cdp(
    item: IndicateurItem,
    type_cdp: string,
    database: DatabaseCollections,
  ): Promise<any> {
    let customQuery: QueryCondition = {};
    switch (type_cdp) {
      case 'CDP FIXE, CDP MOBILE':
        customQuery = this.updateQuery(customQuery, 'type', 'CDP MOBILE', '$in', 'CDP FIXE');
        break;
      case 'CDP FIXE':
        customQuery = this.updateQuery(customQuery, 'type', 'CDP FIXE', '$eq');
        break;
      case 'CDP MOBILE':
        customQuery = this.updateQuery(customQuery, 'type', 'CDP MOBILE', '$eq');
        break;
    }
    customQuery = this.updateQuery(customQuery, 'date', item.date_debut, '$gte-$lt', item.date_fin);
    customQuery = this.updateQuery(customQuery, 'statut', 'Validé', '$eq');

    let action_loc_check = 0;
    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'lieu', item.action_localite);
    }
    const response = await database.cdp.aggregate([{ $match: customQuery }]).toArray();
    return response;
  }

  async forge_request_nb_prescriptions_present_cdp(
    item: IndicateurItem,
    type_cdp: string,
    database: DatabaseCollections,
  ): Promise<any> {
    let customQuery = this.forge_request_sujet_critere(item.sujet_critere, item.structure_beneficiaire);

    customQuery = this.updateQuery(customQuery, 'date_atelier', item.date_debut, '$gte-$lt', item.date_fin);
    customQuery = this.updateQuery(customQuery, 'statut', 'Présent', '$eq');

    let action_loc_check = 0;
    let sujet_loc_check = 0;
    for (const localite of item.sujet_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        sujet_loc_check = 1;
      }
    }
    for (const localite of item.action_localite) {
      if (
        localite != "n'importe quel département de la région" &&
        localite != "N'importe quel département de la région" &&
        localite != 'France' &&
        localite != ''
      ) {
        action_loc_check = 1;
      }
    }
    if (sujet_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'candidat_residence', item.sujet_localite);
    }

    if (action_loc_check == 1) {
      customQuery = this.add_localite_to_query(customQuery, 'atelier_lieu', item.action_localite);
    }
    const response = await database.cdpenrcand
      .aggregate([
        // 1. Filtrage initial
        { $match: customQuery },

        // 2. Jointure avec la table des suivis
        {
          $lookup: {
            from: 'cdpsuivis',
            localField: 'candidat_record_id',
            foreignField: 'candidat_record_id',
            as: 'suiviDetails',
          },
        },
        // 3. Jointure avec la table des candidats
        {
          $lookup: {
            from: 'candidats',
            localField: 'candidat_record_id',
            foreignField: 'record_id',
            as: 'candidatDetails',
          },
        },

        // 4. Fusionner les champs utiles du suivi et du candidat
        {
          $addFields: {
            sortiesPositives: {
              $size: {
                $filter: {
                  input: '$suiviDetails',
                  as: 'suivi',
                  cond: {
                    $in: [
                      '$$suivi.situation_pro',
                      [
                        'CDI',
                        'CDD (- de 6 mois)',
                        'CDD (6 mois ou +)',
                        'En formation',
                        'En stage',
                        'Auto-entrepreneur / Entrepreneur/ Création entreprise',
                        "En alternance / En contrat d'apprentissage",
                        'Intérim',
                      ],
                    ],
                  },
                },
              },
            },
            nombreSuivis: { $size: '$suiviDetails' },

            // Si candidatDetails contient un seul élément, on peut l'aplatir
            candidat: { $arrayElemAt: ['$candidatDetails', 0] },
          },
        },
      ])
      .toArray();
    return response;
  }

  async forge_request_nb_be_atelier(item: IndicateurItem, database: DatabaseCollections): Promise<any> {
    let customQuery: QueryCondition = {};
    customQuery = this.updateQuery(
      customQuery,
      'date_atelier',
      new Date(item.date_debut),
      '$gte-$lt',
      new Date(item.date_fin),
    );
    customQuery = this.updateQuery(customQuery, 'statut', 'Présent', '$eq');
    customQuery = this.updateQuery(customQuery, 'est_be', 'Oui', '$eq');
    if (item.structure_beneficiaire.length > 0)
      customQuery = this.updateQuery(
        customQuery,
        'benev_structure',
        item.structure_beneficiaire,
        '$in-tab',
      );
    const data = await database.cdpenrbenev
      .aggregate([
        { $match: customQuery },
        {
          $group: {
            _id: '$benevole_id',
          },
        },

        // Lookup dans la collection "benevoles" (à adapter si le nom est différent)
        {
          $lookup: {
            from: 'benevs',
            localField: '_id',
            foreignField: 'record_id',
            as: 'benevole',
          },
        },
        {
          $unwind: {
            path: '$benevole',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          // Remonter les champs du bénévole au premier niveau
          $replaceRoot: { newRoot: '$benevole' },
        },
        // Aplatir si un seul bénévole attendu par ID
      ])
      .toArray();

    return data;
  }

  normalizeToArray(input: any): string[] {
    if (Array.isArray(input)) return input;
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed;
        return [input];
      } catch {
        return [input];
      }
    }
    return [];
  }
}