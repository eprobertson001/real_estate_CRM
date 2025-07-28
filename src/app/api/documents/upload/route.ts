import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { prisma } from '@/lib/prisma';

// Configure formidable
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  console.log('=== UPLOAD API CALLED ===');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const transactionId = formData.get('transactionId') as string;
    const type = formData.get('type') as string;
    
    console.log('Upload params:', { 
      fileName: file?.name, 
      fileType: file?.type, 
      fileSize: file?.size,
      transactionId, 
      type 
    });
    
    if (!file) {
      console.log('Error: No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!transactionId) {
      console.log('Error: No transaction ID');
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      console.log('Error: Invalid file type:', file.type);
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, Word, and Excel documents are allowed.' 
      }, { status: 400 });
    }

    console.log('File validation passed');
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File converted to buffer, size:', buffer.length);
    
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;
    const filepath = path.join(uploadDir, filename);
    
    console.log('Saving file to:', filepath);
    
    // Save file
    fs.writeFileSync(filepath, buffer);
    console.log('File saved successfully');

    // Parse document based on type
    let extractedText = '';
    let extractedData = {};

    console.log('Starting document parsing...');
    
    try {
      if (file.type === 'application/pdf') {
        console.log('Parsing PDF...');
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
        extractedData = await parsePdfData(pdfData.text);
        console.log('PDF parsed successfully, extracted data keys:', Object.keys(extractedData));
      } else if (file.type.includes('word') || file.type.includes('officedocument')) {
        console.log('Parsing Word document...');
        const docData = await mammoth.extractRawText({ buffer });
        extractedText = docData.value;
        extractedData = await parseWordData(docData.value);
        console.log('Word document parsed successfully, extracted data keys:', Object.keys(extractedData));
      } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
        console.log('Excel file detected - skipping parsing');
        // For Excel files, we'll use a simpler approach
        extractedData = { message: 'Excel file uploaded - manual review required' };
      }
    } catch (parseError) {
      console.error('Error parsing document:', parseError);
      // Continue without parsing data, but still save the file
    }

    console.log('Document parsing completed');

    // Check if we have a user in the database, if not create a default one
    let userId = 'user-1';
    try {
      console.log('Checking for existing user...');
      let user = await prisma.user.findFirst();
      if (!user) {
        console.log('No users found, creating default user...');
        user = await prisma.user.create({
          data: {
            email: 'admin@realestate.com',
            name: 'Admin User',
            role: 'ADMIN'
          }
        });
        console.log('Default user created with ID:', user.id);
      }
      userId = user.id;
      console.log('Using user ID:', userId);
    } catch (userError) {
      console.error('Error with user handling:', userError);
      // Continue with default user ID
    }

    console.log('Saving document to database...');
    
    // Save document record to database
    const document = await prisma.document.create({
      data: {
        title: file.name,
        type: type || getDocumentType(file.name),
        originalName: file.name,
        filePath: filepath,
        size: file.size,
        mimeType: file.type,
        parsedData: Object.keys(extractedData).length > 0 ? JSON.stringify(extractedData) : null,
        transactionId: transactionId,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });
    
    console.log('Document saved to database with ID:', document.id);

    // Update transaction with parsed data if available and non-empty
    let transactionUpdated = false;
    if (Object.keys(extractedData).length > 0) {
      console.log('Updating transaction with parsed data...');
      try {
        transactionUpdated = await updateTransactionWithParsedData(transactionId, extractedData);
        console.log('Transaction update result:', transactionUpdated);
      } catch (updateError) {
        console.error('Error updating transaction:', updateError);
        // Continue even if transaction update fails
      }
    }

    console.log('Upload completed successfully');

    return NextResponse.json({
      success: true,
      document,
      parsedData: Object.keys(extractedData).length > 0 ? extractedData : null,
      transactionUpdated,
      extractedText: extractedText.substring(0, 500), // Limit text for response
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload and process document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Parse PDF data to extract real estate information
async function parsePdfData(text: string) {
  const data: any = {};

  // Clean up text for better parsing
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Extract property address
  const addressPatterns = [
    /(?:property address|address|property location)[\s:]+([^\n\r,]+(?:,\s*[^\n\r,]+)*)/i,
    /(\d+\s+[a-z\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|boulevard|blvd|way|place|pl))/i
  ];

  for (const pattern of addressPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.address = match[1].trim();
      break;
    }
  }

  // Extract purchase price
  const pricePatterns = [
    /(?:purchase price|sale price|price)[\s:]*\$?([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.?\d*)/g
  ];

  for (const pattern of pricePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      if (price > 10000) { // Reasonable minimum for real estate
        data.purchasePrice = price;
        break;
      }
    }
  }

  // Extract names (buyer/seller)
  const namePatterns = [
    /(?:buyer|purchaser)[\s:]+([a-z\s,]+?)(?:\n|$)/i,
    /(?:seller|vendor)[\s:]+([a-z\s,]+?)(?:\n|$)/i
  ];

  namePatterns.forEach((pattern, index) => {
    const match = cleanText.match(pattern);
    if (match) {
      const key = index === 0 ? 'buyerName' : 'sellerName';
      data[key] = match[1].trim();
    }
  });

  // Extract dates
  const datePatterns = [
    /(?:closing date|settlement date|completion date)[\s:]+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i,
    /(?:contract date|agreement date)[\s:]+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i
  ];

  datePatterns.forEach((pattern, index) => {
    const match = cleanText.match(pattern);
    if (match) {
      const key = index === 0 ? 'closingDate' : 'contractDate';
      data[key] = match[1];
    }
  });

  // Extract property type
  const propertyTypePatterns = [
    /(?:property type|dwelling type)[\s:]+([a-z\s]+?)(?:\n|$)/i,
    /(single family|condo|townhouse|multi[- ]family|commercial)/i
  ];

  for (const pattern of propertyTypePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.propertyType = match[1].trim();
      break;
    }
  }

  // Extract MLS number
  const mlsPattern = /(?:mls|listing)[\s#:]*([a-z0-9]+)/i;
  const mlsMatch = cleanText.match(mlsPattern);
  if (mlsMatch) {
    data.mlsNumber = mlsMatch[1];
  }

  // Extract commission information
  const commissionPatterns = [
    /(?:commission|fee)[\s:]*(\d+\.?\d*)%/i,
    /(?:commission|fee)[\s:]*\$?([\d,]+\.?\d*)/i
  ];

  for (const pattern of commissionPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.commission = match[1];
      break;
    }
  }

  return data;
}

// Use the same parsing logic as PDF
async function parseWordData(text: string) {
  return await parsePdfData(text);
}

// Helper function to determine document type from filename
function getDocumentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('contract')) return 'CONTRACT';
  if (lowerName.includes('disclosure')) return 'DISCLOSURE';
  if (lowerName.includes('inspection')) return 'INSPECTION';
  if (lowerName.includes('appraisal')) return 'APPRAISAL';
  
  switch (ext) {
    case 'pdf': return 'PDF';
    case 'doc':
    case 'docx': return 'DOCUMENT';
    case 'xls':
    case 'xlsx': return 'SPREADSHEET';
    default: return 'OTHER';
  }
}

// Update transaction with parsed data (only update empty fields)
async function updateTransactionWithParsedData(
  transactionId: string, 
  parsedData: Record<string, any>
): Promise<boolean> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });
    
    if (!transaction) return false;
    
    // Map parsed data fields to transaction fields
    const fieldMapping: Record<string, string> = {
      address: 'propertyAddress',
      purchasePrice: 'price',
      buyerName: 'clientName',
      sellerName: 'sellerName',
      closingDate: 'closingDate',
      contractDate: 'contractDate',
      propertyType: 'propertyType',
      mlsNumber: 'mlsNumber'
    };
    
    // Only update fields that are empty or null in the existing transaction
    const updateData: any = {};
    
    Object.entries(parsedData).forEach(([key, value]) => {
      const dbField = fieldMapping[key] || key;
      if (value && ((transaction as any)[dbField] === null || (transaction as any)[dbField] === undefined || (transaction as any)[dbField] === '')) {
        updateData[dbField] = value;
      }
    });
    
    if (Object.keys(updateData).length > 0) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: updateData
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Transaction update error:', error);
    return false;
  }
}
