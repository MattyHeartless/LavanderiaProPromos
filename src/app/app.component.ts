import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, isDevMode, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface PromoReward {
  couponId: string;
  label: string;
  benefit: string;
  code: string;
  hint: string;
  benefitType: string;
  benefitValue: number;
  eventType: string;
  expiresAt: string | null;
}

interface CatalogCoupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  benefitType: string;
  benefitValue: number;
  eventType: string;
  isActive: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  createdAt: string;
  updatedAt: string;
}

interface CouponsResponse {
  coupons: CatalogCoupon[];
}

interface PromoRegistrationResponse {
  id: string;
  email: string;
  fullName: string;
}

interface ServiceCard {
  title: string;
  text: string;
  icon: 'spark' | 'gift' | 'truck';
  tone: 'mint' | 'sand' | 'sky';
}

interface RegisterFormModel {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  private readonly couponsUrl = 'http://localhost:5009/api/catalogs/coupons';
  private readonly promoRegistrationUrl = 'http://localhost:5116/api/auth/registrousuariopromo';
  private readonly laundrAppUrl = isDevMode()
    ? 'http://localhost:4200/login'
    : 'https://laundr-app.ashywater-a0d6b972.westus2.azurecontainerapps.io/login';

  readonly fallbackPromos: PromoReward[] = [
    {
      couponId: '',
      label: '30% descuento',
      benefit: 'Llevate 30% de descuento en tu primer servicio a domicilio.',
      code: 'YTL30',
      hint: 'Perfecto para estrenar YoTeLavo con un ahorro que si se siente.',
      benefitType: 'percentage',
      benefitValue: 30,
      eventType: 'first_order',
      expiresAt: null
    },
    {
      couponId: '',
      label: 'Recogida gratis',
      benefit: 'Tu primera recogida corre por nuestra cuenta.',
      code: 'RECOJO24',
      hint: 'Empieza sin costo extra y descubre lo comodo que es lavar sin salir de casa.',
      benefitType: 'service',
      benefitValue: 0,
      eventType: 'first_order',
      expiresAt: null
    },
    {
      couponId: '',
      label: 'Envio gratis',
      benefit: 'Recibe tu pedido sin pagar envio en tu siguiente servicio.',
      code: 'ENVIOFREE',
      hint: 'Un premio facil de usar y perfecto para animarte a probar.',
      benefitType: 'service',
      benefitValue: 0,
      eventType: 'first_order',
      expiresAt: null
    },
    {
      couponId: '',
      label: 'Lavado express',
      benefit: 'Activa servicio express sin costo adicional.',
      code: 'EXPRESSVIP',
      hint: 'Ideal para quienes quieren sus prendas listas lo antes posible.',
      benefitType: 'service',
      benefitValue: 0,
      eventType: 'first_order',
      expiresAt: null
    },
    {
      couponId: '',
      label: '10% descuento',
      benefit: 'Aprovecha 10% de descuento asegurado en tu primer pedido.',
      code: 'PRIMER10',
      hint: 'Un gran empujon para agendar tu primera recoleccion hoy mismo.',
      benefitType: 'percentage',
      benefitValue: 10,
      eventType: 'first_order',
      expiresAt: null
    },
    {
      couponId: '',
      label: 'Kit premium',
      benefit: 'Mejora tu servicio con cuidado premium para prendas seleccionadas.',
      code: 'CUIDADOTOP',
      hint: 'Dale a tus prendas ese trato especial que marca diferencia.',
      benefitType: 'service',
      benefitValue: 0,
      eventType: 'first_order',
      expiresAt: null
    },
    {
      couponId: '',
      label: 'Dobles puntos',
      benefit: 'Duplica tus beneficios desde tu primera compra.',
      code: 'DOBLELAV',
      hint: 'Ideal para volver pronto y seguir aprovechando mas ventajas.',
      benefitType: 'service',
      benefitValue: 0,
      eventType: 'first_order',
      expiresAt: null
    },
    {
      couponId: '',
      label: 'Carga bonificada',
      benefit: 'Recibe una bonificacion especial en tu carga de bienvenida.',
      code: 'CARGALAV',
      hint: 'Una forma redonda de empezar a disfrutar el servicio.',
      benefitType: 'service',
      benefitValue: 0,
      eventType: 'first_order',
      expiresAt: null
    }
  ];

