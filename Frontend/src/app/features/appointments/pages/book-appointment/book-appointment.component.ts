import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],  // RouterLink added for template routerLink directives
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.scss']
})
export class BookAppointmentComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private paymentService = inject(PaymentService);
  private doctorService = inject(DoctorService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Session storage keys used to survive the Chapa full-page redirect
  private static readonly SK_STEP = 'bk_step';
  private static readonly SK_DOCTOR_ID = 'bk_doctorId';
  private static readonly SK_DOCTOR_UID = 'bk_doctorUserId';  // doctor's UserModel.UserId for chat
  private static readonly SK_DOCTOR_NAME = 'bk_doctorName';
  private static readonly SK_DATE = 'bk_date';
  private static readonly SK_TIME = 'bk_time';
  private static readonly SK_TYPE = 'bk_type';
  private static readonly SK_APPOINTMENT_ID = 'bk_appointmentId'; // appointment ID for chat welcome msg
  private static readonly SK_CLINIC_NAME = 'bk_clinicName';
  private static readonly SK_CLINIC_ADDRESS = 'bk_clinicAddress';
  private static readonly SK_CLINIC_CITY = 'bk_clinicCity';

  step = signal(1);
  appointmentType = signal<'Virtual' | 'InPerson'>('Virtual');
  selectedDate = signal('');
  selectedTime = signal('');
  notes = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successData = signal<any>(null);

  // Dynamic from route
  patientId = localStorage.getItem('patientId') || localStorage.getItem('userId') || '';
  doctorId = signal<string | null>(null);
  doctorUserId = signal<string | null>(null);  // UserModel.UserId — needed for chat
  doctorName = signal<string>('Selected Doctor');
  appointmentId = signal<string | null>(null); // AppointmentId — passed to chat for welcome message

  // Doctor appointment preferences
  acceptsOnline = signal<boolean>(true);
  acceptsInPerson = signal<boolean>(true);
  clinicName = signal<string | null>(null);
  clinicAddress = signal<string | null>(null);
  clinicCity = signal<string | null>(null);
  onlineFee = signal<number>(500);
  inPersonFee = signal<number>(800);

  dates = signal<{ date: string; day: string; dayNum: number; month: string }[]>([]);
  morningSlots = signal<string[]>([]);
  afternoonSlots = signal<string[]>([]);
  eveningSlots = signal<string[]>([]);
  schedules = signal<any>(null);

  private allMorningSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  private allAfternoonSlots = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  private allEveningSlots = ['17:00', '17:30', '18:00', '18:30'];

  ngOnInit(): void {
    // ── Restore state after Chapa redirect ──────────────────────────────────
    const savedStep = sessionStorage.getItem(BookAppointmentComponent.SK_STEP);
    if (savedStep === '5') {
      // Payment completed — restore success screen
      this.doctorId.set(sessionStorage.getItem(BookAppointmentComponent.SK_DOCTOR_ID));
      this.doctorUserId.set(sessionStorage.getItem(BookAppointmentComponent.SK_DOCTOR_UID));
      this.doctorName.set(sessionStorage.getItem(BookAppointmentComponent.SK_DOCTOR_NAME) || 'Your Doctor');
      this.selectedDate.set(sessionStorage.getItem(BookAppointmentComponent.SK_DATE) || '');
      this.selectedTime.set(sessionStorage.getItem(BookAppointmentComponent.SK_TIME) || '');
      this.appointmentType.set((sessionStorage.getItem(BookAppointmentComponent.SK_TYPE) as 'Virtual' | 'InPerson') || 'Virtual');
      this.appointmentId.set(sessionStorage.getItem(BookAppointmentComponent.SK_APPOINTMENT_ID));
      this.clinicName.set(sessionStorage.getItem(BookAppointmentComponent.SK_CLINIC_NAME) || null);
      this.clinicAddress.set(sessionStorage.getItem(BookAppointmentComponent.SK_CLINIC_ADDRESS) || null);
      this.clinicCity.set(sessionStorage.getItem(BookAppointmentComponent.SK_CLINIC_CITY) || null);
      this.step.set(5);
      this.clearSession();
      return;
    }

    // ── Normal init from doctor search/profile ───────────────────────────────
    const id = this.route.snapshot.queryParamMap.get('doctorId');
    if (!id) {
      this.router.navigate(['/patient/doctors']);
      return;
    }
    this.doctorId.set(id);
    this.loadDoctorDetails(id);
    this.loadSchedules(id);
  }

  private saveSession(): void {
    sessionStorage.setItem(BookAppointmentComponent.SK_STEP, '5');
    sessionStorage.setItem(BookAppointmentComponent.SK_DOCTOR_ID, this.doctorId() || '');
    sessionStorage.setItem(BookAppointmentComponent.SK_DOCTOR_UID, this.doctorUserId() || '');
    sessionStorage.setItem(BookAppointmentComponent.SK_DOCTOR_NAME, this.doctorName());
    sessionStorage.setItem(BookAppointmentComponent.SK_DATE, this.selectedDate());
    sessionStorage.setItem(BookAppointmentComponent.SK_TIME, this.selectedTime());
    sessionStorage.setItem(BookAppointmentComponent.SK_TYPE, this.appointmentType());
    sessionStorage.setItem(BookAppointmentComponent.SK_APPOINTMENT_ID, this.appointmentId() || '');
    sessionStorage.setItem(BookAppointmentComponent.SK_CLINIC_NAME, this.clinicName() || '');
    sessionStorage.setItem(BookAppointmentComponent.SK_CLINIC_ADDRESS, this.clinicAddress() || '');
    sessionStorage.setItem(BookAppointmentComponent.SK_CLINIC_CITY, this.clinicCity() || '');
  }

  private clearSession(): void {
    [
      BookAppointmentComponent.SK_STEP,
      BookAppointmentComponent.SK_DOCTOR_ID,
      BookAppointmentComponent.SK_DOCTOR_UID,
      BookAppointmentComponent.SK_DOCTOR_NAME,
      BookAppointmentComponent.SK_DATE,
      BookAppointmentComponent.SK_TIME,
      BookAppointmentComponent.SK_TYPE,
      BookAppointmentComponent.SK_APPOINTMENT_ID,
      BookAppointmentComponent.SK_CLINIC_NAME,
      BookAppointmentComponent.SK_CLINIC_ADDRESS,
      BookAppointmentComponent.SK_CLINIC_CITY,
    ].forEach(k => sessionStorage.removeItem(k));
  }

  loadDoctorDetails(id: string): void {
    this.doctorService.getDoctorById(id).subscribe({
      next: (res: any) => {
        const doctor = res?.data || res;
        if (doctor) {
          this.doctorName.set(`Dr. ${doctor.firstName} ${doctor.lastName}`);
          // Capture the UserModel.UserId — this is what the chat system uses
          const uid = doctor.userId || doctor.UserId;
          if (uid) this.doctorUserId.set(uid);

          // Load appointment type preferences
          this.acceptsOnline.set(doctor.acceptsOnline !== false);
          this.acceptsInPerson.set(doctor.acceptsInPerson !== false);
          this.clinicName.set(doctor.clinicName || null);
          this.clinicAddress.set(doctor.clinicAddress || null);
          this.clinicCity.set(doctor.clinicCity || null);
          this.onlineFee.set(doctor.onlineAppointmentFee || doctor.onlineFee || 500);
          this.inPersonFee.set(doctor.inPersonAppointmentFee || doctor.inPersonFee || 800);

          // If doctor only accepts one type, auto-select it and skip step 1
          if (!this.acceptsInPerson() && this.acceptsOnline()) {
            this.appointmentType.set('Virtual');
          } else if (!this.acceptsOnline() && this.acceptsInPerson()) {
            this.appointmentType.set('InPerson');
          }
        }
      }
    });
  }



  loadSchedules(id: string): void {
    this.appointmentService.getDoctorSchedules(id).subscribe({
      next: (res: any) => {
        const scheduleData = res?.data || {};
        this.schedules.set(scheduleData);
        this.generateAvailableDates(scheduleData);
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.generateDates(); // Fallback to generic dates if error
      }
    });
  }

  generateAvailableDates(scheduleData: any): void {
    const dates = [];
    const today = new Date();
    // Check next 14 days for availability
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Only add if the date exists in schedule and has free slots
      if (scheduleData[dateStr]) {
        const hasFree = scheduleData[dateStr].some((s: any) => s.isFree);
        if (hasFree) {
          dates.push({
            date: dateStr,
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' })
          });
        }
      }
    }
    this.dates.set(dates);
    if (dates.length > 0) {
      this.selectDate(dates[0].date);
    }
  }

  generateDates(): void {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push({
        date: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    this.dates.set(dates);
    this.morningSlots.set(this.allMorningSlots);
    this.afternoonSlots.set(this.allAfternoonSlots);
    this.eveningSlots.set(this.allEveningSlots);
  }

  selectType(type: 'Virtual' | 'InPerson'): void {
    this.appointmentType.set(type);
    this.step.set(2);
  }

  selectDate(date: string): void {
    this.selectedDate.set(date);
    this.selectedTime.set('');
    this.updateAvailableSlots(date);
  }

  updateAvailableSlots(date: string): void {
    const schedule = this.schedules();
    if (!schedule || !schedule[date]) {
      // If no schedule for this date, show all as fallback or show none?
      // Better none to respect availability.
      this.morningSlots.set([]);
      this.afternoonSlots.set([]);
      this.eveningSlots.set([]);
      return;
    }

    const daySchedules = schedule[date];

    const filterSlots = (slots: string[]) => {
      return slots.filter(slot => {
        // Slot is e.g. "08:30"
        // Check if it falls into any isFree: true range
        return daySchedules.some((s: any) => {
          if (!s.isFree) return false;
          const start = s.timeRange.startTime; // "09:00:00"
          const end = s.timeRange.endTime;     // "17:00:00"
          return slot >= start.substring(0, 5) && slot < end.substring(0, 5);
        });
      });
    };

    this.morningSlots.set(filterSlots(this.allMorningSlots));
    this.afternoonSlots.set(filterSlots(this.allAfternoonSlots));
    this.eveningSlots.set(filterSlots(this.allEveningSlots));
  }

  selectTime(time: string): void {
    this.selectedTime.set(time);
  }

  confirmDetails(): void { this.step.set(3); }
  goToPayment(): void { this.step.set(4); }

  // ✅ POST /api/appointments/book
  bookAppointment(): void {
    if (!this.patientId) {
      this.errorMessage.set('Patient ID not found. Please login again.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const data = {
      doctorId: this.doctorId(),
      patientId: this.patientId,
      appointmentDate: this.selectedDate(),
      appointmentTime: this.selectedTime(),
      appointmentType: this.appointmentType()
    };


    console.log('Booking:', data);

    this.appointmentService.bookAppointment(data).subscribe({
      next: (response: any) => {
        if (response?.success) {
          // Store the successfully requested appointment data
          this.successData.set(response.data);

          // Capture the doctor's UserModel.UserId from the response for chat routing
          const doctorUserIdFromResponse = response.data?.doctor?.userId || response.data?.doctor?.UserId;
          if (doctorUserIdFromResponse) {
            this.doctorUserId.set(doctorUserIdFromResponse);
          }

          // Capture the appointmentId so the chat welcome message can reference it
          const apptId = response.data?.appointmentId || response.data?.AppointmentId;
          if (apptId) {
            this.appointmentId.set(apptId);
          }

          // Now safely trigger the Chapa Checkout logic through the Payment Gateway!
          this.initiateCheckoutFlow(response.data);
        } else {
          this.isLoading.set(false);
          this.errorMessage.set(response?.message || 'Booking failed.');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Booking error:', error);
        this.errorMessage.set(error?.error?.message || 'Booking failed. Please try again.');
      }
    });
  }

  // Uses the connected Payment Backend to fire up the Chapa gateway
  initiateCheckoutFlow(appointmentData: any): void {
    const fee = this.appointmentType() === 'Virtual'
      ? this.onlineFee()
      : this.inPersonFee();

    const user = this.authService.currentUser() as any;
    const chargePayload = {
      amount: fee.toFixed(2),
      currency: "ETB",
      phoneNumber: user?.phone || "0900000000",
      paymentProvider: "1",      // Matches enum value e.g 'Chapa'
      paymentMethod: "0",        // e.g 'Card/Telebirr'
      email: user?.email || "patient@medconnect.com",
      firstName: user?.firstName || "Patient",
      lastName: user?.lastName || "User",
      txRef: `APPT-${Date.now()}`
    };

    this.paymentService.charge(chargePayload).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);

        // The backend will orchestrate with Chapa and return the checkout URL inside data!
        const checkoutUrl = res?.data?.checkoutUrl || res?.data?.data?.checkout_url;

        if (checkoutUrl) {
          // Save all state to sessionStorage BEFORE the full-page redirect
          // so we can restore the success screen when Chapa redirects back
          this.saveSession();
          window.location.href = checkoutUrl;
        } else {
          // Fallback to success step if checkout url parsing failed (or is mocked)
          this.step.set(5);
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error("Payment Gateway Error:", err);
        // Appointment was booked but payment redirect failed — show success anyway
        this.step.set(5);
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/patient/dashboard']);
  }

  /** Returns a sanitized Google Maps embed URL for the clinic. */
  getClinicMapEmbedUrl(): SafeResourceUrl | null {
    const parts = [this.clinicName(), this.clinicAddress(), this.clinicCity()]
      .filter(Boolean).join(', ');
    if (!parts) return null;
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(parts)}&output=embed&z=15`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /** Returns a Google Maps search link for the clinic. */
  getClinicMapsLink(): string {
    const parts = [this.clinicName(), this.clinicAddress(), this.clinicCity()]
      .filter(Boolean).join(', ');
    if (!parts) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
  }
}