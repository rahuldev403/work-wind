import { ArrowRight, ArrowUp, Clock3, Github, Radar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";

const featureCards = [
  {
    imgSrc: "/alert.png",
    title: "Real-Time Alerts",
    description:
      "Get instant notifications about incidents happening near you.",
  },
  {
    imgSrc: "/ai.png",
    title: "AI-Powered Analysis",
    description:
      "Automatically classifies incidents and determines severity using AI.",
  },
  {
    imgSrc: "/location.png",
    title: "Location-Based Insights",
    description: "View incidents within your radius or explore any location.",
  },
  {
    imgSrc: "/like.png",
    title: "Community Validation",
    description: "Upvotes help verify and prioritize real incidents.",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Report Incident",
    description:
      "Users post an incident with location, category, and quick context.",
  },
  {
    number: "02",
    title: "AI Analyzes It",
    description:
      "The system classifies severity, extracts the signal, and flags urgency.",
  },
  {
    number: "03",
    title: "Nearby Users Get Alerts",
    description:
      "Relevant people receive live alerts based on proximity and risk level.",
  },
];

const previewFeed = [
  {
    title: "Suspicious activity near Central Station",
    summary:
      "AI detected a high-confidence crowd safety risk based on repeated reports.",
    severity: "High",
    time: "2 min ago",
  },
  {
    title: "Road blockage on Elm Street",
    summary:
      "Multiple local confirmations indicate traffic disruption and limited access.",
    severity: "Medium",
    time: "8 min ago",
  },
  {
    title: "Power outage reported in North District",
    summary:
      "AI grouped related reports and marked this as an active service disruption.",
    severity: "Moderate",
    time: "14 min ago",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function SectionReveal({ children, className = "", id }) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {children}
    </motion.section>
  );
}

function LandingPage() {
  const [showTop, setShowTop] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setShowTop(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <main className="dark min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative isolate">
        <SectionReveal className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-5 pb-8 pt-4 sm:px-8 sm:pb-14 sm:pt-5 lg:px-10">
          <motion.header
            className="mb-5 flex items-center justify-between sm:mb-8 lg:mb-10"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg shadow-primary/10 backdrop-blur-xl sm:h-11 sm:w-11">
                <img
                  src="/logo.png"
                  alt="StreetGuard AI logo"
                  className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-white/70 sm:text-sm">
                  Community Safety Platform
                </p>
                <p className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  StreetGuard AI
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-white/65 md:flex">
              <a className="transition hover:text-white" href="#problem">
                Problem
              </a>
              <a className="transition hover:text-white" href="#solution">
                Solution
              </a>
              <a className="transition hover:text-white" href="#features">
                Features
              </a>
              <a className="transition hover:text-white" href="#demo">
                Demo
              </a>
            </nav>
          </motion.header>

          <div className="grid flex-1 items-start gap-6 sm:gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-8">
            <motion.div
              className="max-w-xl lg:max-w-2xl"
              variants={itemVariants}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs text-white/75 backdrop-blur-xl sm:mb-5 sm:px-4 sm:py-2 sm:text-sm">
                Live incident intelligence for modern communities
              </div>

              <h1 className="max-w-3xl text-[2rem] font-extrabold leading-[1] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
                Stay Alert. Stay Safe. In Real-Time.
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/68 sm:mt-5 sm:max-w-lg sm:text-lg sm:leading-8">
                Report and receive real-time safety alerts around you powered by
                AI and community intelligence.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                <motion.button
                  onClick={() => setShowAuth(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:shadow-primary/35 sm:px-6 sm:py-3.5"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
                <motion.a
                  href="#features"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white/86 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10 sm:px-6 sm:py-3.5"
                >
                  Explore Incidents
                  <Radar className="h-4 w-4" />
                </motion.a>
              </div>
            </motion.div>

            <motion.div className="relative" variants={itemVariants}>
              {/* 3D layered frame effect */}
              <div className="relative p-[3px] rounded-[2rem] bg-gradient-to-br from-white/20 via-white/5 to-white/10 shadow-2xl shadow-black/50">
                <div className="relative rounded-[1.8rem] bg-gradient-to-br from-white/8 to-white/2 p-[2px] shadow-inner shadow-white/5">
                  <div className="overflow-hidden rounded-[1.6rem] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <img
                      src="/hero.png"
                      alt="StreetGuard AI dashboard preview"
                      className="w-full rounded-[1.6rem] object-contain"
                    />
                  </div>
                </div>
              </div>
              {/* Bottom reflection shadow */}
              <div className="absolute -bottom-4 left-6 right-6 h-8 rounded-full bg-black/30 blur-xl" />
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="flex justify-center pb-6 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.a
              href="#problem"
              aria-label="Scroll down"
              className="group flex flex-col items-center gap-2"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30 transition group-hover:text-white/55">
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/35 shadow-lg shadow-black/20 backdrop-blur-sm transition group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white/65"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </motion.a>
          </motion.div>
        </SectionReveal>

        <div className="mx-auto w-full max-w-7xl space-y-24 px-6 pb-20 sm:px-8 lg:px-10">
          <SectionReveal
            id="problem"
            className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/6 p-8 backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr] lg:p-10"
          >
            <motion.div variants={itemVariants}>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/85">
                The Problem
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Safety signals arrive too late when there is no shared source of
                truth.
              </h2>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                <img
                  src="/alert.png"
                  alt="Alert"
                  className="h-6 w-6 object-contain"
                />
              </div>
              <p className="text-base leading-8 text-white/68 sm:text-lg">
                People often remain unaware of nearby incidents until it&apos;s
                too late. There is no unified real-time system that keeps
                communities informed about safety risks.
              </p>
            </motion.div>
          </SectionReveal>

          <SectionReveal
            id="solution"
            className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/6 p-8 backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr] lg:p-10"
          >
            <motion.div variants={itemVariants}>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/85">
                Our Solution
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                StreetGuard AI makes local safety intelligence immediate,
                visible, and actionable.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/66">
                StreetGuard AI enables users to report incidents instantly and
                receive real-time alerts, powered by AI and location-based
                intelligence.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid gap-4 sm:grid-cols-2"
            >
              {[
                [
                  "Live classification",
                  "AI processes raw community reports in seconds.",
                ],
                [
                  "Signal over noise",
                  "Validation flows help prioritize credible incidents.",
                ],
                [
                  "Radius-aware alerts",
                  "Notifications adapt to user proximity and severity.",
                ],
                [
                  "Operational clarity",
                  "A single dashboard shows what matters right now.",
                ],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
                >
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {description}
                  </p>
                </div>
              ))}
            </motion.div>
          </SectionReveal>

          <SectionReveal id="features" className="space-y-8">
            <motion.div variants={itemVariants} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/85">
                Core Features
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Built for fast-moving communities that need trusted, real-time
                awareness.
              </h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
              {featureCards.map((feature) => {
                return (
                  <motion.article
                    key={feature.title}
                    variants={itemVariants}
                    className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 shadow-xl shadow-black/15 backdrop-blur-2xl"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-primary/20 to-blue-400/10">
                      <img
                        src={feature.imgSrc}
                        alt={feature.title}
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">
                      {feature.description}
                    </p>
                  </motion.article>
                );
              })}
            </motion.div>
          </SectionReveal>

          <SectionReveal className="space-y-8">
            <motion.div variants={itemVariants} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/85">
                How It Works
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                A simple three-step loop for local safety coordination.
              </h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid gap-5 lg:grid-cols-3"
            >
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  variants={itemVariants}
                  className="relative rounded-[1.8rem] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-[0.22em] text-primary/80">
                      {step.number}
                    </span>
                    {index < workflowSteps.length - 1 ? (
                      <ArrowRight className="hidden h-4 w-4 text-white/24 lg:block" />
                    ) : null}
                  </div>
                  <h3 className="mt-10 text-2xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/58">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </SectionReveal>

          <SectionReveal id="demo" className="space-y-8">
            <motion.div variants={itemVariants} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/85">
                Demo Preview
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                A feed designed to help users process urgency at a glance.
              </h2>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-2xl lg:grid-cols-[0.78fr_1.22fr]"
            >
              <div className="rounded-[1.6rem] border border-white/10 bg-[#0f1118]/90 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/50">Incident summary</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      AI incident feed
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/65">
                    Live sync
                  </span>
                </div>

                <div className="mt-6 rounded-[1.4rem] border border-primary/20 bg-primary/10 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/20 p-3">
                      <img
                        src="/ai.png"
                        alt="AI"
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        AI Summary
                      </p>
                      <p className="text-xs text-white/55">
                        Severity pattern recognized
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/65">
                    Multiple incident reports in the same corridor suggest
                    elevated risk. Nearby users should avoid the zone and use
                    alternate routes.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {previewFeed.map((incident, index) => (
                  <motion.div
                    key={incident.title}
                    className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-lg font-semibold text-white">
                          {incident.title}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-white/58">
                          {incident.summary}
                        </p>
                      </div>
                      <div className="flex flex-row gap-2 sm:flex-col sm:items-end">
                        <span
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            index === 0
                              ? " text-rose-300"
                              : index === 1
                                ? "text-amber-300"
                                : "text-blue-300"
                          }`}
                        >
                          <img
                            src={
                              index === 0
                                ? "/high.png"
                                : index === 1
                                  ? "/medium.png"
                                  : "/low.png"
                            }
                            alt=""
                            className="h-3 w-3 object-contain opacity-80"
                          />
                          {incident.severity}
                        </span>
                        <span className="text-xs text-white/42">
                          {incident.time}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </SectionReveal>

          <SectionReveal className="pb-8">
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(99,102,241,0.2),rgba(17,24,39,0.85),rgba(59,130,246,0.14))] p-8 shadow-2xl shadow-primary/10 backdrop-blur-2xl sm:p-10 lg:p-12"
            >
              <div className="absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                  Final CTA
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Start Exploring Safety Around You
                </h2>
                <p className="mt-5 text-lg leading-8 text-white/66">
                  Join a platform built to help neighborhoods, campuses, and
                  local communities move faster when safety matters most.
                </p>
                <motion.button
                  onClick={() => setShowAuth(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          </SectionReveal>

          <SectionReveal className="border-t border-white/8 py-8">
            <motion.footer
              variants={itemVariants}
              className="flex flex-col gap-5 text-sm text-white/55 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                  <img
                    src="/logo.png"
                    alt="StreetGuard AI logo"
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">StreetGuard AI</p>
                  <p className="text-xs text-white/45">
                    Real-time community safety intelligence
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <a
                  className="inline-flex items-center gap-2 transition hover:text-white"
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a className="transition hover:text-white" href="#">
                  Contact
                </a>
                <a className="transition hover:text-white" href="#solution">
                  About
                </a>
              </div>
            </motion.footer>
          </SectionReveal>
        </div>
      </div>

      {/* Back to top button */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="back-to-top"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/70 shadow-xl shadow-black/30 backdrop-blur-xl transition hover:border-primary/40 hover:bg-primary/15 hover:text-primary"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
}

export default LandingPage;
