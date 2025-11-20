import { useState } from "react";
import { motion } from "framer-motion";
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

interface LoginPageProps {
  onLogin: (password: string) => Promise<void>;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onLogin(password);
    } catch (err: any) {
      setError(err.message || "Invalid password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1e] via-[#131824] to-[#1a1f2e] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-[#131824]/80 backdrop-blur-xl border border-[#1e2538] rounded-2xl shadow-2xl p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Trading Platform
            </h1>
            <p className="text-gray-400 text-sm">
              Enter your password to continue
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className={`w-full bg-[#1a1f2e] border ${
                    error ? "border-red-500" : "border-[#2a3142]"
                  } rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                  placeholder="Enter your password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              disabled={!password || isLoading}
            >
              {isLoading ? "Authenticating..." : "Login"}
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-xs text-gray-500"
          >
            Secured with industry-standard encryption
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-sm text-gray-500"
        >
          © 2024 Trading Platform. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
  );
};
