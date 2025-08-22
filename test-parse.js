const fs = require('fs');
const pdfParse = require('pdf-parse');

async function testParse() {
  try {
    const pdfBuffer = fs.readFileSync('uploads/1754062937910_MLS_test_1.pdf');
    const data = await pdfParse(pdfBuffer);
    
    console.log('=== PDF TEXT CONTENT ===');
    console.log('Text length:', data.text.length);
    console.log('First 1000 characters:');
    console.log(data.text.substring(0, 1000));
    
    console.log('\n=== SEARCHING FOR SHREWSBURY ===');
    const shrewsburyMatches = data.text.match(/shrewsbury/gi);
    console.log('Shrewsbury matches:', shrewsburyMatches);
    
    console.log('\n=== FULL TEXT SEARCH FOR ADDRESS WITH CITY ===');
    const lines = data.text.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('261') || line.includes('Shrewsbury')) {
        console.log(`Line ${i}: "${line}"`);
      }
    });
    
    console.log('\n=== SEARCHING FOR COMPLETE ADDRESS ===');
    const addressWithCityPattern = /261[^.\n]*Shrewsbury[^.\n]*/gi;
    const fullAddressMatches = data.text.match(addressWithCityPattern);
    console.log('Full address matches:', fullAddressMatches);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testParse();
