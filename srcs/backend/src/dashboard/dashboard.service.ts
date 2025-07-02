import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { EptService } from '../dev/ept/ept.service';

interface ApiResponse {
  date_fin: Date;
  date_debut: Date;
  objectif_quantity: number;
  resultat_quantity: number | null;
  indicateur: {
    action: string;
    action_localite: string[];
    sujet: string;
    sujet_critere: string[];
    sujet_indicateur: string;
    sujet_localite: string[];
  };
}

interface TreeNode {
  label: string;
  next?: TreeNode[] | ObjectifData[];
}

interface ObjectifData {
  objectif: number;
  realise: number | null;
  date_debut: string;
  date_fin: string;
}

@Injectable()
export class DashboardService {

    uri :any = process.env.MONGODB_URL;
    private client: MongoClient;

    constructor(private eptService: EptService) {this.client = new MongoClient(this.uri);}

    data :any = [];

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
        return [input];
    }

    getOrCreateNode(list: TreeNode[], label: string): TreeNode {
        let node = list.find(item => item.label === label);
        if (!node) {
            node = { label, next: [] };
            list.push(node);
        }
        return node;
    }
    
    isTreeNodeList(next: TreeNode[] | ObjectifData[] | undefined): next is TreeNode[] {
        return Array.isArray(next) && next.length > 0 && 'label' in next[0];
    }


