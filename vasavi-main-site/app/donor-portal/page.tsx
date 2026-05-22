"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  LogOut,
  Calendar,
  TrendingUp,
  Gift,
  Coins,
  Sparkles,
  HeartHandshake,
  Download,
  CheckCircle,
  Clock,
  Unlock,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDonorStore } from "@/stores/donor-store";
import { getNextTierProgress, getTierInfo, TIER_THRESHOLDS } from "@/lib/donor-engine";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Coupon } from "@/types";

// Custom float-animation for high-fidelity interactive confetti
const ConfettiParticle = ({ index }: { index: number }) => {
  const colors = ["#d4af37", "#f3e5ab", "#22c55e", "#3b82f6", "#ec4899", "#f59e0b"];
  const randColor = colors[index % colors.length];
  const randX = Math.random() * 100 - 50; // Random X spread
  const randDelay = Math.random() * 0.8;
  const randDuration = 1.5 + Math.random() * 1.5;

  return (
    <motion.div
      initial={{ y: 300, x: 0, opacity: 1, scale: 0.5, rotate: 0 }}
      animate={{
        y: -400,
        x: randX * 4,
        opacity: 0,
        scale: [0.5, 1.2, 0.4],
        rotate: 360 * (index % 2 === 0 ? 1 : -1),
      }}
      transition={{
        duration: randDuration,
        delay: randDelay,
        ease: "easeOut",
      }}
      className="absolute w-3.5 h-3.5 rounded-sm pointer-events-none"
      style={{
        backgroundColor: randColor,
        left: "50%",
        top: "60%",
      }}
    />
  );
};

