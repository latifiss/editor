import { Admin } from "@/store/features/auth/authTypes";
import { 
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

interface ProfileSecurityProps {
  admin: Admin | null;
}

export default function ProfileSecurity({ admin }: ProfileSecurityProps) {
  const securityItems = [
    {
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      title: "Account Security",
      description: "Your account is protected with secure authentication",
      status: "Secure",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: <DevicePhoneMobileIcon className="h-5 w-5" />,
      title: "Login History",
      description: "Monitor your account login activity",
      status: "Active",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: <ClockIcon className="h-5 w-5" />,
      title: "Session Management",
      description: "Manage your active sessions",
      status: "1 Active",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
  ];

  const recentActivity = [
    {
      action: "Password Changed",
      time: "2 hours ago",
      device: "Chrome on Windows",
      location: "New York, US",
    },
    {
      action: "Profile Updated",
      time: "1 day ago",
      device: "Safari on macOS",
      location: "San Francisco, US",
    },
    {
      action: "Successful Login",
      time: "3 days ago",
      device: "Firefox on Linux",
      location: "London, UK",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Security & Activity
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {securityItems.map((item, index) => (
          <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {item.description}
                </p>
                <span className={`text-xs font-medium ${item.color} mt-2 inline-block`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h4>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <ExclamationTriangleIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.device} • {activity.location}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h5 className="font-semibold text-blue-800 dark:text-blue-300">
              Security Recommendations
            </h5>
            <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1">
              <li>• Enable two-factor authentication for added security</li>
              <li>• Use a strong, unique password</li>
              <li>• Review your login history regularly</li>
              <li>• Log out from shared devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}