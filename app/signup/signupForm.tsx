"use client";

import { IconInput } from "@/components/ui/inputs/iconInput";
import Button from "@/components/ui/buttons/button";
import { EnvelopeIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegisterMutation } from "@/store/features/auth/authAPI";
import { ClipLoader } from "react-spinners";
import { ShieldCheckIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
    role: "admin" as "admin" | "super_admin" | "editor" | "viewer"
  });
  
  const [validationError, setValidationError] = useState("");
  const router = useRouter();
  const [register, { isLoading, error }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.name.trim()) {
      setValidationError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    const registerData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      ...(formData.profileImage && { profileImage: formData.profileImage }),
      ...(formData.role !== "admin" && { role: formData.role })
    };

    try {
      const result = await register(registerData).unwrap();
      
      if (result.success) {
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
        setValidationError(result.message || "Registration failed");
      }
    } catch (err: any) {}
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const getErrorMessage = () => {
    if (validationError) return validationError;
    if (!error) return null;
    
    if ('data' in error && error.data) {
      const data = error.data as any;
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.join(", ");
      }
      return data?.message || 'Registration failed. Please try again.';
    }
    
    if ('status' in error) {
      switch (error.status) {
        case 409:
          return "An admin with this email already exists";
        case 400:
          return "Invalid registration data provided";
        case 500:
          return "Server error. Please try again later";
        default:
          return 'Registration failed. Please try again.';
      }
    }
    
    return 'Registration failed. Please try again.';
  };

  const displayError = getErrorMessage();

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Account Registration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new admin account for your dashboard
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {displayError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">
              {displayError}
            </p>
          </div>
        )}

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Full Name</p>
          <IconInput
            icon={UserIcon}
            placeholder="Enter your full name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange("name")}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This will be your display name in the admin panel
          </p>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Email address</p>
          <IconInput
            icon={EnvelopeIcon}
            placeholder="Enter your email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange("email")}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use a professional email address for admin access
          </p>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Role</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              value={formData.role}
              onChange={handleChange("role")}
              disabled={isLoading}
            >
              <option value="admin">Admin (Default)</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Select appropriate role based on permissions needed
          </p>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Profile Image URL (Optional)</p>
          <IconInput
            icon={PhotoIcon}
            placeholder="Enter image URL (e.g., https://example.com/avatar.jpg)"
            type="url"
            value={formData.profileImage}
            onChange={handleChange("profileImage")}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Optional: Provide a direct URL to your profile image
          </p>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Password</p>
          <IconInput
            icon={LockClosedIcon}
            placeholder="Create a strong password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange("password")}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Must be at least 6 characters long
          </p>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Confirm Password</p>
          <IconInput
            icon={LockClosedIcon}
            placeholder="Confirm your password"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            disabled={isLoading}
          />
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
                Creating Admin Account...
              </span>
            ) : (
              "Create Admin Account"
            )}
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2"><strong>Role Information:</strong></p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Super Admin</strong>: Full system access</li>
              <li>• <strong>Admin</strong>: Administrative access</li>
              <li>• <strong>Editor</strong>: Can create/edit content</li>
              <li>• <strong>Viewer</strong>: Read-only access</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
          Already have an admin account?{" "}
          <Link 
            href="/login" 
            className="underline text-green-500 dark:text-green-400 font-bold hover:text-green-600 dark:hover:text-green-300 transition-colors"
          >
            Login here
          </Link>
        </p>
      </form>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> This registration is for admin access only. 
          All registrations are subject to approval by the system administrator.
          By creating an account, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}