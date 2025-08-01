import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  console.log('=== DOCUMENT PARSE API CALLED ===');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('Parse params:', { 
      fileName: file?.name, 
      fileType: file?.type, 
      fileSize: file?.size
    });
    
    if (!file) {
      console.log('Error: No file provided for parsing');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type)) {
      console.log('Error: Invalid file type for parsing:', file.type);
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF and Word documents can be parsed.' 
      }, { status: 400 });
    }

    console.log('File validation passed for parsing');
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File converted to buffer for parsing, size:', buffer.length);

    // Parse document based on type
    let extractedText = '';
    let extractedData = {};

    console.log('Starting document parsing...');
    
    try {
      if (file.type === 'application/pdf') {
        console.log('Parsing PDF...');
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
        console.log('Parsing text length:', extractedText.length);
        console.log('First 500 chars of extracted text:', extractedText.substring(0, 500));
        extractedData = await parseDocumentData(pdfData.text);
        console.log('Final extracted data:', extractedData);
        console.log('PDF parsed successfully, extracted:', Object.keys(extractedData));
      } else if (file.type.includes('word') || file.type.includes('officedocument')) {
        console.log('Parsing Word document...');
        const docData = await mammoth.extractRawText({ buffer });
        extractedText = docData.value;
        extractedData = await parseDocumentData(docData.value);
        console.log('Word document parsed successfully, extracted:', Object.keys(extractedData));
      }
    } catch (parseError) {
      console.error('Error parsing document:', parseError);
      return NextResponse.json({ 
        error: 'Failed to parse document content',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      }, { status: 500 });
    }

    console.log('Document parsing completed successfully');

    // Check if we extracted meaningful data
    const hasExtractedData = Object.keys(extractedData).length > 0;
    
    if (!hasExtractedData) {
      return NextResponse.json({ 
        error: 'No real estate data could be extracted from this document',
        suggestion: 'Please ensure the document contains property information like addresses, prices, or client names'
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      extractedData,
      extractedText: extractedText.substring(0, 1000), // Limit text for response
      fieldsExtracted: Object.keys(extractedData).length,
      fileName: file.name,
      fileSize: file.size,
      parsedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Document parsing error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Enhanced parsing function for real estate documents
async function parseDocumentData(text: string) {
  const data: any = {};

  // Clean up text for better parsing
  const cleanText = text.replace(/\s+/g, ' ').trim();
  console.log('Parsing text length:', cleanText.length);

  // Extract property address with multiple patterns
  const addressPatterns = [
    // Pattern for complete address on one line: "261 S Quinsigamond Ave, Shrewsbury, MA 01545-4431"
    /(\d+\s+[a-zA-Z\s]+(?:avenue|ave\.?|street|st\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|court|ct\.?|boulevard|blvd\.?|way|place|pl\.?|circle|cir\.?)[,\s]+[a-zA-Z\s]+[,\s]+[A-Z]{2}\s+\d{5}(?:-\d{4})?)/i,
    // Pattern for MLS-style addresses that may span lines
    /(\d+\s+[a-zA-Z\s]+(?:avenue|ave\.?|street|st\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|court|ct\.?|boulevard|blvd\.?|way|place|pl\.?|circle|cir\.?))/i,
    // Property address label patterns
    /(?:property\s+address|subject\s+property|premises|property\s+location|address\s+of\s+property)[\s:,]*([^\n\r.;]+(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|court|ct\.?|boulevard|blvd\.?|way|place|pl\.?|circle|cir\.?)[^\n\r.;]*)/i,
    /address[:\s]+([^\n\r]+)/i
  ];

  for (const pattern of addressPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let address = match[1].trim();
      // Clean up common artifacts
      address = address.replace(/[,;]\s*$/, '').replace(/^\s*[,;]/, '');
      if (address.length > 10 && address.length < 200) {
        data.propertyAddress = address;
        console.log('Extracted full address:', address);
        
        // Try to split address into components
        const addressParts = parseAddressComponents(address);
        console.log('Address parsing result:', {
          originalAddress: address,
          parsedComponents: addressParts
        });
        if (addressParts.street || addressParts.city) {
          data.address = addressParts.street || address;
          data.city = addressParts.city;
          data.state = addressParts.state;
          data.zipCode = addressParts.zipCode;
          console.log('Split address into components:', addressParts);
        }
        break;
      }
    }
  }
  
  // If we didn't find a complete address, try to find street and city separately
  if (!data.propertyAddress) {
    // Look for street address first
    const streetMatch = cleanText.match(/(\d+\s+[a-zA-Z\s]+(?:avenue|ave\.?|street|st\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|court|ct\.?|boulevard|blvd\.?|way|place|pl\.?|circle|cir\.?))/i);
    if (streetMatch) {
      data.address = streetMatch[1].trim();
      console.log('Extracted street address:', data.address);
      
      // Look for city nearby (often on next line in MLS docs)
      const textAfterAddress = cleanText.substring(cleanText.indexOf(streetMatch[1]) + streetMatch[1].length);
      const cityMatch = textAfterAddress.match(/\s*([a-zA-Z\s]+),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/i);
      if (cityMatch) {
        data.city = cityMatch[1].trim();
        data.state = cityMatch[2].trim();
        data.zipCode = cityMatch[3].trim();
        data.propertyAddress = `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`;
        console.log('Found separate city/state/zip:', { city: data.city, state: data.state, zip: data.zipCode });
      }
    }
  }

  // Extract purchase/sale price with enhanced patterns
  const pricePatterns = [
    /(?:purchase\s+price|sale\s+price|selling\s+price|agreed\s+price|contract\s+price|price)[\s:]*\$?\s*([\d,]+\.?\d*)/i,
    /(?:total\s+consideration|consideration)[\s:]*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.?\d*)(?:\s*(?:dollars?|usd))?/gi
  ];

  for (const pattern of pricePatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(cleanText)) !== null) {
      const priceStr = match[1].replace(/,/g, '');
      const price = parseFloat(priceStr);
      if (price >= 50000 && price <= 50000000) { // Reasonable real estate price range
        data.price = price;
        console.log('Extracted price:', price);
        break;
      }
      if (regex.global === false) break; // Prevent infinite loop for non-global regex
    }
    if (data.price) break;
  }

  // Extract buyer information
  const buyerPatterns = [
    /(?:buyer|purchaser|grantee)[\s:,]*([a-zA-Z\s,]+?)(?:\s*(?:and|&)\s*[a-zA-Z\s,]+?)?(?:\n|$|,\s*(?:address|residing))/i,
    /(?:sold\s+to|purchased\s+by)[\s:]*([a-zA-Z\s,]+?)(?:\n|$|,)/i
  ];

  for (const pattern of buyerPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let buyer = match[1].trim();
      buyer = buyer.replace(/[,;]\s*$/, '').replace(/^\s*[,;]/, '');
      if (buyer.length > 2 && buyer.length < 100 && /^[a-zA-Z\s,.-]+$/.test(buyer)) {
        data.clientName = buyer;
        console.log('Extracted buyer:', buyer);
        break;
      }
    }
  }

  // Extract seller information
  const sellerPatterns = [
    /(?:seller|vendor|grantor)[\s:,]*([a-zA-Z\s,]+?)(?:\s*(?:and|&)\s*[a-zA-Z\s,]+?)?(?:\n|$|,\s*(?:address|residing))/i,
    /(?:sold\s+by|owned\s+by)[\s:]*([a-zA-Z\s,]+?)(?:\n|$|,)/i
  ];

  for (const pattern of sellerPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let seller = match[1].trim();
      seller = seller.replace(/[,;]\s*$/, '').replace(/^\s*[,;]/, '');
      if (seller.length > 2 && seller.length < 100 && /^[a-zA-Z\s,.-]+$/.test(seller)) {
        data.sellerName = seller;
        console.log('Extracted seller:', seller);
        break;
      }
    }
  }

  // Extract closing date
  const closingDatePatterns = [
    /(?:closing\s+date|settlement\s+date|completion\s+date|close\s+date)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/i,
    /(?:to\s+close\s+on|shall\s+close\s+on)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i
  ];

  for (const pattern of closingDatePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.closingDate = match[1];
      console.log('Extracted closing date:', match[1]);
      break;
    }
  }

  // Extract contract date
  const contractDatePatterns = [
    /(?:contract\s+date|agreement\s+date|executed\s+on|signed\s+on|dated)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/i
  ];

  for (const pattern of contractDatePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.contractDate = match[1];
      console.log('Extracted contract date:', match[1]);
      break;
    }
  }

  // Extract property type
  const propertyTypePatterns = [
    /(?:property\s+type|dwelling\s+type|type\s+of\s+property)[\s:]*([a-zA-Z\s]+?)(?:\n|$|,)/i,
    /(single[- ]family|condominium|condo|townhome|townhouse|multi[- ]family|duplex|triplex|commercial|retail|office|industrial)/i
  ];

  for (const pattern of propertyTypePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      data.propertyType = match[1].trim();
      console.log('Extracted property type:', match[1]);
      break;
    }
  }

  // Extract MLS number
  const mlsPatterns = [
    /(?:mls|listing)[\s#:]*([a-zA-Z0-9]+)/i,
    /mls[\s#]*(\d+)/i
  ];

  for (const pattern of mlsPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1].length >= 4) {
      data.mlsNumber = match[1];
      console.log('Extracted MLS:', match[1]);
      break;
    }
  }

  // Extract commission information
  const commissionPatterns = [
    /(?:commission|broker\s+fee|agent\s+commission)[\s:]*(\d+\.?\d*)%/i,
    /(?:commission|fee)[\s:]*\$?\s*([\d,]+\.?\d*)/i
  ];

  for (const pattern of commissionPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const value = match[1].replace(/,/g, '');
      const num = parseFloat(value);
      if (num > 0 && num <= 50) { // Reasonable commission percentage
        data.commissionPercent = num;
        console.log('Extracted commission:', num);
        break;
      }
    }
  }

  // Extract additional property details
  const bedroomMatch = cleanText.match(/(\d+)\s*(?:bed|bedroom)/i);
  if (bedroomMatch) {
    const bedrooms = parseInt(bedroomMatch[1]);
    if (bedrooms >= 0 && bedrooms <= 20) {
      data.bedrooms = bedrooms;
      console.log('Extracted bedrooms:', bedrooms);
    }
  }

  const bathroomMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*(?:bath|bathroom)/i);
  if (bathroomMatch) {
    const bathrooms = parseFloat(bathroomMatch[1]);
    if (bathrooms >= 0 && bathrooms <= 20) {
      data.bathrooms = bathrooms;
      console.log('Extracted bathrooms:', bathrooms);
    }
  }

  const sqftMatch = cleanText.match(/(\d{3,})\s*(?:sq\.?\s*ft\.?|square\s+feet)/i);
  if (sqftMatch) {
    const sqft = parseInt(sqftMatch[1]);
    if (sqft >= 100 && sqft <= 50000) {
      data.squareFootage = sqft;
      console.log('Extracted square footage:', sqft);
    }
  }

  // Extract lot size
  const lotSizeMatch = cleanText.match(/lot\s+size[:\s]*(\d+(?:\.\d+)?)\s*(acres?|sq\.?\s*ft\.?|square\s+feet)/i);
  if (lotSizeMatch) {
    data.lotSize = `${lotSizeMatch[1]} ${lotSizeMatch[2]}`;
    console.log('Extracted lot size:', data.lotSize);
  }

  // Extract year built
  const yearBuiltMatch = cleanText.match(/(?:year\s+built|built\s+in|construction\s+year)[:\s]*(\d{4})/i);
  if (yearBuiltMatch) {
    const year = parseInt(yearBuiltMatch[1]);
    if (year >= 1800 && year <= new Date().getFullYear()) {
      data.yearBuilt = year;
      console.log('Extracted year built:', year);
    }
  }

  // Extract listing date
  const listingDateMatch = cleanText.match(/(?:listed|listing\s+date|date\s+listed)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i);
  if (listingDateMatch) {
    data.listingDate = listingDateMatch[1];
    console.log('Extracted listing date:', data.listingDate);
  }

  console.log('Final extracted data:', data);
  return data;
}

