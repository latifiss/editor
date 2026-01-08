import { Admin } from "@/store/features/auth/authTypes";
import { UserCircleIcon, CameraIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface ProfileHeaderProps {
  admin: Admin | null;
}

export default function ProfileHeader({ admin }: ProfileHeaderProps) {
  const profileImage = admin?.profileImage || '';
  const displayName = admin?.name || admin?.email?.split('@')[0] || 'Admin';
  const email = admin?.email || '';

  return (
    <div className="text-center">
      <div className="relative inline-block">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={displayName}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <UserCircleIcon className="h-20 w-20 text-white" />
            </div>
          )}
        </div>
        {profileImage && (
          <div className="absolute bottom-2 right-2">
            <div className="p-2 bg-blue-500 rounded-full shadow-lg">
              <CameraIcon className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {displayName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{email}</p>
        <div className="mt-4">
          <span className="inline-block px-4 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
            Administrator
          </span>
        </div>
      </div>
    </div>
  );
}