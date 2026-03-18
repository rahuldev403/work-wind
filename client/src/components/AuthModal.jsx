import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import LogInForm from "./LogInForm";
import SignUpForm from "./SignUpForm";
import VerifyOtpForm from "./VerifyOtpForm";
import { useAuthStore } from "../store/AuthStore";

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 280 : -280,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -280 : 280,
    opacity: 0,
  }),
};

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [direction, setDirection] = useState(1);

  const authStep = useAuthStore((state) => state.authStep);
  const setAuthStep = useAuthStore((state) => state.setAuthStep);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsLogin(true);
      setDirection(1);
      setAuthStep("login");
    }
  }, [isOpen, setAuthStep]);

  const switchToSignup = () => {
    setDirection(1);
    setIsLogin(false);
    setAuthStep("signup");
  };

  const switchToLogin = () => {
    setDirection(-1);
    setIsLogin(true);
    setAuthStep("login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div className="rounded-[2rem] border border-white/10 bg-[#0c0e16]/92 shadow-2xl shadow-black/60 backdrop-blur-2xl">
              <div className="flex items-center justify-between px-6 pt-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[0.75rem] border border-white/10 bg-white/8">
                    <img
                      src="/logo.png"
                      alt="StreetGuard AI"
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                  <span className="text-sm font-semibold text-white/75">
                    StreetGuard AI
                  </span>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="flex h-8 w-8 items-center justify-center rounded-[0.75rem] border border-white/10 bg-white/6 text-white/45 transition hover:border-white/20 hover:bg-white/10 hover:text-white/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 pt-5">
                {authStep !== "verify-signup-otp" && (
                  <div className="flex gap-1 rounded-[0.9rem] border border-white/8 bg-white/4 p-1">
                    <button
                      onClick={switchToLogin}
                      className={`flex-1 rounded-[0.65rem] py-2 text-sm font-semibold transition-all duration-200 ${
                        isLogin
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "text-white/45 hover:text-white/75"
                      }`}
                    >
                      Log In
                    </button>
                    <button
                      onClick={switchToSignup}
                      className={`flex-1 rounded-[0.65rem] py-2 text-sm font-semibold transition-all duration-200 ${
                        !isLogin
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "text-white/45 hover:text-white/75"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              <div className="h-[390px] overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={
                      authStep === "verify-signup-otp"
                        ? "otp"
                        : isLogin
                          ? "login"
                          : "signup"
                    }
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full"
                  >
                    {authStep === "verify-signup-otp" ? (
                      <VerifyOtpForm
                        onSuccess={onClose}
                        onBackToLogin={switchToLogin}
                      />
                    ) : isLogin ? (
                      <LogInForm
                        onSwitchToSignup={switchToSignup}
                        onSuccess={onAuthSuccess || onClose}
                      />
                    ) : (
                      <SignUpForm onSwitchToLogin={switchToLogin} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
