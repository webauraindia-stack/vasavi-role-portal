"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  User,
  Calendar,
  Check,
  X,
  Sparkles,
  MessageCircle,
  Loader2,
  HeartHandshake,
  IndianRupee,
  Wand2,
} from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { normalizeRangeSelection, todayStart } from "@/lib/date-range-selection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookingStore } from "@/stores/booking-store";
import { useDonorStore } from "@/stores/donor-store";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { formatCurrency, formatDate, calculateNights, cn } from "@/lib/utils";
import {
  calculateBookingPricing,
  getBenefitWalletSummary,
  canStackCoupon,
} from "@/lib/booking-benefits";
import { validateCoupon, suggestBestCoupons } from "@/lib/donor-engine";
import { MOCK_MEMBER_PROFILES } from "@/lib/data/community-members";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { BenefitWalletSummaryPanel } from "@/components/booking/benefit-wallet-summary";
import { BenefitCouponCard } from "@/components/booking/benefit-coupon-card";
import { PaymentBreakdownPanel } from "@/components/booking/payment-breakdown-panel";
import { MemberProfileCard } from "@/components/booking/member-profile-card";
import "react-day-picker/style.css";

const guestSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  countryCode: z.string().default("+91"),
  arrivalTime: z.string().min(1, "Select arrival time"),
  specialRequests: z.string().optional(),
});

type GuestForm = z.infer<typeof guestSchema>;

const SEVA_AMOUNTS = [0, 101, 501, 1001, 2501];

