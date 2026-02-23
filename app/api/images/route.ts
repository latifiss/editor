export const runtime = 'edge';

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAuthHeader() {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error('Cloudinary API key or secret not configured');
  }
  const credentials = btoa(`${apiKey}:${apiSecret}`);
  return `Basic ${credentials}`;
}

export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

    const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image`);
    url.searchParams.set('max_results', '500');
    url.searchParams.set('direction', 'desc');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cloudinary API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const resources = data.resources || [];

    const map = resources.map((item: Record<string, unknown>) => ({
      id: item.public_id,
      url: item.secure_url,
      created_at: item.created_at,
      bytes: item.bytes,
      format: item.format,
      display_name: item.display_name || item.public_id,
      width: item.width,
      height: item.height,
    }));

    return NextResponse.json(map);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({error: 'Failed to fetch images'}, {status: 500});
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({error: 'No file provided'}, {status: 400});
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('resource_type', 'image');
    uploadFormData.append('public_id', file.name.replace(/\.[^.]+$/, ''));

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(),
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cloudinary upload error: ${response.status} - ${errText}`);
    }

    const result = await response.json();
    return NextResponse.json({
      id: result.public_id,
      url: result.secure_url,
      created_at: result.created_at,
      bytes: result.bytes,
      format: result.format,
      display_name: result.display_name || result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({error: 'Failed to upload file'}, {status: 500});
  }
}
