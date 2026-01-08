import { useState } from "react";
import { Admin } from "@/store/features/auth/authTypes";
import { useUpdateProfileMutation } from "@/store/features/auth/authAPI";
import Modal from "@/components/ui/modal/Modal";
import Button from "@/components/ui/buttons/button";
import { ClipLoader } from "react-spinners";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  admin: Admin | null;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSuccess,
  admin,
}: EditProfileModalProps) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    profileImage: admin?.profileImage || "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      const result = await updateProfile(formData).unwrap();
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      const error = err as { data?: { message?: string; errors?: string[] } };
      const message = error?.data?.message || error?.data?.errors?.[0] || "Failed to update profile";
      setError(message);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Display Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleChange("name")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Enter your name"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This will be displayed across the admin panel
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Image URL
          </label>
          <input
            type="url"
            value={formData.profileImage}
            onChange={handleChange("profileImage")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Optional: Direct URL to your profile image
          </p>
        </div>

        {formData.profileImage && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image Preview
            </label>
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
              <img
                src={formData.profileImage}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span class="text-xs text-gray-500">Invalid URL</span>
                    </div>
                  `;
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <ClipLoader size={16} color="#fff" />
                Updating...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}