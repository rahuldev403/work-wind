import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

const LogInForm = ({ onSwitchToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to auth API
  };

  return (
    <div className="flex h-full flex-col px-6 pb-7 pt-5">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Sign in to your StreetGuard AI account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3">
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

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs font-medium text-primary/70 transition hover:text-primary"
          >
            Forgot password?
          </button>
        </div>

        <div className="mt-auto">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/35"
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </form>

      <p className="mt-5 text-center text-xs text-white/38">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-medium text-primary/75 transition hover:text-primary"
        >
          Create one
        </button>
      </p>
    </div>
  );
};

export default LogInForm;
