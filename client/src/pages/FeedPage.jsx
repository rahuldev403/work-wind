import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import {
  AlertTriangle,
  Bell,
  Car,
  ChevronDown,
  Clock3,
  Eye,
  HelpCircle,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
  Wifi,
  WifiOff,
  Wrench,
} from "lucide-react";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import { api } from "../lib/api";
import { useAuthStore } from "../store/AuthStore";
import { useIncidentStore } from "../store/IncidentStore";

const SOCKET_URL = (() => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  return url.replace(/\/api\/?$/i, "");
})();

const DEFAULT_CENTER = [20.5937, 78.9629];

const SEVERITY_META = {
  low: {
    label: "Low",
    dotClass: "bg-emerald-400",
    pillClass: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
    markerColor: "#10b981",
  },
  medium: {
    label: "Medium",
    dotClass: "bg-yellow-400",
    pillClass: "border-yellow-500/30 bg-yellow-500/15 text-yellow-300",
    markerColor: "#facc15",
  },
  high: {
    label: "High",
    dotClass: "bg-red-400",
    pillClass: "border-red-500/30 bg-red-500/15 text-red-300",
    markerColor: "#ef4444",
  },
};

const TYPE_META = {
  theft: { label: "Theft", Icon: ShieldAlert },
  accident: { label: "Accident", Icon: Car },
  harassment: { label: "Harassment", Icon: AlertTriangle },
  "damaged-property": { label: "Damaged Property", Icon: Wrench },
  "suspicious-activity": { label: "Suspicious Activity", Icon: Eye },
  other: { label: "Other", Icon: HelpCircle },
};

