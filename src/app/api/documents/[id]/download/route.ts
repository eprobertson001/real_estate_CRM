import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Fetch document record
    const document = await prisma.document.findUnique({
      where: {
        id: documentId
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(document.filePath);

    // Return file with appropriate headers for download
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', document.mimeType);
    response.headers.set('Content-Disposition', `attachment; filename="${document.originalName}"`);
    response.headers.set('Content-Length', document.size.toString());

    return response;

  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}
