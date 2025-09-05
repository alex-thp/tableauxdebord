import { Component } from '@angular/core';
import { ReservationService } from './reservation.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reservation',
  imports: [CommonModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css'
})
export class ReservationComponent {

  record_id = "";
  dispos: any[] = [];
  loader: boolean = false;
  confirmationPanel: boolean = false;
  heure_rdv: string = "";
  constructor(private reservationService: ReservationService, private route: ActivatedRoute) {}

ngOnInit() {
  this.record_id = this.route.snapshot.queryParamMap.get('record_id') || '';
  this.loader = true;

  this.reservationService.getAvailableSlots(this.record_id).subscribe((slots: any[]) => {
    this.loader = false;

    this.dispos = slots.map(slot => {
      // on commence par formatter les créneaux
      let slotsLibres = slot.slotsLibres || [];

      // déduplique en fonction de HEURE_RDV
      const uniqueSlotsMap = new Map<string, any>();
      for (const s of slotsLibres) {
        if (!uniqueSlotsMap.has(s.HEURE_RDV)) {
          uniqueSlotsMap.set(s.HEURE_RDV, s);
        }
      }
      const uniqueSlots = Array.from(uniqueSlotsMap.values());

      return {
        label: slot.label,
        date: new Date(slot.date),
        lieu: slot.lieu,
        slotsLibres: uniqueSlots
      };
    });

    console.log("dispos formatés (dédupliqués) >>>", this.dispos);
  });
}

  selectedSlot: any = null;

selectSlot(dispo: any, slot: any) {
  // Désélectionne tous les autres créneaux de toutes les dispos
  this.dispos.forEach(d => {
    if (d !== dispo) d.selectedSlot = null;
  });

  // Sélectionne le slot cliqué, désélectionne s'il était déjà sélectionné
  dispo.selectedSlot = dispo.selectedSlot === slot ? null : slot;
}

askForConfirmation(dispo: any) {
  this.heure_rdv = dispo.selectedSlot.HEURE_RDV;
  this.confirmationPanel = true;
}

onCancel() {
  this.confirmationPanel = false;
}

reserverCreneau(date: Date, slot: any) {
  this.reservationService.verifyPrescriptionAvailability(this.record_id).subscribe((response) => {
    console.log('Vérification de la disponibilité de la prescription:', response);
    if(response[0].available === true) {
      this.reservationService.setPrescriptionOnSlot(this.record_id, slot.CDP_ID[0]).subscribe((res) => {
      console.log('Réponse de la réservation:', res);
      if(res.success) {
        alert(`Créneau du ${date.toLocaleDateString()} à ${slot.HEURE_RDV} réservé avec succès !`);
        this.reservationService.eraseOldSlot(slot.id).subscribe(() => {
          window.location.reload();});
      } else {
        alert("Erreur lors de la réservation du créneau. Veuillez réessayer.");
        window.location.reload();
      }
    });
    } else {
      alert("Vous êtes déjà positionné en atelier.");
    }
  });
  // reset la sélection uniquement pour la dispo concernée
  const dispo = this.dispos.find(d => d.date === date);
  if (dispo) dispo.selectedSlot = null;
}

}