export function BookingModal() {
  const { data: session } = useSession();
  const {
    isOpen,
    step,
    selectedRoom,
    checkIn,
    checkOut,
    guestCount,
    roomCount,
    guestDetails,
    memberProfile,
    memberVerified,
    selectedCouponIds,
    useCompensationWallet,
    walletAmountToUse,
    promoDiscount,
    sevaDonation,
    whatsappConfirm,
    paymentMethod,
    bookingReference,
    closeBooking,
    nextStep,
    prevStep,
    setDates,
    setGuestDetails,
    setMemberProfile,
    setDonorSession,
    setSelectedCouponIds,
    setUseCompensationWallet,
    setWalletAmountToUse,
    setSevaDonation,
    setWhatsappConfirm,
    setPaymentMethod,
    completeBooking,
    reset,
  } = useBookingStore();

  const { donor, isAuthenticated, verifyMemberId, redeemCoupons } = useDonorStore();

  const [pickerRange, setPickerRange] = useState<DateRange | undefined>();
  const [memberIdInput, setMemberIdInput] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [autoSuggested, setAutoSuggested] = useState(false);

  useBodyScrollLock(isOpen);

  const activeDonor = memberProfile?.donor ?? donor;
  const isMemberFlow = memberVerified && !!activeDonor;

  const nights =
    checkIn && checkOut && selectedRoom ? calculateNights(checkIn, checkOut) : 1;

  const pricing = useMemo(() => {
    if (!selectedRoom) return null;
    const walletMax = activeDonor?.compensationCredits ?? 0;
    const walletUse = useCompensationWallet
      ? Math.min(walletAmountToUse || walletMax, walletMax)
      : 0;

    return calculateBookingPricing({
      nightlyRate: selectedRoom.pricePerNight,
      nights,
      roomCount,
      tier: activeDonor?.tier ?? null,
      coupons: activeDonor?.coupons ?? [],
      selectedCouponIds,
      compensationWallet: walletMax,
      useWalletAmount: walletUse,
      promoDiscount,
      sevaDonation,
    });
  }, [
    selectedRoom,
    nights,
    roomCount,
    activeDonor,
    selectedCouponIds,
    useCompensationWallet,
    walletAmountToUse,
    promoDiscount,
    sevaDonation,
  ]);

  const walletSummary = useMemo(
    () => getBenefitWalletSummary(activeDonor ?? null),
    [activeDonor]
  );

  const afterTierSubtotal = pricing
    ? pricing.subtotal - pricing.tierDiscount
    : 0;

  const handleBookingDateSelect = useCallback(
    (selected: DateRange | undefined) => {
      const { range, complete } = normalizeRangeSelection(selected);
      setPickerRange(range);
      if (complete && range?.from && range?.to) {
        setDates(range.from, range.to);
      }
    },
    [setDates]
  );

  useEffect(() => {
    if (!isOpen) {
      setPickerRange(undefined);
      setMemberIdInput("");
      setVerifyError("");
      setSuggestionMessage("");
      setAutoSuggested(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const tier = (session?.user as { tier?: string })?.tier;
    const isDonor = (session?.user as { isDonor?: boolean })?.isDonor;
    if (isDonor && tier && !memberVerified) {
      const discountMap: Record<string, number> = {
        bronze: 10,
        silver: 20,
        gold: 30,
        platinum: 50,
        elite: 75,
      };
      setDonorSession(tier as never, discountMap[tier] ?? 0);
    }
  }, [session, setDonorSession, memberVerified]);

  useEffect(() => {
    if (isAuthenticated && donor && !memberProfile) {
      const match = MOCK_MEMBER_PROFILES.find(
        (p) => p.memberId === donor.donorId || p.email === donor.email
      );
      if (match) setMemberProfile(match);
    }
  }, [isAuthenticated, donor, memberProfile, setMemberProfile]);

  useEffect(() => {
    if (step === 4 && isMemberFlow && activeDonor && !autoSuggested) {
      const suggestion = suggestBestCoupons(
        activeDonor.coupons.filter((c) => c.status === "available"),
        afterTierSubtotal
      );
      setSelectedCouponIds(suggestion.selectedIds);
      setSuggestionMessage(suggestion.message);
      setAutoSuggested(true);
    }
  }, [step, isMemberFlow, activeDonor, afterTierSubtotal, autoSuggested, setSelectedCouponIds]);

  const form = useForm<GuestForm>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: guestDetails.firstName ?? "",
      lastName: guestDetails.lastName ?? "",
      email: guestDetails.email ?? session?.user?.email ?? "",
      phone: guestDetails.phone ?? "",
      countryCode: guestDetails.countryCode ?? "+91",
      arrivalTime: guestDetails.arrivalTime ?? "15:00",
      specialRequests: guestDetails.specialRequests ?? "",
    },
  });

  if (!selectedRoom || !pricing) return null;

  const handleGuestSubmit = form.handleSubmit((data) => {
    setGuestDetails(data);
    nextStep();
  });

  const handleVerifyMember = async () => {
    setVerifying(true);
    setVerifyError("");
    await new Promise((r) => setTimeout(r, 600));
    const profile = verifyMemberId(memberIdInput.trim());
    if (profile) {
      setMemberProfile(profile);
      setAutoSuggested(false);
      setSelectedCouponIds([]);
    } else {
      setVerifyError("Member ID not found. Try DH-2024-8842, VCI-HYD-2841, or VCI-SEC-1092");
    }
    setVerifying(false);
  };

  const selectDemoProfile = (profileId: string) => {
    const profile = MOCK_MEMBER_PROFILES.find((p) => p.id === profileId);
    if (profile) {
      verifyMemberId(profile.memberId);
      setMemberProfile(profile);
      setMemberIdInput(profile.memberId);
      setAutoSuggested(false);
      setSelectedCouponIds([]);
      setVerifyError("");
    }
  };

  const toggleCoupon = (id: string) => {
    if (!activeDonor) return;
    const coupon = activeDonor.coupons.find((c) => c.id === id);
    if (!coupon) return;
    const validation = validateCoupon(coupon, afterTierSubtotal);
    if (!validation.valid && !selectedCouponIds.includes(id)) return;

    if (coupon.type === "free_booking") {
      setSelectedCouponIds(selectedCouponIds.includes(id) ? [] : [id]);
    } else {
      if (selectedCouponIds.includes(id)) {
        setSelectedCouponIds(selectedCouponIds.filter((cid) => cid !== id));
      } else if (canStackCoupon(selectedCouponIds, coupon, activeDonor.coupons)) {
        const withoutFree = selectedCouponIds.filter(
          (cid) => activeDonor.coupons.find((c) => c.id === cid)?.type !== "free_booking"
        );
        setSelectedCouponIds([...withoutFree, id]);
      }
    }
    setSuggestionMessage("");
  };

  const handlePayment = () => {
    const ref = `VH-${Date.now().toString(36).toUpperCase()}`;
    if (pricing.couponsConsumed.length > 0) {
      redeemCoupons(pricing.couponsConsumed);
    }
    completeBooking(ref);
  };

  const handleClose = () => {
    closeBooking();
    if (step === 7) setTimeout(reset, 300);
  };

  const availableCoupons =
    activeDonor?.coupons.filter((c) => c.status === "available") ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-charcoal/45 backdrop-blur-xs"
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed z-55 bg-white text-charcoal flex flex-col shadow-warm-lg",
              "inset-x-0 bottom-0 top-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
              "md:w-full md:max-w-[680px] md:max-h-[94vh] md:rounded-3xl border border-beige/40"
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
          >
            <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
              <motion.div className="w-10 h-1 rounded-full bg-beige" />
            </div>

            <div className="relative shrink-0 px-5 pt-4 pb-2 border-b border-beige/30 bg-gradient-to-b from-surface/80 to-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id="booking-title"
                    className="font-display text-lg md:text-xl font-bold text-charcoal tracking-tight truncate"
                  >
                    {step === 7 ? "Blessed journey confirmed" : `Reserve ${selectedRoom.name}`}
                  </h2>
                  <p className="text-xs text-muted font-semibold truncate">
                    {selectedRoom.hotelName}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-surface transition-colors shrink-0"
                  aria-label="Close booking"
                >
                  <X className="h-5 w-5 text-muted" />
                </button>
              </div>
              {step < 7 && <BookingStepper step={step} />}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
              {/* STEP 1 — Stay review */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="relative h-28 rounded-xl overflow-hidden">
                    <Image
                      src={selectedRoom.images[0] ?? selectedRoom.hotelName}
                      alt={selectedRoom.name}
                      fill
                      className="object-cover"
                      sizes="680px"
                    />
                    <motion.div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                    <motion.p className="absolute bottom-3 left-3 text-white font-display font-bold text-sm">
                      {selectedRoom.category} · {selectedRoom.bedType}
                    </motion.p>
                  </div>

                  <div className="card-surface p-4 space-y-3 text-sm">
                    <Row label="Retreat" value={selectedRoom.name} />
                    <Row
                      label="Stay dates"
                      value={
                        checkIn && checkOut
                          ? `${formatDate(checkIn)} – ${formatDate(checkOut)}`
                          : "Select below"
                      }
                      mono
                    />
                    {(!checkIn || !checkOut) && (
                      <DayPicker
                        mode="range"
                        selected={
                          pickerRange ?? {
                            from: checkIn ?? undefined,
                            to: checkOut ?? undefined,
                          }
                        }
                        onSelect={handleBookingDateSelect}
                        disabled={{ before: todayStart() }}
                        className="mx-auto rdp-root border border-beige/50 rounded-xl bg-white p-3"
                      />
                    )}
                    {checkIn && checkOut && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-xl bg-champagne/5 border border-champagne/20 px-3 py-2 text-center"
                      >
                        <p className="text-xs text-muted font-semibold uppercase tracking-wider">
                          Stay duration
                        </p>
                        <p className="font-display font-bold text-champagne text-lg">
                          {nights} {nights === 1 ? "night" : "nights"} · {roomCount}{" "}
                          {roomCount === 1 ? "room" : "rooms"}
                        </p>
                        <p className="text-[11px] text-muted">
                          {guestCount.adults} adults
                          {guestCount.children > 0 && `, ${guestCount.children} children`}
                        </p>
                      </motion.div>
                    )}
                    <div className="border-t border-beige/40 pt-2 flex justify-between font-bold">
                      <span>Estimated subtotal</span>
                      <span className="font-mono text-champagne-dark">
                        {formatCurrency(pricing.subtotal)}
                      </span>
                    </div>
                  </div>

                  <NavButtons onBack={handleClose} backLabel="Cancel" onNext={nextStep} nextDisabled={!checkIn || !checkOut} />
                </div>
              )}

              {/* STEP 2 — Guest */}
              {step === 2 && (
                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  <p className="text-sm text-muted">
                    Guest details for temple-town check-in & WhatsApp confirmation.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="First name" error={form.formState.errors.firstName?.message}>
                      <Input {...form.register("firstName")} className="h-11 bg-surface/50" />
                    </Field>
                    <Field label="Last name" error={form.formState.errors.lastName?.message}>
                      <Input {...form.register("lastName")} className="h-11 bg-surface/50" />
                    </Field>
                  </div>
                  <Field label="Email" error={form.formState.errors.email?.message}>
                    <Input type="email" {...form.register("email")} className="h-11 bg-surface/50" />
                  </Field>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="Code">
                      <Input {...form.register("countryCode")} className="h-11 bg-surface/50" />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Phone (WhatsApp)" error={form.formState.errors.phone?.message}>
                        <Input {...form.register("phone")} className="h-11 bg-surface/50" />
                      </Field>
                    </div>
                  </div>
                  <Field label="Arrival time">
                    <Input type="time" {...form.register("arrivalTime")} className="h-11 bg-surface/50" />
                  </Field>
                  <NavButtons onBack={prevStep} submit />
                </form>
              )}

              {/* STEP 3 — Member verification */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted leading-relaxed">
                    Verify your Vasavi Clubs International membership to unlock free stays,
                    compensation wallet, festival coupons, and donor rewards.
                  </p>

                  {memberProfile ? (
                    <MemberProfileCard profile={memberProfile} />
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Member ID e.g. DH-2024-8842"
                          value={memberIdInput}
                          onChange={(e) => setMemberIdInput(e.target.value.toUpperCase())}
                          className="h-11 font-mono bg-surface/50"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyMember}
                          disabled={verifying || !memberIdInput.trim()}
                          className="h-11 shrink-0 bg-champagne hover:bg-champagne/90 text-white font-bold"
                        >
                          {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                      {verifyError && (
                        <p className="text-xs text-rose-700 font-semibold">{verifyError}</p>
                      )}
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Demo profiles — tap to verify
                      </p>
                      <div className="grid gap-2">
                        {MOCK_MEMBER_PROFILES.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => selectDemoProfile(p.id)}
                            className="flex items-center gap-3 p-3 rounded-xl border border-beige/50 hover:border-champagne/40 hover:bg-surface/50 text-left transition-all"
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                              <Image src={p.avatarUrl} alt="" fill className="object-cover" sizes="40px" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-charcoal truncate">{p.name}</p>
                              <p className="text-[10px] text-muted font-mono">{p.displayId}</p>
                            </div>
                            <span className="text-[10px] font-bold text-champagne shrink-0">
                              {p.freeStaysRemaining > 0
                                ? `${p.freeStaysRemaining} free`
                                : p.compensationWallet > 0
                                ? formatCurrency(p.compensationWallet)
                                : "Donor"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <NavButtons
                    onBack={prevStep}
                    onNext={nextStep}
                    nextLabel={memberVerified ? "View blessings" : "Continue as guest"}
                  />
                </div>
              )}

              {/* STEP 4 — Blessings & coupons */}
              {step === 4 && (
                <div className="space-y-4">
                  {isMemberFlow && memberProfile && activeDonor ? (
                    <>
                      <BenefitWalletSummaryPanel
                        summary={walletSummary}
                        memberName={memberProfile.name}
                        tierLabel={memberProfile.categoryLabel}
                      />

                      {suggestionMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold"
                        >
                          <Wand2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          {suggestionMessage}
                        </motion.div>
                      )}

                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted">
                          Apply community blessings
                        </Label>
                        {selectedCouponIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCouponIds([]);
                              setSuggestionMessage("");
                            }}
                            className="text-[10px] font-bold text-rose-700"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                        {availableCoupons.length === 0 ? (
                          <p className="text-center py-8 text-muted text-sm border border-dashed border-beige rounded-xl">
                            No coupons in wallet. Visit{" "}
                            <a href="/donors" className="text-champagne font-bold">
                              Community Givers
                            </a>{" "}
                            to earn blessings.
                          </p>
                        ) : (
                          availableCoupons.map((coupon) => {
                            const validation = validateCoupon(coupon, afterTierSubtotal);
                            const canSelect =
                              validation.valid ||
                              selectedCouponIds.includes(coupon.id);
                            return (
                              <BenefitCouponCard
                                key={coupon.id}
                                coupon={coupon}
                                isSelected={selectedCouponIds.includes(coupon.id)}
                                isDisabled={!canSelect}
                                disabledReason={validation.reason}
                                onToggle={() => toggleCoupon(coupon.id)}
                              />
                            );
                          })
                        )}
                      </div>

                      {(activeDonor.compensationCredits ?? 0) > 0 && (
                        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="use-wallet"
                              checked={useCompensationWallet}
                              onCheckedChange={(c) => {
                                const on = c === true;
                                setUseCompensationWallet(on);
                                if (on) {
                                  setWalletAmountToUse(
                                    Math.min(
                                      activeDonor.compensationCredits,
                                      pricing.taxableBase + pricing.couponDiscount
                                    )
                                  );
                                }
                              }}
                            />
                            <label htmlFor="use-wallet" className="text-sm font-bold text-charcoal cursor-pointer">
                              Apply compensation wallet (
                              {formatCurrency(activeDonor.compensationCredits)} available)
                            </label>
                          </div>
                        </div>
                      )}

                      <PaymentBreakdownPanel pricing={pricing} />

                      <NavButtons
                        onBack={prevStep}
                        onNext={pricing.isFullyCovered && pricing.sevaDonation === 0 ? undefined : nextStep}
                        onNextClick={pricing.isFullyCovered && pricing.sevaDonation === 0 ? handlePayment : undefined}
                        nextLabel={
                          pricing.isFullyCovered && pricing.sevaDonation === 0
                            ? "Confirm blessed stay"
                            : "Continue"
                        }
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-center py-10 card-surface">
                        <Sparkles className="h-10 w-10 mx-auto text-champagne/40 mb-3" />
                        <p className="font-display font-bold text-charcoal">
                          Community rewards await
                        </p>
                        <p className="text-sm text-muted max-w-sm mx-auto mt-2">
                          Verify your member ID on the previous step, or sign in at the donor portal
                          to apply free stays and compensation credits.
                        </p>
                      </div>
                      <PaymentBreakdownPanel pricing={pricing} />
                      <NavButtons onBack={prevStep} onNext={nextStep} />
                    </>
                  )}
                </div>
              )}

              {/* STEP 5 — Seva donation */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-beige/50 bg-gradient-to-br from-amber-50/50 to-surface p-4">
                    <HeartHandshake className="h-8 w-8 text-champagne mb-2" />
                    <p className="font-display font-bold text-charcoal">
                      Optional seva — strengthen KCGF
                    </p>
                    <p className="text-sm text-muted mt-1 leading-relaxed">
                      Add a devotional contribution to the K.C. Gupta Fellow corpus. Your seva
                      compounds community education while earning reward points.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {SEVA_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setSevaDonation(amt)}
                        className={cn(
                          "py-2.5 rounded-xl border font-bold text-sm transition-all",
                          sevaDonation === amt
                            ? "border-champagne-dark bg-champagne/10 text-champagne"
                            : "border-beige hover:border-champagne/30"
                        )}
                      >
                        {amt === 0 ? "None" : `₹${amt}`}
                      </button>
                    ))}
                  </div>

                  <PaymentBreakdownPanel pricing={pricing} />
                  <NavButtons onBack={prevStep} onNext={nextStep} />
                </div>
              )}

              {/* STEP 6 — Payment */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Payment method
                      </p>
                      {(["upi", "card", "netbanking"] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3.5 rounded-xl border font-bold text-sm capitalize",
                            paymentMethod === method
                              ? "border-champagne-dark bg-champagne/5 text-charcoal"
                              : "border-beige hover:border-champagne/30"
                          )}
                        >
                          <CreditCard className="h-4 w-4 text-champagne" />
                          {method === "upi"
                            ? "UPI / GPay / PhonePe"
                            : method === "card"
                            ? "Credit / Debit Card"
                            : "Net Banking"}
                        </button>
                      ))}

                      <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                          id="whatsapp"
                          checked={whatsappConfirm}
                          onCheckedChange={(c) => setWhatsappConfirm(c === true)}
                        />
                        <label
                          htmlFor="whatsapp"
                          className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                          Send WhatsApp confirmation
                        </label>
                      </div>
                    </div>

                    <PaymentBreakdownPanel pricing={pricing} />
                  </div>

                  <NavButtons
                    onBack={prevStep}
                    onNext={handlePayment}
                    nextLabel={
                      pricing.total > 0
                        ? `Pay ${formatCurrency(pricing.total)}`
                        : "Confirm booking"
                    }
                    nextIcon={<IndianRupee className="h-4 w-4" />}
                  />
                </div>
              )}

              {/* STEP 7 — Confirmation & gratitude */}
              {step === 7 && bookingReference && (
                <div className="text-center space-y-5 py-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex w-18 h-18 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-700"
                  >
                    <Check className="h-8 w-8" />
                  </motion.div>

                  <div>
                    <h3 className="font-display text-2xl font-bold text-charcoal">
                      {pricing.isFullyCovered ? "Blessed stay confirmed" : "Reservation confirmed"}
                    </h3>
                    <p className="text-sm text-muted mt-2 max-w-md mx-auto leading-relaxed">
                      Your pilgrimage shelter at {selectedRoom.hotelName} is reserved with
                      Vasavi community blessings. May your journey be peaceful and fulfilling.
                    </p>
                  </div>

                  {memberProfile && (
                    <MemberProfileCard profile={memberProfile} compact />
                  )}

                  <div className="card-surface p-4 max-w-sm mx-auto text-left space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Reference</span>
                      <span className="font-mono font-bold">{bookingReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Check-in</span>
                      <span className="font-semibold">
                        {checkIn ? formatDate(checkIn) : "—"}
                      </span>
                    </div>
                    {pricing.couponDiscount + pricing.tierDiscount + pricing.walletApplied > 0 && (
                      <motion.div className="flex justify-between text-emerald-700 font-bold">
                        <span>Community savings</span>
                        <span className="font-mono">
                          {formatCurrency(
                            pricing.couponDiscount + pricing.tierDiscount + pricing.walletApplied
                          )}
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-beige/50 p-4 inline-block">
                    <QRCodeSVG
                      value={`https://vasavihotels.com/checkin/${bookingReference}`}
                      size={168}
                      level="M"
                      className="mx-auto"
                    />
                    <p className="text-[11px] text-muted mt-2 max-w-[200px] mx-auto">
                      Express QR check-in at temple reception — contactless & warm welcome
                    </p>
                  </div>

                  {whatsappConfirm && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 text-sm text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/60 rounded-xl py-2.5 px-4 max-w-sm mx-auto"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp confirmation sent to {form.getValues("phone") || "your number"}
                    </motion.div>
                  )}

                  <div className="rounded-2xl bg-gradient-to-r from-champagne/10 via-amber-50/50 to-surface border border-champagne/20 p-4 max-w-md mx-auto">
                    <p className="font-display text-sm font-bold text-champagne italic">
                      &ldquo;In service to community, we find the divine.&rdquo;
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                      — Vasavi Clubs International · Est. 1961, Hyderabad
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleClose}
                      className="flex-1 h-12 bg-champagne hover:bg-champagne/90 text-white font-bold rounded-xl"
                    >
                      Done
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl font-bold border-beige"
                      asChild
                    >
                      <a href="/account/bookings">My bookings</a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-muted font-medium">{label}</span>
      <span className={cn("font-bold text-charcoal", mono && "font-mono text-sm")}>
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-bold text-muted">{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="text-[10px] text-rose-700 mt-1 font-semibold">{error}</p>}
    </div>
  );
}

function NavButtons({
  onBack,
  backLabel = "Back",
  onNext,
  onNextClick,
  nextLabel = "Continue",
  nextDisabled,
  submit,
  nextIcon,
}: {
  onBack: () => void;
  backLabel?: string;
  onNext?: () => void;
  onNextClick?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  submit?: boolean;
  nextIcon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2 pt-4 border-t border-beige/40">
      <Button type="button" variant="outline" onClick={onBack} className="h-11 rounded-xl">
        <ChevronLeft className="h-4 w-4 mr-1" />
        {backLabel}
      </Button>
      <Button
        type={submit ? "submit" : "button"}
        onClick={onNextClick ?? onNext}
        disabled={nextDisabled}
        className="h-11 rounded-xl bg-champagne hover:bg-champagne/90 text-white font-bold"
      >
        {nextLabel}
        {nextIcon ?? <ChevronRight className="h-4 w-4 ml-1" />}
      </Button>
    </div>
  );
}
