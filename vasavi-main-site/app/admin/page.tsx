"use client";

import { useState, useMemo } from "react";
import {
  Building,
  Users,
  DollarSign,
  Percent,
  Sliders,
  Calendar,
  Layers,
  ShieldCheck,
  RefreshCw,
  Search,
  Gift,
  PlusCircle,
  ShieldAlert,
  Coins,
  Sparkles,
  Trash2,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { HOTELS, getRoomsForHotel } from "@/lib/data/hotels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useCampaignStore } from "@/stores/campaign-store";
import { useDonorStore } from "@/stores/donor-store";
import { generateCouponCode } from "@/lib/donor-engine";
import type { CouponType } from "@/types";

// Mock reservation history for the ERP feed
const MOCK_RESERVATIONS = [
  {
    id: "tx-4932",
    guestName: "Kalyan Ram",
    hotelName: "Sri Vasavi Nityannadana Residency",
    roomType: "Family Room",
    checkIn: "2026-05-18",
    status: "Confirmed",
    amount: 5000,
    tier: "Gold",
  },
  {
    id: "tx-4931",
    guestName: "Lakshmi Prasanna",
    hotelName: "Sri Venkateswara Pilgrim Stay",
    roomType: "Standard AC",
    checkIn: "2026-05-19",
    status: "Confirmed",
    amount: 1800,
    tier: "Silver",
  },
  {
    id: "tx-4930",
    guestName: "Venkata Rao",
    hotelName: "Sri Vasavi Kanyaka Grand",
    roomType: "Donor AC Room",
    checkIn: "2026-05-20",
    status: "Pending",
    amount: 2160,
    tier: "Platinum",
  },
  {
    id: "tx-4929",
    guestName: "Chandra Sekhar",
    hotelName: "Mysore Vasavi Chamundeshwari Palace",
    roomType: "Standard Non-AC",
    checkIn: "2026-05-22",
    status: "Cancelled",
    amount: 2000,
    tier: "None",
  },
];

// Mock Anti-Abuse Auditor Logs
const MOCK_AUDIT_LOGS = [
  {
    id: "audit-1",
    timestamp: "2026-05-18T17:35:10",
    type: "block" as const,
    message: "Donor SRINIVAS RAO [DH-2024-8842] attempted to stack 4 compensation credits during checkout. Stacking limit enforced: system successfully blocked 4th coupon.",
  },
  {
    id: "audit-2",
    timestamp: "2026-05-18T17:28:44",
    type: "verified" as const,
    message: "Verified zero-payment room stay coupon [FREE-STAY-9321] checked out successfully. Invoice matched. Reference HH-L8K32A. Status: SAFE.",
  },
  {
    id: "audit-3",
    timestamp: "2026-05-18T16:50:11",
    type: "block" as const,
    message: "Double-redemption threat alert: Concurrent checkout requests logged for coupon [PCT-15-REF] from IP 192.168.1.104 and IP 192.168.1.109. Lock enforced. Rejected session 2.",
  },
  {
    id: "audit-4",
    timestamp: "2026-05-18T16:15:32",
    type: "warning" as const,
    message: "Verification failed: Expired coupon check bypass attempted for code [COMP-500-USED]. System rejected authorization. Status: RESTRICTED.",
  },
];

export default function AdminDashboardPage() {
  const [activeMasterTab, setActiveMasterTab] = useState<"reservations" | "rewards">("reservations");
  const [selectedHotelId, setSelectedHotelId] = useState<string>("all");
  const [priceOverridePercent, setPriceOverridePercent] = useState<number>(0);
  const [isSuccessNotification, setIsSuccessNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Campaign store linkage
  const { campaigns, addCampaign, toggleCampaign, deleteCampaign } = useCampaignStore();
  const { donor, issueManualCoupon } = useDonorStore();

  // Campaign Form state
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignType, setNewCampaignType] = useState<CouponType>("fixed_compensation");
  const [newCampaignValue, setNewCampaignValue] = useState(1000);
  const [newCampaignMinDonation, setNewCampaignMinDonation] = useState(10000);
  const [newCampaignDays, setNewCampaignDays] = useState(90);
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [isCampaignSuccess, setIsCampaignSuccess] = useState(false);

  // Manual Grantor Form state
  const [grantName, setGrantName] = useState("Vysha Seva Merit Voucher");
  const [grantType, setGrantType] = useState<CouponType>("fixed_compensation");
  const [grantValue, setGrantValue] = useState(2500);
  const [grantMinBooking, setGrantMinBooking] = useState(0);
  const [grantDesc, setGrantDesc] = useState("VIP Devotional Room credit granted by Sanctuary Trustees");
  const [grantExpiryDays, setGrantExpiryDays] = useState(180);
  const [isGrantSuccess, setIsGrantSuccess] = useState(false);

  // Get active rooms list based on selection
  const activeRooms = useMemo(() => {
    let list = HOTELS.flatMap((h) => getRoomsForHotel(h.id));
    if (selectedHotelId !== "all") {
      list = list.filter((r) => r.hotelId === selectedHotelId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.hotelName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedHotelId, searchQuery]);

  const handleApplyOverride = () => {
    setIsSuccessNotification(true);
    setTimeout(() => setIsSuccessNotification(false), 3000);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    addCampaign({
      name: newCampaignName,
      type: newCampaignType,
      rewardValue: newCampaignValue,
      minDonationRequired: newCampaignMinDonation,
      description: newCampaignDesc || `Milestone reward campaign granting ${newCampaignType.replace("_", " ")}`,
      active: true,
      expiryDays: newCampaignDays,
    });

    setNewCampaignName("");
    setNewCampaignDesc("");
    setIsCampaignSuccess(true);
    setTimeout(() => setIsCampaignSuccess(false), 3000);
  };

  const handleManualGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donor) return;

    const code = generateCouponCode(grantType, grantValue);
    const expiryDateStr = new Date(Date.now() + grantExpiryDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    issueManualCoupon({
      code,
      name: grantName,
      type: grantType,
      value: grantValue,
      minBookingAmount: grantMinBooking,
      expiryDate: expiryDateStr,
      usageLimit: 1,
      status: "available",
      description: grantDesc,
      source: "Manual Administrator Grant",
    });

    setIsGrantSuccess(true);
    setTimeout(() => setIsGrantSuccess(false), 3000);
  };

  // Generate dynamic stats
  const totalRevenue = 1485600;
  const averageOccupancy = 78.4;
  const activeReservations = 328;

  // Rewards metrics
  const totalCouponsIssued = (donor?.coupons.length ?? 0) + campaigns.reduce((acc, c) => acc + c.redemptionsCount, 0) + 120;
  const activeCampaignsCount = campaigns.filter(c => c.active).length;
  const totalCreditsClaimed = donor?.coupons.filter(c => c.status === "redeemed").reduce((sum, c) => sum + (c.type === "fixed_compensation" ? c.value : 1500), 0) ?? 8500;

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50/50 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" /> System Operational
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Vasavi Hotels ERP Panel
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium font-mono">
              Multi-property reservation management, dynamic inventory analytics, and rewards campaign suites.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMasterTab("reservations")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeMasterTab === "reservations"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Reservations & Inventory
            </button>
            <button
              onClick={() => setActiveMasterTab("rewards")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeMasterTab === "rewards"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Donor Rewards & Campaigns
            </button>
          </div>
        </div>

        {/* Dynamic Alert Banner */}
        {isSuccessNotification && (
          <div className="mb-6 p-4 rounded-xl bg-champagne/10 border border-champagne/20 text-champagne text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <Sliders className="h-4 w-4 text-champagne" />
            Seasonal price adjustments of {priceOverridePercent}% successfully dispatched to all 11 global destinations.
          </div>
        )}

        {/* ==================== TAB 1: RESERVATIONS & INVENTORY ==================== */}
        {activeMasterTab === "reservations" && (
          <>
            {/* Analytics KPIs Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Active Properties"
                value="11 Hotels"
                subtext="Global network active"
                icon={Building}
                colorClass="text-champagne bg-champagne/10"
              />
              <StatCard
                title="Seasonal Occupancy"
                value={`${averageOccupancy}%`}
                subtext="+4.2% compared to last week"
                icon={Percent}
                colorClass="text-amber-600 bg-amber-50"
              />
              <StatCard
                title="Total Bookings (YTD)"
                value={activeReservations.toLocaleString()}
                subtext="34 in queue tonight"
                icon={Users}
                colorClass="text-emerald-600 bg-emerald-50"
              />
              <StatCard
                title="Est. Monthly Income"
                value={formatCurrency(totalRevenue)}
                subtext="Satvik catering included"
                icon={DollarSign}
                colorClass="text-champagne-dark bg-champagne-dark/10"
              />
            </div>

            {/* Primary ERP Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Inventory & Overrides Column */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Override Controls Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-champagne" />
                      <h2 className="font-display text-lg font-bold text-slate-900">
                        Live Price Override Console
                      </h2>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Real-time Sync
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">
                    Adjust base rates globally or for a specific destination. Ideal for high-traffic Hindu pilgrimage festivals, special holy events, or off-season discounts.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Select Target Hotel</Label>
                      <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200 text-slate-800">
                          <SelectValue placeholder="All Hotels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All 11 Properties</SelectItem>
                          {HOTELS.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Percentage Offset (%)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 15 for surge markup"
                        value={priceOverridePercent === 0 ? "" : priceOverridePercent}
                        onChange={(e) => setPriceOverridePercent(Number(e.target.value))}
                        className="h-11 bg-slate-50 border-slate-200 text-slate-800"
                      />
                    </div>
                    <Button
                      onClick={handleApplyOverride}
                      className="h-11 bg-champagne hover:bg-champagne/90 text-white font-semibold text-sm w-full transition-colors flex items-center justify-center gap-2"
                    >
                      Apply Rate Change
                    </Button>
                  </div>
                </div>

                {/* Inventory Heatmap Grid */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-champagne" />
                      <h2 className="font-display text-lg font-bold text-slate-900">
                        Room Inventory Control Heatmap
                      </h2>
                    </div>
                    <div className="relative w-full sm:w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-8 text-xs border-slate-200 bg-slate-50/50 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Heatmap Grid Cells */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                    {activeRooms.map((room) => {
                      const basePrice = room.pricePerNight;
                      const adjustmentAmount = Math.round(
                        basePrice * (1 + priceOverridePercent / 100)
                      );
                      const isAdjusted = priceOverridePercent !== 0;

                      return (
                        <div
                          key={room.id}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-champagne-dark/30 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[9px] font-bold text-champagne bg-champagne/10 px-2 py-0.5 rounded-full select-none max-w-[130px] truncate">
                                {room.hotelName}
                              </span>
                              <span className="text-[10px] text-slate-400 capitalize font-mono font-medium">
                                Floor {room.floor}
                              </span>
                            </div>
                            <h3 className="font-display text-sm font-bold text-slate-900 mt-2">
                              {room.name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {room.category} Room · {room.bedType}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100/80 pt-2.5 mt-1">
                            <div>
                              <p className="text-[9px] font-medium text-slate-400">Nightly Price</p>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="text-sm font-black text-slate-900 tabular-nums">
                                  {formatCurrency(adjustmentAmount)}
                                </span>
                                {isAdjusted && (
                                  <span className="text-[10px] text-slate-400 line-through tabular-nums">
                                    {formatCurrency(basePrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                room.isFullyBooked
                                  ? "bg-rose-500 animate-pulse"
                                  : "bg-emerald-500"
                              }`}
                              title={room.isFullyBooked ? "Fully Booked" : "Available"}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Live Streams Sidebar */}
              <div className="space-y-6">
                
                {/* Live reservation feed */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-champagne" />
                      <h2 className="font-display text-lg font-bold text-slate-900">
                        Live Booking Feed
                      </h2>
                    </div>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    {MOCK_RESERVATIONS.map((res) => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-champagne-dark/30 hover:bg-slate-50/20 transition-all flex justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900">{res.guestName}</p>
                            {res.tier !== "None" && (
                              <span className="bg-amber-50 text-amber-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded capitalize font-mono">
                                {res.tier}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {res.hotelName}
                          </p>
                          <p className="text-[9px] text-slate-500 font-medium">
                            {res.roomType} · In: {res.checkIn}
                          </p>
                        </div>

                        <div className="text-right flex flex-col justify-between shrink-0 font-mono">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block ${
                              res.status === "Confirmed"
                                ? "bg-emerald-50 text-emerald-700"
                                : res.status === "Pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {res.status}
                          </span>
                          <p className="font-black text-slate-900 mt-2 font-mono">
                            {formatCurrency(res.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick stats distribution */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-xs">
                  <h3 className="font-display text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                    Occupancy Breakdown
                  </h3>
                  <div className="space-y-3">
                    <ProgressBarLabel label="Tirupati (Sri Venkateswara)" value={88} colorClass="bg-champagne" />
                    <ProgressBarLabel label="Hyderabad (Sri Vasavi)" value={85} colorClass="bg-champagne" />
                    <ProgressBarLabel label="Vijayawada (Sri Vasavi Kanyaka)" value={79} colorClass="bg-champagne" />
                    <ProgressBarLabel label="Bengaluru (Vasavi Royal)" value={72} colorClass="bg-champagne" />
                    <ProgressBarLabel label="Others (Average)" value={68} colorClass="bg-slate-400" />
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

        {/* ==================== TAB 2: REWARDS & CAMPAIGNS HUB ==================== */}
        {activeMasterTab === "rewards" && (
          <>
            {/* Rewards KPIs Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Rewards Issued"
                value={`${totalCouponsIssued} Coupons`}
                subtext="System milestones + manuals"
                icon={Gift}
                colorClass="text-purple-600 bg-purple-50"
              />
              <StatCard
                title="Active Campaigns"
                value={`${activeCampaignsCount} Active`}
                subtext="Configured milestone streams"
                icon={Sparkles}
                colorClass="text-amber-600 bg-amber-50"
              />
              <StatCard
                title="Redemption Ratio"
                value="38.6%"
                subtext="Industry premium standard is 20%"
                icon={Percent}
                colorClass="text-emerald-600 bg-emerald-50"
              />
              <StatCard
                title="Credits Claimed"
                value={formatCurrency(totalCreditsClaimed)}
                subtext="Subsidized stay compensations"
                icon={Coins}
                colorClass="text-blue-600 bg-blue-50"
              />
            </div>

            {/* Success alert overlays */}
            {isCampaignSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                New loyalty campaign successfully registered. Automated milestone rewards wallet dispatcher armed.
              </div>
            )}
            {isGrantSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Custom coupon manually credited to Srinivas Rao [DH-2024-8842]. Dashboard celebration flags armed.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Form: Create Campaign & Manual Grantor */}
              <div className="lg:col-span-1 space-y-8">
                
                {/* Campaign Creator Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <PlusCircle className="h-5 w-5 text-champagne" />
                    <h3 className="font-display font-bold text-slate-900 text-base">
                      Create Coupon Campaign
                    </h3>
                  </div>

                  <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <Label className="font-semibold text-slate-600">Campaign Name</Label>
                      <Input
                        placeholder="e.g. Sankranti Devotee Gift"
                        value={newCampaignName}
                        onChange={(e) => setNewCampaignName(e.target.value)}
                        className="h-10 border-slate-200 bg-slate-50/50 text-slate-800"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="font-semibold text-slate-600">Coupon Type</Label>
                        <Select
                          value={newCampaignType}
                          onValueChange={(v) => setNewCampaignType(v as CouponType)}
                        >
                          <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 text-slate-800">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed_compensation">Monetary Credit</SelectItem>
                            <SelectItem value="percentage_discount">Percent Discount</SelectItem>
                            <SelectItem value="free_booking">Fully Free Booking</SelectItem>
                            <SelectItem value="premium_benefit">Premium Benefit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="font-semibold text-slate-600">Reward Value</Label>
                        <Input
                          type="number"
                          value={newCampaignValue}
                          onChange={(e) => setNewCampaignValue(Number(e.target.value))}
                          className="h-10 border-slate-200 bg-slate-50/50 text-slate-800"
                          disabled={newCampaignType === "free_booking"}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="font-semibold text-slate-600">Min. Donation (₹)</Label>
                        <Input
                          type="number"
                          value={newCampaignMinDonation}
                          onChange={(e) => setNewCampaignMinDonation(Number(e.target.value))}
                          className="h-10 border-slate-200 bg-slate-50/50 text-slate-800 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="font-semibold text-slate-600">Expiry (Days)</Label>
                        <Input
                          type="number"
                          value={newCampaignDays}
                          onChange={(e) => setNewCampaignDays(Number(e.target.value))}
                          className="h-10 border-slate-200 bg-slate-50/50 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-semibold text-slate-600">Description</Label>
                      <Input
                        placeholder="Voucher details shown in donor wallet"
                        value={newCampaignDesc}
                        onChange={(e) => setNewCampaignDesc(e.target.value)}
                        className="h-10 border-slate-200 bg-slate-50/50 text-slate-800"
                      />
                    </div>

                    <Button type="submit" className="w-full h-11 bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                      Deploy Campaign Engine
                    </Button>
                  </form>
                </div>

                {/* Manual Grantor Tool */}
                {donor && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <UserPlus className="h-5 w-5 text-champagne" />
                      <h3 className="font-display font-bold text-slate-900 text-base">
                        Manual Reward Issuer
                      </h3>
                    </div>

                    <form onSubmit={handleManualGrant} className="space-y-4 text-xs">
                      <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                        Directly inject customized coupon rewards to <strong>Srinivas Rao [DH-2024-8842]</strong>.
                      </p>

                      <div className="space-y-1">
                        <Label className="font-semibold text-slate-600">Reward Name</Label>
                        <Input
                          value={grantName}
                          onChange={(e) => setGrantName(e.target.value)}
                          className="h-10 border-slate-200 bg-slate-50/50 text-slate-800"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="font-semibold text-slate-600">Type</Label>
                          <Select
                            value={grantType}
                            onValueChange={(v) => setGrantType(v as CouponType)}
                          >
                            <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 text-slate-800">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed_compensation">Monetary Credit</SelectItem>
                              <SelectItem value="percentage_discount">Percent Discount</SelectItem>
                              <SelectItem value="free_booking">Fully Free Stay</SelectItem>
                              <SelectItem value="special_access">Special Seva Access</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="font-semibold text-slate-600">Nominal Value</Label>
                          <Input
                            type="number"
                            value={grantValue}
                            onChange={(e) => setGrantValue(Number(e.target.value))}
                            className="h-10 border-slate-200 bg-slate-50/50 text-slate-800"
                            disabled={grantType === "free_booking"}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-11 bg-champagne text-white font-bold hover:bg-champagne/90 transition-colors shadow shadow-amber-500/10">
                        Credit Srinivas Rao
                      </Button>
                    </form>
                  </div>
                )}

              </div>

              {/* Right Column: Registry and Anti-Abuse Auditor Feed */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Active Campaigns Registry */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-champagne" />
                      <h2 className="font-display text-lg font-bold text-slate-900">
                        Active Campaigns Registry
                      </h2>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {campaigns.length} total deployed
                    </span>
                  </div>

                  <div className="overflow-x-auto pr-1">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Reward Type</th>
                          <th className="py-2.5 px-3">Min. Support</th>
                          <th className="py-2.5 px-3 text-center">Claims</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium">
                        {campaigns.map((camp) => (
                          <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-3">
                              <p className="font-bold text-slate-900 leading-tight">{camp.name}</p>
                              <span className="text-[10px] text-slate-400 font-normal truncate max-w-[200px] block mt-0.5">
                                {camp.description}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="bg-purple-50 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded capitalize">
                                {camp.type.replace("_", " ")} ({camp.type === "free_booking" ? "Stay" : camp.rewardValue})
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                              {formatCurrency(camp.minDonationRequired)}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-600">
                              {camp.redemptionsCount}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => toggleCampaign(camp.id)}
                                className="inline-flex focus:outline-hidden"
                              >
                                {camp.active ? (
                                  <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Active
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <X className="h-3 w-3" /> Paused
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => deleteCampaign(camp.id)}
                                className="text-rose-500 hover:text-rose-700 p-1.5 rounded-md hover:bg-rose-50 transition-all focus:outline-hidden"
                                title="Delete Campaign"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Anti-Abuse logs auditor */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
                      <h2 className="font-display text-lg font-bold text-slate-900">
                        Anti-Abuse Logs Auditor
                      </h2>
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-[9px] font-black font-mono px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200">
                      SECURE ARM DISPATCHED
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {MOCK_AUDIT_LOGS.map((log) => {
                      const badgeColors = {
                        block: "bg-rose-50 border-rose-200 text-rose-700",
                        warning: "bg-amber-50 border-amber-200 text-amber-700",
                        verified: "bg-emerald-50 border-emerald-200 text-emerald-700",
                      }[log.type];

                      return (
                        <div
                          key={log.id}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all text-xs space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase font-mono tracking-wider ${badgeColors}`}>
                              {log.type === "block" ? "Access Denied" : log.type === "warning" ? "Bypass Prevented" : "Audit Verified"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {log.timestamp.replace("T", " ")}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-semibold">
                            {log.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

function StatCard({
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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-xl shrink-0 ${colorClass} border border-slate-100/50`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        <p className="font-display text-2xl font-black text-slate-950 mt-1 tracking-tight leading-none">
          {value}
        </p>
        <p className="text-[10px] text-slate-500 mt-1.5 font-medium leading-none">
          {subtext}
        </p>
      </div>
    </div>
  );
}

function ProgressBarLabel({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-semibold text-slate-600">
        <span>{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return <ShieldCheck {...props} />;
}
