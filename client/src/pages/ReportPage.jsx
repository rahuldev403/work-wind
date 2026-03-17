import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Crosshair,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  Send,
  TriangleAlert,
} from "lucide-react";
import { api } from "../lib/api";

const initialForm = {
  title: "",
  description: "",
  media: "",
  latitude: "",
  longitude: "",
};

function ReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      setPermissionDenied(true);
      return;
    }

    setIsLocating(true);
    setError("");
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(coords.latitude),
          longitude: String(coords.longitude),
        }));
        setIsLocating(false);
        setPermissionDenied(false);
      },
      (positionError) => {
        setIsLocating(false);

        if (positionError.code === 1) {
          setError(
            "⚠️ Location permission denied. Please enable location access in your browser settings to submit an incident.",
          );
          setPermissionDenied(true);
        } else if (positionError.code === 2) {
          setError(
            "Location data is unavailable. Please try again in a moment.",
          );
          setPermissionDenied(true);
        } else if (positionError.code === 3) {
          // TIMEOUT
          setError("Location request timed out. Please try again.");
          setPermissionDenied(true);
        } else {
          setError("Unable to fetch your location. Please try again.");
          setPermissionDenied(true);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    captureCurrentLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.latitude || !form.longitude) {
      if (permissionDenied) {
        setError(
          "⚠️ Location permission is required. Please enable location access in your browser settings and refresh the page.",
        );
      } else {
        setError(
          "Location is required. Please click 'Use Current Location' to get your position.",
        );
      }
      return;
    }

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Latitude and longitude must be valid numbers.");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Coordinates are out of valid range.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/incidents", {
        title: form.title.trim(),
        description: form.description.trim(),
        media: form.media.trim() || null,
        location: {
          coordinates: [lng, lat],
        },
      });

      setIsSubmitting(false);
      setSuccess("Incident reported successfully.");
      setForm(initialForm);
      captureCurrentLocation();
    } catch (submitError) {
      setIsSubmitting(false);
      setError(
        submitError?.response?.data?.message ||
          "Failed to submit incident. Please try again.",
      );
    }
  };

  return (
    <main className="dark min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative isolate mx-auto w-full max-w-3xl px-5 pb-10 pt-6 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/feed")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 py-2 text-sm font-medium text-white/75 transition hover:border-white/25 hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Feed
          </button>

          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Report Incident
          </p>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6"
        >
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Submit a Safety Report
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Share incident details so nearby users can be alerted quickly.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Example: Suspicious activity near bus stop"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                Description
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe what happened, what you observed, and any urgent details."
                className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                Media URL (optional)
              </label>
              <div className="relative">
                <ImageIcon
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  value={form.media}
                  onChange={(e) => updateField("media", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/6 pl-9 pr-3 text-sm text-white outline-none transition focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  Location
                </label>
                {isLocating ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    <LoaderCircle size={11} className="animate-spin" />
                    Fetching
                  </span>
                ) : permissionDenied ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-400">
                    <TriangleAlert size={11} />
                    Permission Denied
                  </span>
                ) : form.latitude && form.longitude ? (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-400">
                    ✓ Captured
                  </span>
                ) : null}
              </div>
              <div
                className={`relative rounded-xl border p-3 ${
                  isLocating
                    ? "border-white/20 bg-white/[0.04]"
                    : permissionDenied
                      ? "border-red-500/30 bg-red-500/10"
                      : form.latitude && form.longitude
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-white/10 bg-white/6"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin
                    size={14}
                    className={`${
                      permissionDenied ? "text-red-400" : "text-white/60"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isLocating
                        ? "text-white/50"
                        : permissionDenied
                          ? "text-red-300"
                          : form.latitude && form.longitude
                            ? "text-emerald-300"
                            : "text-white/70"
                    }`}
                  >
                    {isLocating
                      ? "Fetching location..."
                      : permissionDenied
                        ? "Permission denied"
                        : form.latitude && form.longitude
                          ? `${form.latitude}, ${form.longitude}`
                          : "Waiting for location..."}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={captureCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 py-2 text-sm font-medium text-white/75 transition hover:border-white/25 hover:text-white disabled:opacity-60"
              >
                <Crosshair size={14} />
                {isLocating ? "Fetching location..." : "Use Current Location"}
              </button>

              {permissionDenied ? (
                <span className="text-xs font-medium text-red-300">
                  ❌ Location permission required to proceed
                </span>
              ) : form.latitude && form.longitude ? (
                <span className="text-xs text-emerald-300">
                  ✓ Location captured automatically
                </span>
              ) : (
                <span className="text-xs text-white/55">
                  Waiting for location...
                </span>
              )}
            </div>

            {error ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                <TriangleAlert size={14} />
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {success}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigate("/feed")}
                className="rounded-xl border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/25"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !form.latitude || !form.longitude}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/35 disabled:opacity-60"
              >
                <Send size={14} />
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </motion.section>
      </div>
    </main>
  );
}

export default ReportPage;