transformData(apiData: ApiResponse[]): any {
  const tree: TreeNode[] = [];

  const getOrCreateNode = (list: TreeNode[], label: string): TreeNode => {
    let node = list.find(n => n.label === label);
    if (!node) {
      node = { label, next: [] };
      list.push(node);
    }
    return node;
  };

  const isTreeNodeList = (next: TreeNode[] | { objectif: number; realise: number | null }[] | undefined): next is TreeNode[] => {
    return Array.isArray(next) && (next.length === 0 || 'label' in next[0]);
  };

  for (const entry of apiData) {
    const indicateur = entry.indicateur;

    if(indicateur[0]?.action_localite)
        indicateur[0].action_localite = this.normalizeToArray(indicateur[0].action_localite);
    if(indicateur[0]?.sujet_localite)
        indicateur[0].sujet_localite = this.normalizeToArray(indicateur[0].sujet_localite);
    if(indicateur[0]?.sujet_critere)
        indicateur[0].sujet_critere = this.normalizeToArray(indicateur[0].sujet_critere);

    const sujetLocalites = indicateur[0].sujet_localite;
    const actionLocalites = indicateur[0].action_localite;
    const sujetsCritere = indicateur[0].sujet_critere;

    for (const actionLocalite of actionLocalites) {
      const localiteNode = getOrCreateNode(tree, actionLocalite || 'n\'importe quel département de la région');

      if (!isTreeNodeList(localiteNode.next)) continue;

      for (const sujetLocalite of sujetLocalites) {
        const sujetLocaliteNode = getOrCreateNode(localiteNode.next, sujetLocalite);

        if (!isTreeNodeList(sujetLocaliteNode.next)) continue;

        const actionNode = getOrCreateNode(sujetLocaliteNode.next, indicateur[0].action || 'Action inconnue');

        if (!isTreeNodeList(actionNode.next)) continue;

        const sujetNode = getOrCreateNode(actionNode.next, indicateur[0].sujet || 'Sujet inconnu');

        if (!isTreeNodeList(sujetNode.next)) continue;

        const critereList = sujetsCritere.map(critere => {
        return {
            label: critere || 'Tous',
            next: [{
              date_debut: entry.date_debut.toLocaleString('FR').slice(0, 10),
              date_fin: entry.date_fin.toLocaleString('FR').slice(0, 10),
              objectif: entry.objectif_quantity || 0,
              realise: entry.resultat_quantity || 0,
            }]
        };})

        critereList.sort((a, b) => {
          const dateA = new Date(a.next[0].date_fin).getTime();
          const dateB = new Date(b.next[0].date_fin).getTime();
          return dateA - dateB; // du plus ancien au plus récent
        });

        if (!Array.isArray(sujetNode.next)) {
            sujetNode.next = [];
        }

        (sujetNode.next as TreeNode[]).push(...critereList);
      }
    }
  }

function sortCriteriaByDateFin(nodes: TreeNode[]) {
  for (const node of nodes) {
    if (!node.next || !Array.isArray(node.next)) continue;

    const children = node.next as TreeNode[];

    const isObjectifNode = (n: TreeNode): boolean =>
      Array.isArray(n.next) &&
      n.next.length > 0 &&
      typeof n.next[0] === 'object' &&
      n.next[0] !== null &&
      'date_fin' in n.next[0];

    if (children.length > 0 && isObjectifNode(children[0])) {
      children.sort((a, b) => {
        const dateA = parseDateFR((a.next![0] as ObjectifData).date_fin).getTime();
        const dateB = parseDateFR((b.next![0] as ObjectifData).date_fin).getTime();
        return dateA - dateB;
      });

    } else {
      sortCriteriaByDateFin(children);
    }
  }
}

function parseDateFR(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`);
}
sortCriteriaByDateFin(tree);

  return tree;
}

    async getRapportXIndicateurData(today, database) {
        today = new Date(today);
        const db = this.client.db("test");
        const data = await db.collection("rapportxindicateurs").aggregate([
            { 
                $match: {
                    date_debut: { $lt: today },
                    date_fin: { $gte: today }
                },
            },
            {
                $lookup: {
                    from: "indicateurs",
                    localField: "indicateur_id",
                    foreignField: "record_id",
                    as: "indicateur"
                },
            }
        ]).toArray();
        return data;
    }

    async getDashboardData(today: Date | undefined) {
        const db = this.client.db("test");
        const cdp = db.collection("cdps");
        const cdpenrbenev = db.collection("cdpenrbenevs");
        const cdpenrcand = db.collection("cdpenrcands");
        const cdpsuivi = db.collection("cdpsuivis");
        const bienetreenrcand = db.collection("bienetreenrcands");
        const atcoenrcand = db.collection("atcoenrcands");
        const contactdestructure = db.collection("contactdestructures");
        const candidat = db.collection("candidats");
        const entreprisexcollecte = db.collection("entreprisexcollectes");
        const collecte = db.collection("collectes");
        const entreprisextri = db.collection("entreprisextris");
        const tri = db.collection("tris");
        const benev = db.collection("benevs");
        const structures = db.collection("structures");
        const referents = db.collection("contactdestructures");
        const atCo = db.collection("atcos");
        const bienEtre = db.collection("bienetres");
        const matching = db.collection("cdpenrcandxcdpenrbenevs");
        const evenement_pc = db.collection("evenementpcs");
        const rapport_x_indicateur = db.collection("rapportxindicateurs");
        const indicateur = db.collection("indicateurs");

        const database = {
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
            atCo,
            bienEtre,
            matching,
            evenement_pc,
            rapport_x_indicateur,
            indicateur,
        };
        let data: any = await this.getRapportXIndicateurData(today, database);
        data = this.transformData(data);
        return data;
    }

    async getDashboardDataTest() {
        // Simulate fetching data from a database or external service
        this.data = [
                    {
                        label: '75',
                          next: [
                            {
                              label: 'N\'importe quel département de la région',
                              next: [
                                {
                                  label: 'Accompagnement - CDP Fixe ou Mobile',
                                  next: [
                                    {
                                      label: 'Candidat',
                                      next: [
                                        {
                                          label: '< 20 ans',
                                          next: [{ objectif: 650, realise: 442 }]
                                        },
                                        {
                                          label: 'EPA',
                                          next: [{ objectif: 150, realise: 108 }]
                                        },
                                        {
                                          label: 'QPV',
                                          next: [{ objectif: 220, realise: 158 }]
                                        },
                                        {
                                          label: 'RSA',
                                          next: [{ objectif: 130, realise: 178 }]
                                        }
                                      ]
                                    }
                                  ]
                                },
                                {
                                  label: 'Accompagnement - Atelier Bien-être',
                                  next: [
                                    {
                                      label: 'Candidat',
                                      next: [
                                        {
                                          label: '> 49 ans',
                                          next: [{ objectif: 30, realise: 56 }]
                                        }
                                      ]
                                    },
                                    {
                                      label: 'Atelier',
                                      next: [
                                        {
                                          label: '',
                                          next: [{ objectif: 30, realise: 25 }]
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {
                          label: '93 - Paris Terre d\'Envol',
                          next: [
                            {
                              label: 'Aubervilliers',
                              next: [
                                {
                                  label: 'Accompagnement - CDP Fixe',
                                  next: [
                                    {
                                      label: 'Candidat',
                                      next: [
                                        {
                                          label: '< 20 ans',
                                          next: [{ objectif: 100, realise: 80 }]
                                        },
                                        {
                                          label: 'Femmes',
                                          next: [{ objectif: 150, realise: 108 }]
                                        }
                                      ]
                                    }
                                  ]
                                },
                                {
                                  label: 'Accompagnement - Atelier Bien-être',
                                 next: [
                                    {
                                      label: 'Candidat',
                                      next: [
                                        {
                                          label: '> 49 ans',
                                          next: [{ objectif: 30, realise: 56 }]
                                        }
                                      ]
                                    },
                                    {
                                      label: 'Atelier',
                                      next: [
                                        {
                                          label: '',
                                          next: [{ objectif: 30, realise: 25 }]
                                        }
                                      ]
                                   }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ];             
        return this.data;
    };
}