// Helper function to parse address components
function parseAddressComponents(fullAddress: string) {
  const components = {
    street: '',
    city: '',
    state: '',
    zipCode: ''
  };

  try {
    console.log('Parsing address:', fullAddress);
    
    // Clean up the address
    let address = fullAddress.trim().replace(/\s+/g, ' ');
    
    // Pattern 1: "123 Main St, Anytown, ST 12345"
    const pattern1 = /^([^,]+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)?\s*$/i;
    const match1 = address.match(pattern1);
    
    if (match1) {
      components.street = match1[1].trim();
      components.city = match1[2].trim();
      components.state = match1[3].trim().toUpperCase();
      components.zipCode = match1[4] || '';
      console.log('Pattern 1 matched:', components);
      return components;
    }
    
    // Pattern 2: "123 Main St Anytown ST 12345"
    const pattern2 = /^(.+?)\s+([A-Za-z\s]+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)?\s*$/i;
    const match2 = address.match(pattern2);
    
    if (match2) {
      const streetPart = match2[1].trim();
      const cityPart = match2[2].trim();
      components.state = match2[3].trim().toUpperCase();
      components.zipCode = match2[4] || '';
      
      // Try to determine where street ends and city begins
      const streetWords = streetPart.split(' ');
      const cityWords = cityPart.split(' ');
      
      // Common street suffixes
      const streetSuffixes = ['st', 'street', 'ave', 'avenue', 'rd', 'road', 'dr', 'drive', 'ln', 'lane', 'ct', 'court', 'blvd', 'boulevard', 'way', 'place', 'pl', 'circle', 'cir'];
      
      let streetEndIndex = streetWords.length - 1;
      
      // Look for street suffix to determine boundary
      for (let i = streetWords.length - 1; i >= 0; i--) {
        if (streetSuffixes.includes(streetWords[i].toLowerCase().replace('.', ''))) {
          streetEndIndex = i;
          break;
        }
      }
      
      // If we found a street suffix, everything up to that is street, rest goes to city
      if (streetEndIndex < streetWords.length - 1) {
        const remainingStreetWords = streetWords.slice(streetEndIndex + 1);
        components.street = streetWords.slice(0, streetEndIndex + 1).join(' ');
        components.city = [...remainingStreetWords, ...cityWords].join(' ');
      } else {
        components.street = streetPart;
        components.city = cityPart;
      }
      
      console.log('Pattern 2 matched:', components);
      return components;
    }
    
    // Pattern 3: Just try to extract state and zip from end
    const stateZipPattern = /\b([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\s*$/i;
    const stateZipMatch = address.match(stateZipPattern);
    
    if (stateZipMatch) {
      components.state = stateZipMatch[1].toUpperCase();
      components.zipCode = stateZipMatch[2];
      
      // Remove state and zip from address
      const remaining = address.replace(stateZipPattern, '').trim();
      
      // Try to split remaining by comma
      const parts = remaining.split(',').map(p => p.trim()).filter(p => p.length > 0);
      
      if (parts.length >= 2) {
        components.street = parts[0];
        components.city = parts.slice(1).join(', ');
      } else if (parts.length === 1) {
        // Assume it's all street address
        components.street = parts[0];
      }
      
      console.log('Pattern 3 matched:', components);
      return components;
    }
    
    // Fallback: split by commas if available
    const parts = address.split(',').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length >= 1) {
      components.street = parts[0];
    }
    if (parts.length >= 2) {
      components.city = parts[1];
    }
    if (parts.length >= 3) {
      // Try to extract state from last part
      const lastPart = parts[2];
      const stateMatch = lastPart.match(/([A-Z]{2})/i);
      if (stateMatch) {
        components.state = stateMatch[1].toUpperCase();
      }
    }
    
    console.log('Fallback parsing:', components);
    
  } catch (error) {
    console.error('Error parsing address components:', error);
  }

  return components;
}
