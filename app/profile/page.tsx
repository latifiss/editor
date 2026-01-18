import AdminProfileClient from "./AdminProfileClient";
import { cookies } from "next/headers";

async function fetchAdminProfile() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("admin_access_token")?.value;

    if (!accessToken) {
      return null;
    }

    const response = await fetch("http://localhost:8080/api/admin/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
  const adminProfile = await fetchAdminProfile();

  const formattedAdmin = adminProfile
    ? {
        _id: adminProfile.id || adminProfile._id,
        name: adminProfile.name,
        email: adminProfile.email,
        role: adminProfile.role,
        profileImage: adminProfile.profileImage || "",
        lastLogin: adminProfile.lastLogin,
        createdAt: adminProfile.createdAt,
        updatedAt: adminProfile.updatedAt,
        isActive: adminProfile.isActive ?? true,
        displayName:
          adminProfile.displayName || adminProfile.name || (adminProfile.email || "").split("@")[0],
      }
    : null;

  return <AdminProfileClient initialAdmin={formattedAdmin} />;
}