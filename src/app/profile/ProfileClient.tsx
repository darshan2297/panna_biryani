"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserSessionStore } from "@/store/useUserSessionStore";
import { useCartStore } from "@/store/useCartStore";
import { Order, OrderStatus } from "@/types";
import { formatINR, cn } from "@/lib/utils";
import { products } from "@/data/products";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  ShoppingBag,
  Clock,
  Bike,
  Store,
  ArrowRight,
  LogOut,
  RotateCcw,
  Sparkles,
  Calendar,
  CreditCard,
  Banknote,
  ExternalLink,
  Pencil,
  Check,
  X,
  Camera,
  Eye,
  Upload,
  Trash2,
  Dices,
} from "lucide-react";
import {
  ROYAL_TAGS,
  RoyalTag,
  getDeterministicRoyalTag,
  getRandomRoyalTag,
  getRoyalTagByTitle,
} from "@/lib/royalTags";

export function ProfileClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "delivered">("all");

  // Inline Name Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Profile Photo Modals State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isViewPhotoOpen, setIsViewPhotoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Royal Tag Curiosity Modal State
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const { user, orders, endSession, setOrders, updateUser, isLoggedIn } =
    useUserSessionStore();
  const { addItem, setCartDrawerOpen } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure user has a royal tag assigned if missing
  useEffect(() => {
    if (mounted && user && !user.tag) {
      const defaultTag = getDeterministicRoyalTag(user.phone || user.name).title;
      updateUser({ tag: defaultTag });
    }
  }, [mounted, user, updateUser]);

  // Fetch updated orders from API for this user's phone
  const userPhone = user?.phone;
  useEffect(() => {
    if (!mounted || !userPhone) return;

    async function syncOrders() {
      try {
        const res = await fetch(`/api/orders/user?phone=${encodeURIComponent(userPhone!)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          // Merge API orders with existing state (avoiding duplicates)
          const merged = new Map<string, Order>();
          data.orders.forEach((o: Order) => merged.set(o.id, o));
          orders.forEach((o: Order) => {
            if (!merged.has(o.id)) merged.set(o.id, o);
          });
          const sorted = Array.from(merged.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sorted);
        }
      } catch (err) {
        console.error("Failed to sync orders:", err);
      }
    }

    syncOrders();
  }, [mounted, userPhone, orders, setOrders]);

  if (!mounted) return null;


  const handleLogout = () => {
    endSession();
    toast.success("Logged out successfully.");
    router.push("/");
  };

  // 1-Click Reorder handler
  const handleReorder = (order: Order) => {
    let addedCount = 0;
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId || p.slug === item.productSlug);
      if (prod) {
        addItem(prod, item.size, item.extras, item.quantity);
        addedCount += item.quantity;
      }
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to your cart! 🛍️`);
      setCartDrawerOpen(true);
    } else {
      toast.info("Could not reorder all items. Please choose from our fresh menu.");
      router.push("/menu");
    }
  };

  // Inline Name Edit Handlers
  const handleStartEditName = () => {
    if (!user) return;
    setEditName(user.name);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Please enter a valid name.");
      return;
    }
    updateUser({ name: trimmed });
    setIsEditingName(false);
    toast.success(`Name updated to "${trimmed}"! ✨`);
  };

  const handleCancelName = () => {
    setIsEditingName(false);
  };

  // Royal Tag Curiosity & Randomizer Handlers
  const currentRoyalTag = getRoyalTagByTitle(
    user?.tag || (user ? getDeterministicRoyalTag(user.phone || user.name).title : undefined)
  );

  const handleRerollTag = () => {
    const nextTag = getRandomRoyalTag(currentRoyalTag.title);
    updateUser({ tag: nextTag.title });
    toast.success(`✨ New Royal Title Unlocked: "${nextTag.title}"! ${nextTag.icon}`);
  };

  const handleSelectTag = (selectedTag: RoyalTag) => {
    updateUser({ tag: selectedTag.title });
    setIsTagModalOpen(false);
    toast.success(`You are now recognized as the "${selectedTag.title}"! ${selectedTag.icon}`);
  };

  // Image Compression & Photo Upload Handlers
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(e.target?.result as string);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    try {
      toast.loading("Updating profile photo...", { id: "photo-upload" });
      const compressedDataUrl = await compressImage(file);
      updateUser({ avatarUrl: compressedDataUrl });
      toast.success("Profile photo updated successfully! 📸", { id: "photo-upload" });
      setIsPhotoModalOpen(false);
      setIsViewPhotoOpen(false);
    } catch {
      toast.error("Could not process photo. Please try a different image.", {
        id: "photo-upload",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    updateUser({ avatarUrl: undefined });
    setIsPhotoModalOpen(false);
    setIsViewPhotoOpen(false);
    toast.success("Profile photo removed. Showing royal initial.");
  };

  const royalPresets = [
    {
      id: "nawab-crown",
      label: "Nawab Crown",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%2300241b'/><text x='50' y='65' font-size='48' text-anchor='middle'>👑</text></svg>",
    },
    {
      id: "dum-handi",
      label: "Dum Handi",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%2300241b'/><text x='50' y='65' font-size='48' text-anchor='middle'>🍲</text></svg>",
    },
    {
      id: "shahi-chef",
      label: "Royal Chef",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%2300241b'/><text x='50' y='65' font-size='48' text-anchor='middle'>👨‍🍳</text></svg>",
    },
    {
      id: "veg-feast",
      label: "Shahi Feast",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%2300241b'/><text x='50' y='65' font-size='48' text-anchor='middle'>✨</text></svg>",
    },
  ];

  // Helper formatting
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Order Confirmed",
          color: "bg-emerald-100 text-emerald-800 border-emerald-300",
          dot: "bg-emerald-500 animate-ping",
        };
      case "PREPARING":
        return {
          label: "Cooking in Handi",
          color: "bg-amber-100 text-amber-800 border-amber-300",
          dot: "bg-amber-500 animate-pulse",
        };
      case "READY":
        return {
          label: "Ready for Pickup",
          color: "bg-teal-100 text-teal-800 border-teal-300",
          dot: "bg-teal-500",
        };
      case "OUT_FOR_DELIVERY":
        return {
          label: "Out for Delivery",
          color: "bg-blue-100 text-blue-800 border-blue-300",
          dot: "bg-blue-500 animate-ping",
        };
      case "DELIVERED":
      case "COMPLETED":
        return {
          label: "Delivered Warm",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-600",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          color: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };
      default:
        return {
          label: "Received",
          color: "bg-zinc-100 text-zinc-700 border-zinc-200",
          dot: "bg-zinc-400",
        };
    }
  };

  // Filter orders
  const activeOrders = orders.filter(
    (o) =>
      o.orderStatus === "CONFIRMED" ||
      o.orderStatus === "PREPARING" ||
      o.orderStatus === "READY" ||
      o.orderStatus === "OUT_FOR_DELIVERY"
  );
  const deliveredOrders = orders.filter(
    (o) => o.orderStatus === "DELIVERED" || o.orderStatus === "COMPLETED"
  );

  const displayedOrders =
    filter === "active"
      ? activeOrders
      : filter === "delivered"
      ? deliveredOrders
      : orders;

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // If user has NO active session, redirect to /login
  if (!isLoggedIn() || !user) {
    return (
      <div className="bg-[#FAF7F2] min-h-[85vh] py-14 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E3DACB] p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#00241b] text-[#E8B94A] flex items-center justify-center mx-auto shadow-md">
            <User className="w-8 h-8 stroke-[2]" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#007A55]">
              Royal Account
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#00241b]">
              Login Required
            </h1>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              Please login with your WhatsApp mobile number to access your royal feast profile, past orders, and invoices.
            </p>
          </div>

          <Link
            href="/login?redirect=/profile"
            className="w-full h-12 rounded-xl bg-[#003F32] hover:bg-[#002e24] text-white font-bold text-sm tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Login with WhatsApp Code</span>
            <ArrowRight className="w-4 h-4 text-[#E8B94A]" />
          </Link>

          <div className="pt-2 border-t border-[#E3DACB]/60 text-xs text-zinc-500">
            <p>
              New here? Place an order from our{" "}
              <Link href="/menu" className="text-[#007A55] font-bold hover:underline">
                Menu
              </Link>{" "}
              to automatically start your session!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active Session View: Profile + Order History
  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-20 sm:pt-24 lg:pt-28 pb-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-3xl border border-[#E3DACB] p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[#E3DACB]/70">
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-4">
              {/* Profile Image with Click to View / Change */}
              <button
                type="button"
                id="profile-avatar-btn"
                onClick={() => setIsPhotoModalOpen(true)}
                title="Click to view or change photo"
                className="relative group w-16 h-16 rounded-2xl bg-[#00241b] border-2 border-[#E8B94A] text-[#E8B94A] flex items-center justify-center text-2xl font-black shadow-sm shrink-0 overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
                {/* Camera hover overlay badge */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-5 h-5 text-[#E8B94A]" />
                </div>
                <span className="absolute bottom-0 right-0 bg-[#00241b] text-[#E8B94A] p-0.5 rounded-tl-md border-t border-l border-[#E8B94A]/60">
                  <Camera className="w-3 h-3" />
                </span>
              </button>

              <div className="space-y-1 min-w-0">
                {/* Name Row with Inline Edit */}
                <div className="flex items-center gap-2 flex-wrap">
                  {isEditingName ? (
                    <form
                      onSubmit={handleSaveName}
                      className="flex items-center gap-1.5 flex-wrap"
                    >
                      <input
                        ref={nameInputRef}
                        id="inline-name-input"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") handleCancelName();
                        }}
                        className="bg-white border-2 border-[#007A55] rounded-xl px-2.5 py-1 text-base sm:text-lg font-bold text-[#00241b] focus:outline-none shadow-2xs min-w-[150px] sm:min-w-[190px]"
                        placeholder="Enter name"
                        autoFocus
                      />
                      <button
                        id="save-name-btn"
                        type="submit"
                        title="Save Name"
                        className="p-1.5 rounded-lg bg-[#007A55] hover:bg-[#006043] text-white transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        id="cancel-name-btn"
                        type="button"
                        onClick={handleCancelName}
                        title="Cancel"
                        className="p-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#00241b] truncate">
                        {user.name}
                      </h1>
                      <button
                        type="button"
                        id="edit-name-pencil-btn"
                        onClick={handleStartEditName}
                        title="Edit your name"
                        className="p-1 rounded-lg text-zinc-400 hover:text-[#007A55] hover:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        id="royal-tag-badge-btn"
                        onClick={() => setIsTagModalOpen(true)}
                        title="Click to discover your Royal Title backstory or roll a new one"
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 group",
                          currentRoyalTag.badgeClass
                        )}
                      >
                        <span className="text-xs group-hover:rotate-12 transition-transform">
                          {currentRoyalTag.icon}
                        </span>
                        <span>{currentRoyalTag.title}</span>
                        <Sparkles className="w-3 h-3 text-[#E8B94A] group-hover:rotate-45 transition-transform" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                  <span className="inline-flex items-center gap-1 font-mono font-medium text-zinc-800">
                    <Phone className="w-3.5 h-3.5 text-[#007A55]" />
                    +91 {user.phone}
                  </span>
                  {user.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Link
                href="/menu"
                className="px-4 py-2 rounded-xl bg-[#003F32] hover:bg-[#002e24] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#E8B94A]" />
                <span>Order Biryani</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Log Out of this session"
              >
                <LogOut className="w-3.5 h-3.5 text-zinc-500" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 text-center">
            <div className="bg-[#FCFAF7] border border-[#E3DACB]/60 rounded-xl p-3">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold block">
                Total Orders
              </span>
              <span className="text-xl sm:text-2xl font-serif font-black text-[#00241b]">
                {orders.length}
              </span>
            </div>

            <div className="bg-[#FCFAF7] border border-[#E3DACB]/60 rounded-xl p-3">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold block">
                Total Feast Value
              </span>
              <span className="text-xl sm:text-2xl font-serif font-black text-[#007A55]">
                {formatINR(totalSpent)}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-[#FCFAF7] border border-[#E3DACB]/60 rounded-xl p-3">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold block">
                Active Deliveries
              </span>
              <span className="text-xl sm:text-2xl font-serif font-black text-[#B3261E]">
                {activeOrders.length}
              </span>
            </div>
          </div>
        </div>

        {/* Orders Section Header & Filter Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#00241b]">
                Your Order History
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                Displaying all orders registered for mobile number{" "}
                <span className="font-mono font-bold text-zinc-900">+91 {user.phone}</span>
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex p-1 bg-[#ECE4D4] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                  filter === "all"
                    ? "bg-white text-[#00241b] shadow-xs font-bold"
                    : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                All ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("active")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                  filter === "active"
                    ? "bg-white text-[#00241b] shadow-xs font-bold"
                    : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                Active ({activeOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("delivered")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                  filter === "delivered"
                    ? "bg-white text-[#00241b] shadow-xs font-bold"
                    : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                Delivered ({deliveredOrders.length})
              </button>
            </div>
          </div>

          {/* Orders List */}
          {displayedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E3DACB] p-10 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E3DACB] flex items-center justify-center mx-auto text-zinc-400">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#00241b]">
                {filter === "all"
                  ? "No orders found for this number"
                  : `No ${filter} orders right now`}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Ready to indulge in Surat&apos;s finest slow-cooked vegetarian dum biryani?
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-[#003F32] hover:bg-[#002e24] text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E8B94A]" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedOrders.map((order) => {
                const badge = getStatusBadge(order.orderStatus);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#E3DACB] hover:border-[#007A55]/50 hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Order Card Header */}
                    <div className="p-4 sm:p-5 bg-[#FCFAF7] border-b border-[#E3DACB]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-black text-[#00241b]">
                            #{order.orderNumber}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                              badge.color
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full", badge.dot)} />
                            <span>{badge.label}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{formatDate(order.createdAt)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                            Total Bill
                          </span>
                          <span className="font-serif text-base sm:text-lg font-black text-[#007A55]">
                            {formatINR(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Card Body */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Items Preview */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={`${item.id}-${idx}`}
                            className="flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="w-4 h-4 rounded-[3px] border border-emerald-600 flex items-center justify-center shrink-0 mt-0.5 p-[1px] bg-white">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                              </span>
                              <div>
                                <p className="font-bold text-zinc-900 text-[13px] leading-tight">
                                  {item.quantity} × {item.productName}
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  Portion: <span className="font-semibold">{item.size.label}</span>
                                  {item.extras && item.extras.length > 0 && (
                                    <span>
                                      {" "}
                                      • Extras:{" "}
                                      {item.extras
                                        .map((e) => `${e.extra.name} (x${e.quantity})`)
                                        .join(", ")}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-zinc-800 text-xs shrink-0">
                              {formatINR(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Fulfillment & Payment Meta info */}
                      <div className="pt-3 border-t border-[#E3DACB]/50 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
                        <div className="flex items-center gap-2">
                          {order.orderType === "delivery" ? (
                            <span className="inline-flex items-center gap-1 font-medium text-zinc-700">
                              <Bike className="w-3.5 h-3.5 text-[#007A55]" />
                              <span>
                                Delivered to {order.deliveryAddress?.area || "Surat"}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                              <Store className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Kitchen Counter Pickup</span>
                            </span>
                          )}

                          <span>•</span>

                          <span className="inline-flex items-center gap-1">
                            {order.paymentMethod === "online" ? (
                              <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                            ) : (
                              <Banknote className="w-3.5 h-3.5 text-zinc-500" />
                            )}
                            <span className="capitalize">
                              {order.paymentMethod === "online"
                                ? "Paid Online"
                                : "Cash on Delivery"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Card Action Buttons */}
                    <div className="px-4 py-3 bg-[#FAF7F2] border-t border-[#E3DACB]/60 flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        {/* Live Tracking link */}
                        <Link
                          href={`/track-order/${order.id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-[#00241b] hover:bg-[#00382b] text-[#E8B94A] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Track Live Status</span>
                        </Link>

                        {/* Order Details / Receipt */}
                        <Link
                          href={`/orders/${order.id}`}
                          className="px-3 py-1.5 rounded-lg border border-[#E3DACB] bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Full Invoice & Details</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </Link>
                      </div>

                      {/* 1-Click Reorder */}
                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#007A55] hover:bg-[#006043] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder Feast</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* MODAL 1: Ask "View Photo" or "Change Photo" */}
      {isPhotoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl border border-[#E3DACB] p-6 shadow-2xl space-y-5 text-center relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar Preview */}
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-3xl bg-[#00241b] border-3 border-[#E8B94A] text-[#E8B94A] flex items-center justify-center text-3xl font-black shadow-md mx-auto overflow-hidden">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3 className="font-serif text-lg font-bold text-[#00241b]">
                Profile Photo
              </h3>
              <p className="text-xs text-zinc-500">
                Choose an action for your royal avatar
              </p>
            </div>

            {/* Actions: View Photo or Change Photo */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="modal-view-photo-btn"
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setIsViewPhotoOpen(true);
                }}
                className="p-3.5 rounded-2xl border border-[#E3DACB] bg-[#FCFAF7] hover:bg-[#F3EDE2] text-[#00241b] font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-xs active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E3DACB] flex items-center justify-center text-[#007A55] shadow-2xs">
                  <Eye className="w-5 h-5" />
                </div>
                <span>View Photo</span>
              </button>

              <button
                type="button"
                id="modal-change-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl border border-[#007A55]/30 bg-[#003F32] hover:bg-[#002e24] text-white font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-md active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#E8B94A]">
                  <Upload className="w-5 h-5" />
                </div>
                <span>Change Photo</span>
              </button>
            </div>

            {/* Preset Royal Avatars */}
            <div className="space-y-2 pt-2 border-t border-[#E3DACB]/60 text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
                Or Select a Royal Avatar
              </span>
              <div className="grid grid-cols-4 gap-2">
                {royalPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateUser({ avatarUrl: preset.url });
                      setIsPhotoModalOpen(false);
                      toast.success(`Royal avatar "${preset.label}" selected! ✨`);
                    }}
                    className="p-1.5 rounded-xl border border-[#E3DACB] hover:border-[#007A55] bg-white hover:bg-emerald-50 transition-all flex flex-col items-center gap-1 cursor-pointer group"
                    title={preset.label}
                  >
                    <Image
                      src={preset.url}
                      alt={preset.label}
                      width={40}
                      height={40}
                      unoptimized
                      className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[9.5px] font-medium text-zinc-600 truncate max-w-full">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Remove photo option if user has set a custom photo */}
            {user.avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="w-full py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Custom Photo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Full View Photo Lightbox */}
      {isViewPhotoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsViewPhotoOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#00241b] rounded-3xl border-2 border-[#E8B94A] p-6 text-center space-y-6 text-white shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsViewPhotoOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8B94A]">
                Royal Profile
              </span>
              <h2 className="font-serif text-2xl font-bold">{user.name}</h2>
              <p className="text-xs text-zinc-300 font-mono">+91 {user.phone}</p>
            </div>

            {/* Large Photo Display */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl border-4 border-[#E8B94A] shadow-2xl mx-auto overflow-hidden bg-[#00382b] flex items-center justify-center">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={224}
                  height={224}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-7xl font-black text-[#E8B94A]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Viewer Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                id="view-modal-change-photo-btn"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#E8B94A] hover:bg-[#d4a83d] text-[#00241b] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Change Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsViewPhotoOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/30 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Royal Title Curiosity & Randomizer Modal */}
      {isTagModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsTagModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-[#E3DACB] p-6 shadow-2xl space-y-5 text-center relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsTagModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#007A55] flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E8B94A]" />
                Royal Gastronomy Honour
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#00241b]">
                Your Royal Title
              </h2>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Every patron of Panna Dum Biryani is bestowed a unique royal title honoring their culinary spirit.
              </p>
            </div>

            {/* Current Title Spotlight Card */}
            <div
              className={cn(
                "p-5 rounded-2xl border-2 transition-all space-y-3 bg-gradient-to-b shadow-xs relative overflow-hidden",
                currentRoyalTag.badgeClass,
                currentRoyalTag.bgGradient
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#E3DACB] text-2xl flex items-center justify-center mx-auto shadow-2xs">
                {currentRoyalTag.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Current Title Bestowed To {user.name}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#00241b]">
                  {currentRoyalTag.title}
                </h3>
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-700 italic leading-relaxed px-2">
                &ldquo;{currentRoyalTag.description}&rdquo;
              </p>
            </div>

            {/* Actions: Reroll / Discover Another */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                id="reroll-royal-tag-btn"
                onClick={handleRerollTag}
                className="flex-1 py-3 px-4 rounded-xl bg-[#003F32] hover:bg-[#002e24] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Dices className="w-4 h-4 text-[#E8B94A]" />
                <span>Roll Random Title</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                className="py-3 px-5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Explore All Royal Titles Collection */}
            <div className="pt-3 border-t border-[#E3DACB]/60 text-left space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
                Or Claim Your Preferred Title ({ROYAL_TAGS.length})
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {ROYAL_TAGS.map((tag) => {
                  const isSelected = tag.title.toLowerCase() === currentRoyalTag.title.toLowerCase();
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      className={cn(
                        "p-2 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer text-xs",
                        isSelected
                          ? "border-[#007A55] bg-emerald-50/80 font-bold text-[#00241b] shadow-2xs"
                          : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-medium"
                      )}
                    >
                      <span className="text-base shrink-0">{tag.icon}</span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[11px] leading-tight">
                          {tag.title}
                        </div>
                        <div className="text-[9.5px] text-zinc-500 truncate leading-snug">
                          {tag.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
