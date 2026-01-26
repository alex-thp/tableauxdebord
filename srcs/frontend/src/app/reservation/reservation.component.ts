import { Component } from '@angular/core';
import { ReservationService } from './reservation.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { expand, of, switchMap, takeWhile, timer } from 'rxjs';

@Component({
  selector: 'app-reservation',
  imports: [CommonModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css',
})
export class ReservationComponent {
  record_id = '';
  reservation_record_id = '';
  candidat_nom = '';
  candidat_prenom = '';
  candidat_date_naissance = '';
  dispos: any[] = [];
  loader_1: boolean = false;
  loader_2: boolean = false;
  confirmationPanel: boolean = false;
  heure_rdv: string = '';

  loaderMessages: string[] = [
    'Dépoussiérage des miroirs...',
    'Chargement du dressing...',
    "Ajout d'une dose de bonne humeur...",
    'Chargement de la bienveillance...',
    'Réglage des projecteurs de réussite...',
    'Synchronisation des ondes positives...',
    'On y est presque...',
  ];

  currentMessage = this.loaderMessages[0];
  private messageIndex = 0;
  private messageInterval: any;

  constructor(
    private reservationService: ReservationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.reservation_record_id =
      this.route.snapshot.queryParamMap.get('reservation_record_id') || '';
    this.candidat_nom =
      this.route.snapshot.queryParamMap.get('candidat_nom') || '';
    this.candidat_prenom =
      this.route.snapshot.queryParamMap.get('candidat_prenom') || '';
    this.candidat_date_naissance =
      this.route.snapshot.queryParamMap.get('candidat_date_naissance') || '';
    this.loader_1 = true;
    this.loader_2 = true;
    this.startLoaderCarousel();

    this.reservationService
      .getCdpEnrCand(
        this.candidat_nom,
        this.candidat_prenom,
        this.candidat_date_naissance,
      )
      .pipe(
        expand((res: any) => {
          // 🔁 Si pas de résultat, on réessaie après 100 ms
          if (!res || !res.record_id) {
            return timer(100).pipe(
              switchMap(() =>
                this.reservationService.getCdpEnrCand(
                  this.candidat_nom,
                  this.candidat_prenom,
                  this.candidat_date_naissance,
                ),
              ),
            );
          } else {
            return of(); // stop si trouvé
          }
        }),
        takeWhile((res: any) => !res?.record_id, true), // continue tant que pas trouvé
      )
      .subscribe({
        next: (res: any) => {
          if (res?.record_id) {
            this.record_id = res.record_id;
            console.log('✅ Record trouvé :', this.record_id);
            this.loader_1 = false;
          } else {
            console.log('⏳ Recherche en cours...');
          }
        },
        error: (err) => {
          console.error('❌ Erreur lors de la recherche :', err);
          this.loader_1 = false;
        },
      });
    this.reservationService
      .getReservationSlots(this.reservation_record_id)
      .subscribe((slots: any[]) => {
        console.log('Slots reçus :', slots);
        this.loader_2 = false;

        this.dispos = slots.map((slot) => {
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
            slotsLibres: uniqueSlots,
            heure_rdv: slot.HEURE_RDV,
          };
        });
      });
  }

  ngOnDestroy() {
    this.stopLoaderCarousel();
  }

  startLoaderCarousel() {
    this.messageInterval = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.loaderMessages.length;
      this.currentMessage = this.loaderMessages[this.messageIndex];
    }, 2000); // change toutes les 2 secondes
  }

  stopLoaderCarousel() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  }

  selectedSlot: any = null;

  selectSlot(dispo: any, slot: any) {
    // Désélectionne tous les autres créneaux de toutes les dispos
    this.dispos.forEach((d) => {
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
    console.log('slot sélectionné pour réservation :', slot);
    this.reservationService
      .verifyPrescriptionAvailability(this.record_id)
      .subscribe((response) => {
        if (response[0].available === true) {
          console.log(response);
          this.reservationService
            .setPrescriptionOnSlot(
              this.record_id,
              slot.CDP_ID[0],
              slot.HEURE_RDV,
            )
            .subscribe((res) => {
              if (res.success) {
                alert(
                  `Créneau du ${date.toLocaleDateString()} à ${
                    slot.HEURE_RDV
                  } réservé avec succès !`,
                );
                this.reservationService.eraseOldSlot(slot.id).subscribe(() => {
                  window.location.replace(
                    `https://hook.eu2.make.com/ncxv24a5q8a3rvzvynqoml87nfvby95t?cdpenrcand=${this.record_id}&reservation_id=${this.reservation_record_id}`,
                  ); //ENVOYER MAIL ET SMS
                });
              } else {
                alert(
                  'Erreur lors de la réservation du créneau. Veuillez réessayer.',
                );
                window.location.reload();
              }
            });
        } else {
          alert('Vous êtes déjà positionné en atelier.');
        }
      });
    // reset la sélection uniquement pour la dispo concernée
    const dispo = this.dispos.find((d) => d.date === date);
    if (dispo) dispo.selectedSlot = null;
  }
}
