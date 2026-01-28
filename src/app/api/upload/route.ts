import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BLOB_STORE_ID = process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadName = formData.get('x-upload-name') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = uploadName || file.name;
    const fileType = file.type || 'application/octet-stream';

    if (BLOB_STORE_ID) {
      const blob = await put(fileName, file, {
        access: 'public',
      });

      return NextResponse.json({
        url: blob.url,
        name: fileName,
        size: file.size,
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64 = buffer.toString('base64');
    const dataUrl = `data:${fileType};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      name: fileName,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

async function put(
  key: string,
  value: File | Buffer | string,
  options?: { access: 'public' }
): Promise<{ url: string }> {
  const blobServiceUrl = process.env.BLOB_STORAGE_URL || '';

  if (blobServiceUrl) {
    const response = await fetch(`${blobServiceUrl}/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': value instanceof File ? value.type : 'application/octet-stream',
        'x-access': options?.access || 'private',
      },
      body: value instanceof File ? value : Buffer.from(value as string),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload blob: ${response.statusText}`);
    }

    const result = await response.json();
    return { url: result.url };
  }

  throw new Error('No blob storage configured');
}
