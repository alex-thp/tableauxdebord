import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReservationService } from '../../services/reservation/reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('verifyPrescription')
  verifyPrescriptionAvailability(
    @Query('prescriptionId') prescriptionId: string,
  ) {
    return this.reservationService.verifyPrescriptionAvailability(
      prescriptionId,
    );
  }

  @Post('setPrescriptionOnSlot')
  setPrescriptionOnSlot(
    @Body('prescriptionId') prescriptionId: string,
    @Body('cdpId') cdpId: string,
    @Body('heure_rdv') heure_rdv: string,
  ) {
    return this.reservationService.setPrescriptionOnSlot(
      prescriptionId,
      cdpId,
      heure_rdv,
    );
  }

  @Get('reservationSlots')
  getReservationSlots(
    @Query('reservation_record_id') reservation_record_id: string,
  ) {
    return this.reservationService.getReservationSlots(reservation_record_id);
  }

  @Get('cdpEnrCand')
  getCdpEnrCand(
    @Query('candidat_nom') candidat_nom: string,
    @Query('candidat_prenom') candidat_prenom: string,
    @Query('candidat_date_naissance') candidat_date_naissance: string,
  ) {
    return this.reservationService.getCdpEnrCand(
      candidat_nom,
      candidat_prenom,
      candidat_date_naissance,
    );
  }

  @Get('availableSlots')
  getAvailableSlots(@Query('record_id') record_id: string) {
    return this.reservationService.getAvailableSlots(record_id);
  }

  @Post('eraseOldSlot')
  eraseOldSlot(@Body('slotId') slotId: string) {
    return this.reservationService.eraseOldSlot(slotId);
  }
}
