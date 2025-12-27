// PDF Font utilities for rupee symbol support
import jsPDF from 'jspdf';

// Method 1: Using Noto Sans (recommended)
export const addNotoSansFont = (doc) => {
  // Add Noto Sans font which supports rupee symbol
  doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');
};

// Method 2: Using built-in fonts with rupee fallback
export const formatCurrencyWithRupee = (amount, doc) => {
  const rupeeSymbol = String.fromCharCode(8377); // Unicode for ₹
  
  // Try different approaches for rupee symbol
  const methods = [
    () => rupeeSymbol + amount, // Direct Unicode
    () => 'Rs. ' + amount,     // Fallback 1
    () => 'INR ' + amount,     // Fallback 2
    () => '₹' + amount         // Direct symbol
  ];
  
  // Test which method works with current font
  for (const method of methods) {
    try {
      const text = method();
      const textWidth = doc.getTextWidth(text);
      if (textWidth > 0) {
        return text;
      }
    } catch (error) {
      continue;
    }
  }
  
  return 'Rs. ' + amount; // Ultimate fallback
};

// Method 3: Load custom font from base64
export const loadCustomFontWithRupee = async (doc) => {
  // You would need to convert a font file to base64
  // This is a placeholder for the implementation
  const fontBase64 = 'BASE64_ENCODED_FONT_STRING';
  
  try {
    doc.addFileToVFS('customFont.ttf', fontBase64);
    doc.addFont('customFont.ttf', 'CustomFont', 'normal');
    doc.setFont('CustomFont');
    return true;
  } catch (error) {
    console.error('Failed to load custom font:', error);
    return false;
  }
};

// Method 4: Use font-face in CSS and export to PDF
export const createPDFFontConfig = () => {
  return {
    helvetica: '₹', // Test if helvetica supports rupee
    times: '₹',     // Test if times supports rupee
    courier: '₹'     // Test if courier supports rupee
  };
};

// Utility to test font support
export const testRupeeSupport = (doc, fontName = 'times') => {
  doc.setFont(fontName);
  const rupeeText = '₹1000';
  const textWidth = doc.getTextWidth(rupeeText);
  return textWidth > 0;
};