  readonly benefitHighlights = [
    'Recogemos en tu puerta',
    'Lavamos, secamos y doblamos por ti',
    'Te las devolvemos listas para usar'
  ];

  readonly serviceCards: ServiceCard[] = [
    {
      title: 'Tu primer pedido empieza mejor',
      text: 'Gira, gana y descubre lo facil que es estrenar tu lavanderia a domicilio con beneficio incluido.',
      icon: 'spark',
      tone: 'mint'
    },
    {
      title: 'Registrate, canjealo y disfruta',
      text: 'Completa tu registro, activa tu codigo y deja lista tu primera experiencia con YoTeLavo.',
      icon: 'gift',
      tone: 'sand'
    },
    {
      title: 'Beneficios listos para enamorar',
      text: 'Descuentos, envios gratis y premios pensados para que probar el servicio sea una decision facil.',
      icon: 'truck',
      tone: 'sky'
    }
  ];

  readonly bolts = Array.from({ length: 8 }, (_, index) => index);
  readonly confettiPieces = Array.from({ length: 18 }, (_, index) => index);
  readonly registration: RegisterFormModel = {
    fullName: '',
    email: '',
    phone: '',
    password: ''
  };

  readonly wheelRotation = signal(0);
  readonly isSpinning = signal(false);
  readonly selectedPromo = signal<PromoReward | null>(null);
  readonly showRegister = signal(false);
  readonly registrationCompleted = signal(false);
  readonly celebrationActive = signal(false);
  readonly showPrizeModal = signal(false);
  readonly showPassword = signal(false);
  readonly codeCopied = signal(false);
  readonly isLoadingCoupons = signal(true);
  readonly couponsError = signal(false);
  readonly isSubmittingRegistration = signal(false);
  readonly registrationError = signal('');
  readonly registeredUser = signal<PromoRegistrationResponse | null>(null);
  readonly promos = signal<PromoReward[]>(this.fallbackPromos);

  readonly wheelBackground = computed(() => this.buildWheelBackground(this.promos()));
  readonly labelPositions = computed(() =>
    this.promos().map((_, index) => this.buildPolarPosition(index, 31, this.promos().length))
  );
  readonly boltPositions = this.bolts.map((index) => this.buildPolarPosition(index, 46));

  constructor() {
    this.loadCoupons();
  }

  spinWheel(): void {
    const promos = this.promos();

    if (this.isSpinning() || this.isLoadingCoupons() || !promos.length) {
      return;
    }

    const selectedIndex = Math.floor(Math.random() * promos.length);
    const segmentAngle = 360 / promos.length;
    const centerAngle = segmentAngle * (selectedIndex + 0.5);
    const desiredAngle = (360 - centerAngle + 360) % 360;
    const currentRotation = this.wheelRotation();
    const currentAngle = ((currentRotation % 360) + 360) % 360;
    let delta = desiredAngle - currentAngle;

    if (delta < 0) {
      delta += 360;
    }

    this.selectedPromo.set(null);
    this.showRegister.set(false);
    this.registrationCompleted.set(false);
    this.celebrationActive.set(false);
    this.showPrizeModal.set(false);
    this.codeCopied.set(false);
    this.isSpinning.set(true);
    this.wheelRotation.set(currentRotation + 360 * 6 + delta);

    window.setTimeout(() => {
      this.selectedPromo.set(promos[selectedIndex]);
      this.showRegister.set(true);
      this.isSpinning.set(false);
      this.triggerCelebration();
      this.showPrizeModal.set(true);
    }, 4800);
  }