export default function DonorPortalPage() {
  const router = useRouter();
  const { donor, isAuthenticated, logout, celebration, clearCelebration } = useDonorStore();
  const [activeTab, setActiveTab] = useState<"wallet" | "benefits" | "history">("wallet");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/donor-portal/login");
    }
  }, [isAuthenticated, router]);

  if (!donor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500 font-display font-medium animate-pulse">
          Connecting to Sanctuary Vault...
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(donor.tier);
  const { nextTier, progress } = getNextTierProgress(donor.totalDonation);

  // Community Impact calculation
  const supportedStudents = Math.max(1, Math.floor(donor.totalDonation / 10000));
  const fundedBusinesses = Math.max(0, Math.floor((donor.totalDonation - 10000) / 25000));

  const availableCoupons = donor.coupons.filter((c) => c.status === "available");
  const redeemedCoupons = donor.coupons.filter((c) => c.status === "redeemed");

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/50 to-white text-slate-800">
      
      {/* Dynamic Celebration Overlay Modal */}
      <AnimatePresence>
        {celebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            {/* Ambient background particles */}
            {Array.from({ length: 45 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 border border-amber-200 shadow-2xl text-center overflow-hidden"
            >
              {/* Decorative radial background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,87,0.1)_0%,transparent_70%)] pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="mx-auto w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center shadow-lg shadow-amber-200/30">
                  <Crown className="h-10 w-10 text-champagne animate-bounce" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-champagne bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    Reward Secured
                  </span>
                  <h3 className="font-display text-3xl font-black text-slate-900 tracking-tight leading-tight mt-2">
                    {celebration.title}
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {celebration.desc}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <Button
                    onClick={clearCelebration}
                    className="w-full h-12 bg-champagne hover:bg-champagne/90 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg shadow-amber-500/20"
                  >
                    Receive Blessings
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white/70 backdrop-blur-md border border-slate-200/70 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl shadow-md shrink-0">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Badge variant="donor" className="capitalize text-xs font-bold font-mono px-3 bg-champagne/15 border-champagne/30 text-champagne-dark">
                  ★ {donor.tier} Donor
                </Badge>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  ID: {donor.donorId}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-none">
                Welcome, {donor.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium font-mono">
                Member since {formatDate(donor.memberSince)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <Link href="/donors" className="hidden sm:inline">
              <Button variant="outline" className="h-10 text-xs font-bold border-slate-200 text-slate-700 bg-white shadow-sm">
                Support Community Schemes
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Bento Grid Stats KPIs Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatBentoCard
            title="Total Contributed"
            value={formatCurrency(donor.totalDonation)}
            subtext={`${donor.donations.length} transactions logged`}
            icon={TrendingUp}
            colorClass="text-emerald-600 bg-emerald-50 border-emerald-100/50"
          />
          <StatBentoCard
            title="Loyalty Points"
            value={donor.rewardPoints.toLocaleString()}
            subtext="Available for premium upgrades"
            icon={Sparkles}
            colorClass="text-amber-600 bg-amber-50 border-amber-100/50"
          />
          <StatBentoCard
            title="Compensation Credits"
            value={formatCurrency(donor.compensationCredits)}
            subtext="Stackable checkout cash"
            icon={Coins}
            colorClass="text-blue-600 bg-blue-50 border-blue-100/50"
          />
          <StatBentoCard
            title="Available Coupons"
            value={`${availableCoupons.length} Active`}
            subtext={`${redeemedCoupons.length} already claimed`}
            icon={Gift}
            colorClass="text-purple-600 bg-purple-50 border-purple-100/50"
          />
        </div>

        {/* Loyalty Progression Tracker & Streak */}
        {nextTier && (
          <div className="mb-10 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(212,175,87,0.06)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                  Tier Ascent Path
                </p>
                <h3 className="font-display text-lg font-black text-slate-900 mt-0.5">
                  Progress towards <span className="text-champagne font-black capitalize">{nextTier.name} Status</span>
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
                Streak: <strong className="text-champagne-dark">{donor.loyaltyStreak} months</strong>
              </span>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/30">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-champagne to-amber-600 rounded-full transition-all duration-1000 shadow-md relative"
                  style={{ width: `${progress}%` }}
                >
                  {/* Subtle particle glow effect */}
                  <div className="absolute top-0 right-0 w-2 h-full bg-white/40 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                <span>Current: {formatCurrency(donor.totalDonation)}</span>
                <span className="text-champagne-dark font-extrabold">
                  {formatCurrency(nextTier.minAmount - donor.totalDonation)} more to unlock {nextTier.name}
                </span>
                <span>Target: {formatCurrency(nextTier.minAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Primary Dashboard Grid: Tabs Wallet (Left) & Recent Feeds / Benefits (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Interactive Wallet & History Tabs */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              
              {/* Tab Toggles */}
              <div className="flex border-b border-slate-100 bg-slate-50/50 px-4 pt-4 gap-2 shrink-0">
                <TabButton
                  active={activeTab === "wallet"}
                  onClick={() => setActiveTab("wallet")}
                  icon={Gift}
                  label={`My Wallet (${availableCoupons.length})`}
                />
                <TabButton
                  active={activeTab === "benefits"}
                  onClick={() => setActiveTab("benefits")}
                  icon={Crown}
                  label="Tier Benefits"
                />
                <TabButton
                  active={activeTab === "history"}
                  onClick={() => setActiveTab("history")}
                  icon={Clock}
                  label={`Redemption Log (${redeemedCoupons.length})`}
                />
              </div>

              {/* Tab Contents */}
              <div className="p-6 flex-1 overflow-y-auto max-h-[580px]">
                
                {/* WALLET TAB */}
                {activeTab === "wallet" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Active Stash Stored
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Tap check-in modal to apply
                      </span>
                    </div>

                    {availableCoupons.length === 0 ? (
                      <div className="text-center py-16 text-slate-400">
                        <Gift className="h-12 w-12 mx-auto mb-3 opacity-30 text-champagne" />
                        <p className="font-display font-bold">Your Wallet is Empty</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Make a contribution to K.C. Gupta educational funds to trigger automatic reward milestones!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availableCoupons.map((coupon) => (
                          <CouponCard key={coupon.id} coupon={coupon} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* BENEFITS TAB */}
                {activeTab === "benefits" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-champagne" />
                        <h4 className="font-display font-bold text-slate-900 text-lg capitalize">
                          {donor.tier} Loyalty Perks
                        </h4>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">
                        Your level tier grants you elevated access and community welfare integrations at all eleven HotelHub destinations:
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {donor.bookingBenefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-amber-200/50 hover:shadow-sm transition-all"
                        >
                          <Unlock className="h-4 w-4 text-champagne shrink-0 mt-0.5" />
                          <span className="text-xs font-bold text-slate-700 leading-tight">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-4 mt-4 flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-champagne shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">KCGF Corpus Safeguard Enabled</h5>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Your contributions are placed within certified fixed deposits under the K.C. Gupta Fellow movement. Stays booked using donor benefits represent our express community gratitude.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* REDEMPTION LOG TAB */}
                {activeTab === "history" && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                      Historical Usage Logs
                    </p>

                    {redeemedCoupons.length === 0 ? (
                      <div className="text-center py-16 text-slate-400">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-30 text-slate-400" />
                        <p className="font-display font-bold">No Coupon Redeemed Yet</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Applied reward history will be documented here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {redeemedCoupons.map((coupon) => (
                          <div
                            key={coupon.id}
                            className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 bg-slate-50/20"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-black text-slate-700 line-through">
                                  {coupon.code}
                                </span>
                                <span className="bg-slate-200 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded capitalize">
                                  {coupon.type.replace("_", " ")}
                                </span>
                              </div>
                              <p className="text-xs text-slate-800 font-bold">{coupon.name}</p>
                              <p className="text-[10px] text-slate-400">Source: {coupon.source}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Claimed
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono block mt-1">
                                Expiry: {coupon.expiryDate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Right Column: Donation History Feed & Community Impact Metrics */}
          <div className="space-y-6">
            
            {/* Community Impact Bento Box */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-[radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.06)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <HeartHandshake className="h-5 w-5 text-emerald-600 animate-pulse" />
                <h4 className="font-display font-bold text-slate-900 text-base">
                  Community Impact
                </h4>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600">
                <ImpactIndicator
                  label="KCGF Education Fund"
                  value={`${supportedStudents} Students`}
                  detail="Vyasai student notebook & fee aid"
                />
                <ImpactIndicator
                  label="Self-Employment Loans"
                  value={`${fundedBusinesses} Families`}
                  detail="Interest-free enterprise capital microloans"
                />
                <ImpactIndicator
                  label="Welfare Network Strength"
                  value="Annadanam Partner"
                  detail="Daily devotional meals funded"
                />
              </div>
            </div>

            {/* Donation Records Feed */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-champagne" />
                  <h4 className="font-display font-bold text-slate-900 text-base">
                    Donation Records
                  </h4>
                </div>
                <Link href="/donors" className="text-[10px] text-champagne font-extrabold hover:underline">
                  Donate ₹
                </Link>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
                {donor.donations.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-amber-200/40 hover:shadow-xs transition-all flex justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900 tabular-nums">
                        {formatCurrency(d.amount)}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                        {d.paymentMethod}
                      </span>
                    </div>
                    <div className="text-right flex flex-col justify-between shrink-0">
                      <span className="text-[9px] text-slate-400 font-mono font-medium">
                        {formatDate(d.date)}
                      </span>
                      <button className="text-[9px] text-champagne hover:text-champagne-dark font-extrabold flex items-center gap-0.5 justify-end mt-1">
                        <Download className="h-2.5 w-2.5" /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Booking Trigger */}
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-warm text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,87,0.15)_0%,transparent_80%)] pointer-events-none" />
          <p className="text-amber-100/70 text-xs font-bold uppercase tracking-widest mb-1.5">
            Express Sanctuary Access
          </p>
          <h4 className="font-display text-white text-lg sm:text-xl font-bold mb-4">
            Apply rewards immediately on hotel rooms & suite packages
          </h4>
          <Link href="/search?donorExclusive=true">
            <Button className="h-11 bg-champagne hover:bg-champagne/90 text-white font-bold text-sm px-8 rounded-xl shadow-lg shadow-amber-500/20 transition-all">
              Book Donor Room Now
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

function StatBentoCard({
  title,
  value,
  subtext,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3 hover:shadow-sm transition-shadow`}>
      <div className={`p-2.5 rounded-xl shrink-0 border ${colorClass}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        <h4 className="font-display text-lg sm:text-xl font-black text-slate-950 mt-0.5 tracking-tight">
          {value}
        </h4>
        <p className="text-[9px] text-slate-500 mt-0.5 leading-snug font-medium">
          {subtext}
        </p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all outline-hidden min-h-10 border-t border-x ${
        active
          ? "bg-white border-slate-200/80 text-champagne-dark shadow-xs relative z-10 translate-y-[1px]"
          : "bg-transparent border-transparent text-slate-400 hover:text-slate-600"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ImpactIndicator({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex justify-between items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-amber-200/20 transition-all">
      <div className="space-y-0.5">
        <p className="font-bold text-slate-800 text-xs leading-none">{label}</p>
        <span className="text-[9px] text-slate-400 block leading-tight">{detail}</span>
      </div>
      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full shrink-0 font-mono">
        {value}
      </span>
    </div>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const isFree = coupon.type === "free_booking";
  
  // Custom theme HSL colors based on coupon type to look premium
  const cardThemes: Record<string, string> = {
    free_booking: "from-amber-500 to-amber-700 border-amber-300 text-white",
    percentage_discount: "from-purple-500 to-indigo-600 border-purple-300 text-white",
    fixed_compensation: "from-emerald-500 to-teal-600 border-emerald-300 text-white",
    special_access: "from-rose-500 to-red-600 border-rose-300 text-white",
    premium_benefit: "from-blue-500 to-cyan-600 border-blue-300 text-white",
  };
  const theme = cardThemes[coupon.type] || "from-slate-600 to-slate-800 border-slate-400 text-white";

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${theme} p-4.5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[140px] group`}
    >
      {/* Absolute ambient circles */}
      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 group-hover:scale-125 transition-transform" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 border border-white/30 px-2 py-0.5 rounded-full">
            {coupon.type.replace("_", " ")}
          </span>
          <span className="text-[9px] font-mono font-bold text-white/80">
            Source: {coupon.source}
          </span>
        </div>

        <h4 className="font-display font-black text-white text-base leading-snug mt-2.5">
          {coupon.name}
        </h4>
        <p className="text-[10px] text-white/80 leading-normal mt-1">
          {coupon.description}
        </p>
      </div>

      <div className="relative z-10 border-t border-white/20 pt-2 mt-2 flex justify-between items-end">
        <div>
          <p className="text-[8px] text-white/75 font-semibold leading-none">Voucher Code</p>
          <span className="font-mono text-xs font-black tracking-wider text-white">
            {coupon.code}
          </span>
        </div>
        <div className="text-right font-mono">
          <p className="text-[8px] text-white/75 font-semibold leading-none">Expires</p>
          <span className="text-[9px] font-bold text-white/90">
            {coupon.expiryDate}
          </span>
        </div>
      </div>
    </div>
  );
}
