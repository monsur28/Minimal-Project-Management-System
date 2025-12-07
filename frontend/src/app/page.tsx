"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

type FormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: values.email.trim(),
        password: values.password,
      });
      login(data);
      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Login failed. Please check your credentials.";
      setServerError(message);
      toast.error("Login failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900">
      {/* Animated background layers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-violet-800 to-cyan-800 opacity-30" />
        <div className="absolute -left-24 -top-24 w-[520px] h-[520px] bg-gradient-to-tr from-indigo-500 to-pink-400 rounded-full opacity-25 blur-3xl transform -rotate-12" />
        <div className="absolute -right-24 -bottom-24 w-[560px] h-[560px] bg-gradient-to-br from-cyan-400 to-emerald-300 rounded-full opacity-22 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/2 via-transparent to-transparent mix-blend-overlay" />
      </motion.div>

      {/* Soft spotlight behind the card */}
      <div className="absolute top-1/2 left-1/2 w-[720px] h-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <Card className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-b from-white/6 to-white/4 backdrop-blur-sm">
          <CardHeader className="px-6 pt-6 pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-slate-50 font-semibold">Welcome back</CardTitle>
                <CardDescription className="text-sm text-slate-300">
                  Sign in to continue to <span className="font-medium text-indigo-200">MPMS</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-2">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400">
                      <Mail className="w-5 h-5" />
                    </span>
                    <Input
                      id="email"
                      placeholder="Email"
                      aria-invalid={!!errors.email}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "Enter a valid email address",
                        },
                      })}
                      className="pl-11 pr-3 bg-transparent text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-400 mt-1" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      aria-invalid={!!errors.password}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                      })}
                      className="pl-11 pr-10 bg-transparent text-slate-100 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-3 text-slate-300 hover:text-slate-100"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-400 mt-1" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="rounded-md bg-rose-900/30 border border-rose-700/30 px-3 py-2 text-sm text-rose-200">
                    {serverError}
                  </div>
                )}

                {/* Submit */}
                <div>
                  <Button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold flex items-center justify-center gap-3"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            {/* optional subtle helper text; removed demo credentials on request */}
            <p className="mt-5 text-center text-xs text-slate-400">
              By signing in you agree to the MPMS terms of service.
            </p>
          </CardContent>

          <CardFooter className="flex items-center justify-between px-6 py-3 bg-white/3 border-t border-white/6">
            {/* Removed "Need an account? Sign up" as requested */}
            <div className="text-sm text-slate-300">© {new Date().getFullYear()} MPMS</div>
            <div>
              <Button variant="outline" className="border border-white/8 bg-white/2 text-slate-100 px-3 py-1 rounded-md">
                Contact support
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
