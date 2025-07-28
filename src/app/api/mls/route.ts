import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mls = searchParams.get('mls') || '1773438'; // Default from your example
    
    const url = new URL('https://zillow-com1.p.rapidapi.com/propertyByMls');
    url.searchParams.append('mls', mls);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '352c94980bmshbd6ad88086f2284p11e019jsnf5d0ce1ee557',
        'x-rapidapi-host': process.env.RAPIDAPI_HOST || 'zillow-com1.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zillow API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      data,
      mls,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MLS API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch MLS data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mls } = body;
    
    console.log('=== MLS API POST REQUEST ===');
    console.log('Received MLS:', mls);
    console.log('Request body:', body);

    if (!mls) {
      return NextResponse.json({ error: 'MLS number is required' }, { status: 400 });
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY || '352c94980bmshbd6ad88086f2284p11e019jsnf5d0ce1ee557';
    const rapidApiHost = process.env.RAPIDAPI_HOST || 'zillow-com1.p.rapidapi.com';

    // Step 1: Get ZPID from MLS number
    console.log('=== STEP 1: GETTING ZPID FROM MLS ===');
    const mlsUrl = new URL('https://zillow-com1.p.rapidapi.com/propertyByMls');
    mlsUrl.searchParams.append('mls', mls);
    
    console.log(`MLS URL: ${mlsUrl.toString()}`);

    const mlsResponse = await fetch(mlsUrl.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost,
      },
    });

    console.log(`MLS Response status: ${mlsResponse.status}`);

    if (!mlsResponse.ok) {
      const errorText = await mlsResponse.text();
      console.error(`MLS API error: ${mlsResponse.status} - ${errorText}`);
      return NextResponse.json({ error: 'Failed to fetch MLS data' }, { status: mlsResponse.status });
    }

    const mlsData = await mlsResponse.json();
    console.log('=== MLS API RESPONSE ===');
    console.log('MLS data structure:', JSON.stringify(mlsData, null, 2));

    if (!mlsData.zpid) {
      console.error('No ZPID found in MLS response');
      return NextResponse.json({ error: 'Property not found for this MLS number' }, { status: 404 });
    }

    const zpid = mlsData.zpid;
    console.log(`Retrieved ZPID: ${zpid}`);

    // Step 2: Get full property details using ZPID
    console.log('=== STEP 2: GETTING FULL PROPERTY DETAILS ===');
    const propertyUrl = new URL('https://zillow-com1.p.rapidapi.com/property');
    propertyUrl.searchParams.append('zpid', zpid.toString());
    
    console.log(`Property URL: ${propertyUrl.toString()}`);

    const propertyResponse = await fetch(propertyUrl.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost,
      },
    });

    console.log(`Property Response status: ${propertyResponse.status}`);

    if (!propertyResponse.ok) {
      const errorText = await propertyResponse.text();
      console.error(`Property API error: ${propertyResponse.status} - ${errorText}`);
      return NextResponse.json({ error: 'Failed to fetch property details' }, { status: propertyResponse.status });
    }

    const data = await propertyResponse.json();
    console.log('=== FULL PROPERTY API RESPONSE ===');
    console.log('Full property data structure:', JSON.stringify(data, null, 2));
    console.log('=== END FULL PROPERTY RESPONSE ===');
    
    // Transform property data to transaction format
    const transformedData = {
      propertyAddress: data.address?.streetAddress || data.streetAddress || `Property (MLS: ${mls})`,
      city: data.address?.city || data.city || '',
      state: data.address?.state || data.state || '',
      zipCode: data.address?.zipcode || data.zipcode || '',
      price: data.price || data.zestimate || data.rentZestimate || 0,
      propertyType: data.propertyTypeDimension || data.propertyType || data.homeType || 'Single Family - Detached',
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      sqft: data.livingArea || data.lotAreaValue || 0,
      yearBuilt: data.yearBuilt || null,
      lotSize: data.lotAreaValue || null,
      mlsNumber: mls,
      
      // Additional fields requested
      book: '', // Not typically available from Zillow API
      page: '', // Not typically available from Zillow API
      county: data.county || data.resoFacts?.cityRegion || '',
      heatZones: Array.isArray(data.resoFacts?.heating) ? data.resoFacts.heating.join(', ') : 
                 Array.isArray(data.heating) ? data.heating.join(', ') : '',
      hotWater: '', // Not typically available from Zillow API
      sewerUtilities: Array.isArray(data.resoFacts?.sewer) ? data.resoFacts.sewer.join(', ') : data.resoFacts?.sewer || '',
      features: [
        ...(Array.isArray(data.resoFacts?.exteriorFeatures) ? data.resoFacts.exteriorFeatures : []),
        ...(Array.isArray(data.resoFacts?.interiorFeatures) ? data.resoFacts.interiorFeatures : []),
        ...(Array.isArray(data.resoFacts?.flooring) ? data.resoFacts.flooring : [])
      ].filter(Boolean).join(', ') || '',
      approxLivingAreaTotal: data.livingArea || data.resoFacts?.livingArea || '',
      gradeSchool: data.schools?.find((s: any) => s.level === 'Primary' || s.level === 'Elementary')?.name || '',
      middleSchool: data.schools?.find((s: any) => s.level === 'Middle')?.name || '',
      highSchool: data.schools?.find((s: any) => s.level === 'High')?.name || '',
      disclosures: '', // Not typically available from Zillow API
      assessed: data.resoFacts?.taxAssessedValue || '',
      tax: data.resoFacts?.taxAnnualAmount || data.taxHistory?.[0]?.taxPaid || '',
      listPrice: data.price || data.zestimate || '',
      
      propertyData: {
        mlsId: data.mlsid || mls,
        zpid: data.zpid || zpid,
        address: data.address,
        price: data.price,
        zestimate: data.zestimate,
        rentZestimate: data.rentZestimate,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        livingArea: data.livingArea,
        propertyType: data.propertyType,
        homeType: data.homeType,
        yearBuilt: data.yearBuilt,
        lotAreaValue: data.lotAreaValue,
        photos: data.photos,
        // Add more fields from the response
        ...data
      },
      description: `Property at ${data.address?.streetAddress || data.streetAddress || 'unknown address'} (MLS: ${mls}) - Price: $${data.price?.toLocaleString() || data.zestimate?.toLocaleString() || 'N/A'}`,
      mlsData: JSON.stringify(data), // Store complete response
    };
    
    return NextResponse.json({ 
      success: true, 
      data: transformedData,
      rawData: data,
      mls,
      zpid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MLS Property Data Search Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch property data by MLS',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
