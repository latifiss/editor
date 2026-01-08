import AdminProfileClient from "./AdminProfileClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Server-side function to fetch profile data
async function fetchAdminProfile() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("admin_access_token")?.value;

    if (!accessToken) {
      return null;
    }

    // Fetch profile from your backend API directly
    const response = await fetch("http://localhost:8080/api/admin/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache for fresh data
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch admin profile:", error);
    return null;
  }
}

export default async function AdminProfilePage() {
  // Fetch profile data on the server
  const adminProfile = await fetchAdminProfile();

  // Redirect to login if not authenticated
  if (!adminProfile) {
    redirect("/admin/login");
  }

  // Format the data to match your Admin interface
  const formattedAdmin = {
    _id: adminProfile.id || adminProfile._id,
    name: adminProfile.name,
    email: adminProfile.email,
    role: adminProfile.role,
    profileImage: adminProfile.profileImage || "",
    lastLogin: adminProfile.lastLogin,
    createdAt: adminProfile.createdAt,
    updatedAt: adminProfile.updatedAt,
    isActive: adminProfile.isActive || true,
    displayName: adminProfile.displayName || adminProfile.name || adminProfile.email.split('@')[0],
  };

  // Pass the server-fetched data to the client component
  return <AdminProfileClient initialAdmin={formattedAdmin} />;
}