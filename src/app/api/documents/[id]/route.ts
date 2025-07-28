import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

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

    // Return file with appropriate headers
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

export async function DELETE(
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

    // Delete file from disk if it exists
    if (fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (fileError) {
        console.error('Error deleting file from disk:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete document record from database
    await prisma.document.delete({
      where: {
        id: documentId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