const SEVERITY_OPTIONS = [
  { value: "", label: "All severities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "theft", label: "Theft" },
  { value: "accident", label: "Accident" },
  { value: "harassment", label: "Harassment" },
  { value: "damaged-property", label: "Damaged Property" },
  { value: "suspicious-activity", label: "Suspicious Activity" },
  { value: "other", label: "Other" },
];

const REPORT_TYPE_OPTIONS = TYPE_OPTIONS.filter((opt) => opt.value);

const formatRelativeTime = (dateStr) => {
  const delta = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const formatCoords = (incident) => {
  const coords = incident?.location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2)
    return "Location unavailable";
  const [lng, lat] = coords;
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

const buildMarker = (severity) => {
  const color = SEVERITY_META[severity]?.markerColor || "#60a5fa";
  return L.divIcon({
    className: "street-guard-marker",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};box-shadow:0 0 0 3px rgba(15,23,42,0.75),0 0 0 8px rgba(255,255,255,0.08);"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const buildUserMarker = () =>
  L.divIcon({
    className: "street-guard-user-marker",
    html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#60a5fa;box-shadow:0 0 0 3px rgba(15,23,42,0.85),0 0 0 8px rgba(96,165,250,0.22);"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

function FilterDropdown({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const holderRef = useRef(null);
  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    const onPointer = (e) => {
      if (holderRef.current && !holderRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  return (
    <div ref={holderRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex h-9 min-w-36 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/6 px-3 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white"
      >
        <span>{selected.label}</span>
        <ChevronDown
          size={12}
          className={`transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 top-11 z-[1200] min-w-full rounded-xl border border-white/10 bg-[#111423] p-1 shadow-2xl"
          >
            {options.map((opt) => (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                  value === opt.value
                    ? "bg-white/10 text-white"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(center) || center.length !== 2) return;
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

function SeverityBadge({ severity }) {
  const meta = SEVERITY_META[severity] ?? SEVERITY_META.low;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${meta.pillClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
}

function IncidentCard({ incident, currentUserId }) {
  const upvoteIncident = useIncidentStore((s) => s.upvoteIncident);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const typeMeta = TYPE_META[incident.type] ?? TYPE_META.other;
  const TypeIcon = typeMeta.Icon;

  const hasUpvoted = incident.upvotedBy?.some(
    (id) => id?.toString() === currentUserId?.toString(),
  );

  const onUpvote = async () => {
    if (isUpvoting) return;
    setIsUpvoting(true);
    await upvoteIncident(incident._id);
    setIsUpvoting(false);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_14px_30px_rgba(3,6,16,0.35)] backdrop-blur-xl"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          <TypeIcon size={12} />
          {typeMeta.label}
        </div>
        <SeverityBadge severity={incident.severity} />
      </div>

      <p className="text-base font-bold leading-6 text-white">
        {incident.summary || incident.title}
      </p>

      {incident.media ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
          <img
            src={incident.media}
            alt="Incident evidence"
            className="h-44 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-white/50">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={12} /> {formatCoords(incident)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={12} /> {formatRelativeTime(incident.createdAt)}
        </span>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onUpvote}
          disabled={isUpvoting}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            hasUpvoted
              ? "border-blue-400/40 bg-blue-500/20 text-blue-200"
              : "border-white/15 bg-white/5 text-white/65 hover:border-white/25 hover:text-white"
          }`}
        >
          <ThumbsUp
            size={13}
            fill={hasUpvoted ? "currentColor" : "none"}
            className={isUpvoting ? "animate-pulse" : ""}
          />
          {incident.upvotes ?? 0}
        </button>
      </div>
    </motion.article>
  );
}

function ToastStack({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.96 }}
            className="rounded-xl border border-blue-400/25 bg-slate-900/90 p-3 text-sm text-white shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Bell className="mt-0.5 text-blue-300" size={15} />
                <div>
                  <p className="font-semibold">New incident nearby</p>
                  <p className="mt-0.5 text-xs text-white/70">
                    {toast.summary}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className="text-xs text-white/60 hover:text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function FeedPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const {
    incidents,
    pagination,
    isLoading,
    error,
    filters,
    fetchIncidents,
    setFilter,
    prependIncident,
    clearNewCount,
    reset,
  } = useIncidentStore();

  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const currentPage = useRef(1);

  useEffect(() => {
    currentPage.current = 1;
    fetchIncidents(1, false);
  }, [fetchIncidents, filters.severity, filters.type]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("incident-created", (incident) => {
      prependIncident(incident);
      const id = `${incident._id}-${Date.now()}`;
      setToasts((prev) =>
        [
          {
            id,
            summary:
              incident.summary || incident.title || "New incident reported",
          },
          ...prev,
        ].slice(0, 4),
      );
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    });

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          setUserLocation({ lat: coords.latitude, lng: coords.longitude });
          socket.emit("user-location-update", {
            lat: coords.latitude,
            lng: coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: 30000 },
      );
    }

    return () => {
      socket.disconnect();
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [prependIncident]);

  useEffect(() => () => reset(), [reset]);

  const handleLoadMore = useCallback(() => {
    if (!pagination || currentPage.current >= pagination.totalPages) return;
    currentPage.current += 1;
    fetchIncidents(currentPage.current, true);
  }, [fetchIncidents, pagination]);

  const handleRefresh = useCallback(() => {
    clearNewCount();
    currentPage.current = 1;
    fetchIncidents(1, false);
  }, [clearNewCount, fetchIncidents]);

  const firstMappableIncident = incidents.find(
    (item) =>
      Array.isArray(item?.location?.coordinates) &&
      item.location.coordinates.length === 2,
  );

  const mapCenter = firstMappableIncident
    ? [
        firstMappableIncident.location.coordinates[1],
        firstMappableIncident.location.coordinates[0],
      ]
    : DEFAULT_CENTER;

  const effectiveMapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : mapCenter;

  return (
    <main className="dark min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative isolate">
        <ToastStack
          toasts={toasts}
          onRemove={(id) =>
            setToasts((prev) => prev.filter((t) => t.id !== id))
          }
        />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                <img src="/logo.png" alt="StreetGuard AI" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                  StreetGuard AI
                </p>
                <p className="text-sm font-semibold text-white">
                  Real-Time Safety Feed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/report")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/35"
              >
                <Plus size={14} />
                Report Incident
              </button>

              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>

              <button
                onClick={logout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/65 hover:text-white"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-14 pt-7 sm:px-6">
          <div className="relative z-[1300] mb-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FilterDropdown
                value={filters.severity}
                options={SEVERITY_OPTIONS}
                onChange={(next) => setFilter("severity", next)}
              />
              <FilterDropdown
                value={filters.type}
                options={TYPE_OPTIONS}
                onChange={(next) => setFilter("type", next)}
              />
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-60"
              >
                <RefreshCw
                  size={12}
                  className={isLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  isConnected
                    ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
                    : "border-white/15 bg-white/8 text-white/45"
                }`}
              >
                {isConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>

          {error ? (
            <div className="mx-auto mb-5 max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl"
          >
            <div className="h-[52vh] min-h-[360px] w-full">
              <MapContainer
                className="street-guard-map"
                center={effectiveMapCenter}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <RecenterMap center={effectiveMapCenter} />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {incidents
                  .filter(
                    (incident) =>
                      Array.isArray(incident?.location?.coordinates) &&
                      incident.location.coordinates.length === 2,
                  )
                  .map((incident) => {
                    const [lng, lat] = incident.location.coordinates;
                    return (
                      <Marker
                        key={incident._id}
                        position={[lat, lng]}
                        icon={buildMarker(incident.severity)}
                      >
                        <Popup>
                          <div className="min-w-44">
                            <p className="font-semibold text-slate-900">
                              {incident.summary || incident.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Severity:{" "}
                              {SEVERITY_META[incident.severity]?.label || "Low"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatRelativeTime(incident.createdAt)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                {userLocation ? (
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={buildUserMarker()}
                  >
                    <Popup>
                      <div className="min-w-32">
                        <p className="font-semibold text-slate-900">
                          You are here
                        </p>
                        <p className="text-xs text-slate-500">
                          {userLocation.lat.toFixed(5)},{" "}
                          {userLocation.lng.toFixed(5)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ) : null}
              </MapContainer>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4"
          >
            {incidents.length === 0 && !isLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center backdrop-blur-xl">
                <p className="text-xl font-semibold text-white/80">
                  No incidents yet
                </p>
                <p className="mt-2 text-sm text-white/45">
                  New reports will appear here in real-time.
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {incidents.map((incident) => (
                  <IncidentCard
                    key={incident._id}
                    incident={incident}
                    currentUserId={user?._id}
                  />
                ))}
              </AnimatePresence>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/60">
                Loading incidents...
              </div>
            ) : null}

            {pagination && pagination.currentPage < pagination.totalPages ? (
              <div className="pt-1 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
                >
                  Load more
                </button>
              </div>
            ) : null}
          </motion.section>
        </main>
      </div>
    </main>
  );
}
