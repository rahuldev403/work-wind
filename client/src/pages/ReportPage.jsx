import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Crosshair,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  Send,
  TriangleAlert,
  Upload,
  X,
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
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (file) => {
    try {
      setIsUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/incidents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.data?.mediaUrl) {
        updateField("media", response.data.data.mediaUrl);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload file");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
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
          className="grid gap-8 lg:grid-cols-2"
        >
          {/* Form Section */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Submit a Safety Report
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Share incident details so nearby users can be alerted quickly.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Title */}
              <div className="group relative">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Example: Suspicious activity near bus stop"
                  className="w-full border-0 border-b border-white/18 bg-transparent py-3 px-0 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/75"
                />
              </div>

              {/* Description */}
              <div className="group relative">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe what happened, what you observed, and any urgent details."
                  className="w-full border-0 border-b border-white/18 bg-transparent py-3 px-0 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/75 resize-none"
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  Media (optional)
                </label>
                {form.media ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-lg border border-white/18 bg-white/[0.02] p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <ImageIcon size={16} className="text-emerald-400" />
                      <span className="text-sm text-emerald-300 truncate">
                        {form.media.split("/").pop()?.substring(0, 30) ||
                          "Image uploaded"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField("media", "")}
                      className="text-white/40 hover:text-white/75 transition"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      hidden
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      disabled={isUploading}
                    />
                    <div className="cursor-pointer rounded-lg border border-dashed border-white/25 bg-white/[0.02] py-6 text-center transition hover:border-primary/50 hover:bg-primary/5 group">
                      <div className="flex flex-col items-center gap-2">
                        <Upload
                          size={20}
                          className="text-white/40 group-hover:text-primary/60 transition"
                        />
                        <div>
                          <p className="text-sm font-medium text-white/60 group-hover:text-primary/70 transition">
                            {isUploading
                              ? "Uploading..."
                              : "Click to upload media"}
                          </p>
                          <p className="text-xs text-white/30 mt-0.5">
                            Image or video (max 100MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* Location */}
              <div className="group relative">
                <div className="mb-1 flex items-center justify-between">
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
                <div className="flex items-center gap-2 border-0 border-b border-white/18 py-3">
                  <MapPin
                    size={14}
                    className={`transition ${
                      permissionDenied
                        ? "text-red-400"
                        : isLocating
                          ? "text-primary/70"
                          : form.latitude && form.longitude
                            ? "text-emerald-400"
                            : "text-white/30"
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
                            : "text-white/30"
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

              <button
                type="button"
                onClick={captureCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/35 disabled:opacity-60"
              >
                <Crosshair size={16} />
                {isLocating ? "Fetching location..." : "Use Current Location"}
              </button>

              {/* Error */}
              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2 pt-2"
                >
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              ) : null}

              {/* Success */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 pt-2"
                >
                  <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-emerald-400" />
                  <p className="text-xs text-emerald-400">{success}</p>
                </motion.div>
              ) : null}

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/feed")}
                  className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/75 transition hover:border-white/35 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !form.latitude || !form.longitude}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/35 disabled:opacity-60"
                >
                  <Send size={16} />
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center">
            {/* 3D layered frame effect */}
            <div className="relative p-[3px] rounded-[2rem] bg-gradient-to-br from-white/20 via-white/5 to-white/10 shadow-2xl shadow-black/50 w-full max-w-md">
              <div className="relative rounded-[1.8rem] bg-gradient-to-br from-white/8 to-white/2 p-[2px] shadow-inner shadow-white/5">
                <div className="overflow-hidden rounded-[1.6rem] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <img
                    src="/illustration.png"
                    alt="Report incident illustration"
                    className="w-full rounded-[1.6rem] object-cover aspect-square"
                  />
                </div>
              </div>
              {/* Bottom reflection shadow */}
              <div className="absolute -bottom-4 left-6 right-6 h-8 rounded-full bg-black/30 blur-xl" />
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default ReportPage;
