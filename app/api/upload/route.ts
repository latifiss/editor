import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Create FormData for backend
    const backendFormData = new FormData();
    backendFormData.append('image', file);

    // Call backend upload endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const uploadUrl = `${backendUrl}/api/upload/image`;
    
    console.log('Uploading to:', uploadUrl);
    console.log('File:', file.name, file.type, file.size);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: backendFormData,
      // Note: Don't set Content-Type header - let the browser set it with boundary
    });

    console.log('Backend response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend error:', errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Upload failed' },
        { status: uploadResponse.status }
      );
    }

    const data = await uploadResponse.json();
    console.log('Upload successful, URL:', data.url || data.image_url);
    
    return NextResponse.json({ url: data.url || data.image_url });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
