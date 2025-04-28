export interface CardData {
    label: string;
    left: {
      label: string;
      nb_candidat?: number;
      nb_suivi?: number;
      sortie_positive?: number;
      nb_benevole?: number;
      nv_benevole?: number;
      nb_action?: number;
      nb_collecte?: number;
      nb_tri?: number;
      nb_collab?: number;
      nb_fresque?: number;
      nb_atelier_collab?: number;
      nb_premier_atelier?: number;
    };
    right: {
      label: string;
      nb_candidat?: number;
      remplissage?: number;
      structure_prescr?: number;
      nb_benevole?: number;
      nv_benevole?: number;
      nb_atelier_collab?: number;
      nb_premier_atelier?: number;
      nb_collab?: number;
    };
  }