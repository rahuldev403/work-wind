import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

const SignUpForm = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to auth API
  };

  return (
    <div className="flex h-full flex-col px-6 pb-7 pt-5">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Create an account
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Join your community safety network today.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3">
        <div className="group relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition group-focus-within:text-primary/70" />
          <input
            type="text"
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-0 border-b border-white/18 bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/75"
          />
        </div>

        <div className="group relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition group-focus-within:text-primary/70" />
          <input
            type="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border-0 border-b border-white/18 bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/75"
          />
        </div>

        <div className="group relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition group-focus-within:text-primary/70" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border-0 border-b border-white/18 bg-transparent py-3 pl-10 pr-11 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/75"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/65"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <p className="text-[11px] leading-5 text-white/32">
          By signing up you agree to our{" "}
          <span className="cursor-pointer text-primary/65 transition hover:text-primary">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="cursor-pointer text-primary/65 transition hover:text-primary">
            Privacy Policy
          </span>
          .
        </p>

        <div className="mt-auto">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/35"
          >
            Create Account
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </form>

      <p className="mt-5 text-center text-xs text-white/38">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-primary/75 transition hover:text-primary"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default SignUpForm;
