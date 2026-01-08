import { Admin } from "@/store/features/auth/authTypes";
import { 
  EnvelopeIcon, 
  CalendarIcon, 
  IdentificationIcon,
  BriefcaseIcon,
  GlobeAltIcon 
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface ProfileInfoProps {
  admin: Admin | null;
}

export default function ProfileInfo({ admin }: ProfileInfoProps) {
  const infoItems = [
    {
      icon: <EnvelopeIcon className="h-5 w-5" />,
      label: "Email Address",
      value: admin?.email || "Not provided",
      copyable: true,
    },
    {
      icon: <IdentificationIcon className="h-5 w-5" />,
      label: "Admin ID",
      value: admin?._id || "N/A",
      copyable: true,
    },
    {
      icon: <BriefcaseIcon className="h-5 w-5" />,
      label: "Display Name",
      value: admin?.displayName || admin?.name || "Not set",
    },
    {
      icon: <CalendarIcon className="h-5 w-5" />,
      label: "Account Created",
      value: admin?.createdAt 
        ? new Date(admin.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : "Unknown",
    },
    {
      icon: <CalendarIcon className="h-5 w-5" />,
      label: "Last Updated",
      value: admin?.updatedAt 
        ? new Date(admin.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : "Unknown",
    },
    {
      icon: <GlobeAltIcon className="h-5 w-5" />,
      label: "Last Login",
      value: admin?.lastLogin 
        ? new Date(admin.lastLogin).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : "Never logged in",
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Profile Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoItems.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-900 dark:text-white font-medium">
                {item.value}
              </p>
              {item.copyable && (
                <button
                  onClick={() => copyToClipboard(item.value)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {admin?.profileImage && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Image
          </h4>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <Image
                src={admin.profileImage}
                alt="Profile"
                              className="w-full h-full object-cover"
                              width={60}
                              height={60}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                URL: <span className="font-mono text-xs">{admin.profileImage}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}