  submitRegistration(form: NgForm): void {
    const promo = this.selectedPromo();

    if (!promo || this.isSubmittingRegistration()) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (!promo.couponId) {
      this.registrationError.set('No hay un cupon valido disponible para este registro.');
      return;
    }

    this.isSubmittingRegistration.set(true);
    this.registrationError.set('');

    this.http.post<PromoRegistrationResponse>(this.promoRegistrationUrl, {
      user: {
        fullName: this.registration.fullName,
        email: this.registration.email,
        password: this.registration.password,
        phoneNumber: this.registration.phone
      },
      coupon: {
        couponId: promo.couponId,
        couponCode: promo.code,
        couponName: promo.label,
        couponDescription: promo.benefit,
        benefitType: promo.benefitType,
        benefitValue: promo.benefitValue,
        eventType: promo.eventType,
        expiresAt: promo.expiresAt
      },
      source: 'landing_promociones'
    }).subscribe({
      next: (response) => {
        this.registeredUser.set(response);
        this.registrationCompleted.set(true);
        this.showRegister.set(false);
        this.showPassword.set(false);
        this.isSubmittingRegistration.set(false);
        form.resetForm({
          fullName: '',
          email: '',
          phone: '',
          password: ''
        });
      },
      error: (error) => {
        const message = error?.error?.message || 'No se pudo completar el registro promocional.';
        this.registrationError.set(message);
        this.isSubmittingRegistration.set(false);
      }
    });
  }

  claimPrize(): void {
    this.showPrizeModal.set(false);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((current) => !current);
  }

  closeRegistrationSuccess(): void {
    this.registrationCompleted.set(false);
    this.selectedPromo.set(null);
    this.codeCopied.set(false);
    this.registeredUser.set(null);
    this.registrationError.set('');
  }

  goToLaundrApp(): void {
    window.location.href = this.laundrAppUrl;
  }

  async copyPromoCode(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.codeCopied.set(true);

      window.setTimeout(() => {
        this.codeCopied.set(false);
      }, 1800);
    } catch {
      this.codeCopied.set(false);
    }
  }

  private loadCoupons(): void {
    this.isLoadingCoupons.set(true);
    this.couponsError.set(false);

    this.http.get<CouponsResponse>(this.couponsUrl).subscribe({
      next: ({ coupons }) => {
        const mappedCoupons = (coupons ?? [])
          .filter((coupon) => coupon.isActive)
          .map((coupon) => this.mapCouponToPromo(coupon));

        if (mappedCoupons.length) {
          this.promos.set(mappedCoupons);
        }

        this.isLoadingCoupons.set(false);
      },
      error: () => {
        this.couponsError.set(true);
        this.promos.set(this.fallbackPromos);
        this.isLoadingCoupons.set(false);
      }
    });
  }

  private mapCouponToPromo(coupon: CatalogCoupon): PromoReward {
    return {
      couponId: coupon.id,
      label: coupon.name,
      benefit: coupon.description || this.buildBenefitText(coupon),
      code: coupon.code,
      hint: this.buildCouponHint(coupon),
      benefitType: coupon.benefitType,
      benefitValue: coupon.benefitValue,
      eventType: coupon.eventType,
      expiresAt: coupon.expiresAt
    };
  }

  private buildBenefitText(coupon: CatalogCoupon): string {
    if (coupon.benefitType === 'percentage') {
      if (coupon.benefitValue >= 100) {
        return 'Disfruta tu servicio sin costo en tu primer pedido.';
      }

      return `Obtien ${coupon.benefitValue}% de descuento en tu primer pedido.`;
    }

    return `Aprovecha el beneficio ${coupon.name} en tu primer pedido.`;
  }

  private buildCouponHint(coupon: CatalogCoupon): string {
    const expirationText = coupon.expiresAt
      ? `Disponible hasta ${new Date(coupon.expiresAt).toLocaleDateString('es-MX')}.`
      : 'Disponible por tiempo limitado.';

    return `${expirationText} Valido para ${coupon.eventType.replace('_', ' ')}.`;
  }

  private buildWheelBackground(promos: PromoReward[]): string {
    const segmentAngle = 360 / promos.length;
    const palette = ['#39e079', '#f5efe4'];
    const stops = promos.map((_, index) => {
      const start = index * segmentAngle;
      const end = start + segmentAngle;
      const color = palette[index % palette.length];
      return `${color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }

  private buildPolarPosition(index: number, radius: number, totalSegments = this.bolts.length): { left: number; top: number } {
    const segmentAngle = 360 / totalSegments;
    const angle = ((segmentAngle * (index + 0.5)) - 90) * (Math.PI / 180);

    return {
      left: 50 + Math.cos(angle) * radius,
      top: 50 + Math.sin(angle) * radius
    };
  }

  private triggerCelebration(): void {
    this.celebrationActive.set(true);

    window.setTimeout(() => {
      this.celebrationActive.set(false);
    }, 2600);
  }
}
