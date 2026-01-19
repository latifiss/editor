export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Upload through the Next.js backend API
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.error || `HTTP ${response.status}`;
      console.error("Upload error:", errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error uploading image:", message);
    throw new Error(message);
  }
};