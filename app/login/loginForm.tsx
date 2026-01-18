"use client";

import { IconInput } from "@/components/ui/inputs/iconInput";
import Button from "@/components/ui/buttons/button";
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "@/store/features/auth/authAPI";
import { ClipLoader } from "react-spinners";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      setValidationError("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await login({ 
        email: formData.email, 
        password: formData.password 
      }).unwrap();
      
      if (result.success) {
        if (formData.rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        const cookiesToSet = [
          {
            name: "admin_access_token",
            value: result.data.tokens.accessToken,
            days: 7
          },
          {
            name: "admin_auth_token",
            value: result.data.tokens.authToken || "",
            days: 7
          },
          {
            name: "admin_refresh_token",
            value: result.data.tokens.refreshToken,
            days: 7
          }
        ];

        cookiesToSet.forEach(cookie => {
          const expires = new Date();
          expires.setTime(expires.getTime() + (cookie.days * 24 * 60 * 60 * 1000));
          document.cookie = `${cookie.name}=${cookie.value}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
        });
        
        router.push("/profile");
      } else {
        setValidationError(result.message || "Login failed");
      }
    } catch (err: any) {}
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'rememberMe' ? e.target.checked : e.target.value
    }));
  };

  const getErrorMessage = () => {
    if (validationError) return validationError;
    if (!error) return null;
    
    if ('data' in error && error.data) {
      const data = error.data as any;
      
      if (error.status === 423) {
        return "Your account has been locked due to too many failed login attempts. Please try again in 2 hours or contact an administrator.";
      }
      
      if (error.status === 403 && data.message?.includes('deactivated')) {
        return "Your account has been deactivated. Please contact an administrator.";
      }
      
      if (error.status === 401 && data.attemptsLeft) {
        return `Invalid email or password. ${data.attemptsLeft} attempt(s) remaining before account lock.`;
      }
      
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.join(", ");
      }
      return data?.message || 'Login failed. Please try again.';
    }
    
    if ('status' in error) {
      switch (error.status) {
        case 401:
          return "Invalid email or password";
        case 403:
          return "Access denied. Account may be deactivated.";
        case 423:
          return "Account is temporarily locked. Please try again later.";
        case 404:
          return "Admin account not found";
        case 500:
          return "Server error. Please try again later.";
        default:
          return 'Login failed. Please try again.';
      }
    }
    
    return 'Login failed. Please try again.';
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <ShieldCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Login
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access your admin dashboard
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">
              {errorMessage}
            </p>
            {errorMessage.includes("locked") && (
              <p className="text-xs text-red-500 dark:text-red-300 mt-1">
                For immediate assistance, contact your system administrator.
              </p>
            )}
          </div>
        )}

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Email address</p>
          <IconInput
            icon={EnvelopeIcon}
            placeholder="Enter your admin email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange("email")}
            disabled={isLoading}
            autoComplete="email"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use your registered admin email address
          </p>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Password</p>
          <div className="relative">
            <IconInput
              icon={LockClosedIcon}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange("password")}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Passwords are case-sensitive
          </p>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange("rememberMe")}
              disabled={isLoading}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </span>
          </label>
          
          <Link 
            href="/forgot-password" 
            className="text-sm font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <ClipLoader size={16} color="#fff" />
                Signing in...
              </span>
            ) : (
              "Sign In to Dashboard"
            )}
          </Button>
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            <strong>Security Notice:</strong> This is an admin area. Ensure you're using a secure connection and log out after your session.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Need admin access?{" "}
            <Link 
              href="/request-access" 
              className="underline text-blue-500 dark:text-blue-400 font-bold hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
            >
              Request access
            </Link>
          </p>
          
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Back to{" "}
            <Link 
              href="/" 
              className="underline text-gray-600 dark:text-gray-400 font-bold hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Main Site
            </Link>
          </p>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> After 5 failed login attempts, your account will be locked for 2 hours. 
          Contact a super administrator if you're unable to access your account.
        </p>
      </div>
    </div>
  );
}