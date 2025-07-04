export interface ViewData {
    label?: string,  // Utilise string (minuscule)
    nb_passage_cdp_fixe?: number,  // Utilise number (primitif)
    nb_passage_cdp_mobile?: number,
    nb_presents?: number,
    nb_absents?: number,
    nb_qpv_fixe?: number,
    nb_qpv_mobile?: number,
    nb_sortie_positive?: number,
    nb_suivis?: number,
    note_satisfaction?: number,
    nb_asso_part?: number,
    nb_asso_part_prescr?: number,
    nb_prescr_fixe?: number,
    nb_prescr_mobile?: number,
    nb_prescr_fixe_attente?: number,
    nb_prescr_mobile_attente?: number,
    nb_prescr?: number,
    nb_prescr_attente?: number,
    nb_cand_at_co?: number,
    nb_cand_cdp_et_atco?: number,
    nb_cand_bien_etre?: number,
    nb_cand_cdp_et_bien_etre?: number,
    nb_session_acc?: number,
    nv_benevole?: number,
    benev_en_atelier?: number,
    nb_sensi?: number,
    array_one?:any, //un tableau d'objets de label/valeur
    array_two?:any,
    nb_present_sensi?: number,
    nb_action_benev?: number,
    nb_actions_93_95?: number,
    nb_collecte?: number,
    nb_tri?: number,
    nb_fresque?: number,
    nb_collabs?: number,
    arr_repart_collab?: any,
    string_asso_part_prescr?: string,
    nb_atelier_moyen_par_benevole?: number, //bénévole classique
    nb_atelier_moyen_par_be?: number, //bénévole entreprise
    nb_cand_atco_unique?: number,
    nbCollabsByMonth?: any, // Un tableau d'objets avec les mois et le nombre de collaborateurs
    nbCollabsByMonthUnique?: any,
    nbNouveauCollab?: number, // Nombre de nouveaux collaborateurs
}
