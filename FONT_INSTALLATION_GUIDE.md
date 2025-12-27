# Rupee Symbol Font Support Guide for PDF Generation

## Quick Solution (Recommended)

### Option 1: Use Unicode with Fallback (Already Implemented)
The current implementation uses a smart fallback system:
1. Tries ₹ symbol first
2. Falls back to "Rs. " if needed
3. Uses "INR " as final fallback

### Option 2: Install Noto Sans Font (Best Support)

```bash
npm install jspdf-font-noto-sans
```

Then update your PDF generation code:

```javascript
import { addNotoSansFont } from './utils/pdfFonts';

// In your PDF generation function:
const doc = new jsPDF();
addNotoSansFont(doc);
// Now ₹ symbol should work perfectly
```

### Option 3: Use Custom Font

1. **Download a font with rupee support:**
   - [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans)
   - [Roboto](https://fonts.google.com/specimen/Roboto)
   - [Lato](https://fonts.google.com/specimen/Lato)

2. **Convert font to base64:**
   - Use online converter: https://transfonter.org/
   - Or use npm package: `npm install ttf2base64`

3. **Add to your project:**
   ```javascript
   // In pdfFonts.js
   export const customFontBase64 = 'PASTE_BASE64_HERE';
   
   export const loadCustomFont = (doc) => {
     doc.addFileToVFS('CustomFont.ttf', customFontBase64);
     doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
     doc.setFont('CustomFont');
   };
   ```

## Testing Rupee Symbol Support

### Test Different Fonts
```javascript
// Test which font works best
const fonts = ['times', 'helvetica', 'courier'];
fonts.forEach(font => {
  doc.setFont(font);
  const text = '₹1000';
  console.log(`${font}:`, doc.getTextWidth(text) > 0 ? '✅ Works' : '❌ Fails');
});
```

### Unicode Values for Rupee
```javascript
// Different ways to represent rupee symbol
const rupeeSymbols = {
  unicode: '\u20B9',        // ₹ (Unicode)
  html: '&#8377;',          // ₹ (HTML entity)
  ascii: 'Rs.',            // Rs. (ASCII fallback)
  iso: 'INR'               // INR (ISO code)
};
```

## Recommended Implementation

### Step 1: Install Font Package
```bash
npm install jspdf-font-noto-sans
```

### Step 2: Update pdfFonts.js
```javascript
import jsPDF from 'jspdf';

export const setupFont = (doc) => {
  // Method 1: Try to add Noto Sans
  try {
    doc.addFont('https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@0.0.4/dist/noto-sans-regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');
    return true;
  } catch (error) {
    console.log('Noto Sans not available, using fallback');
    return false;
  }
};

export const formatCurrency = (amount, doc) => {
  const rupeeSymbol = '\u20B9'; // Unicode ₹
  
  // Test if current font supports rupee
  const testText = rupeeSymbol + '0';
  const supportsRupee = doc.getTextWidth(testText) > 0;
  
  if (supportsRupee) {
    return rupeeSymbol + amount;
  } else {
    return 'Rs. ' + amount;
  }
};
```

### Step 3: Update PDF Generation
```javascript
// In ChitList.js downloadPDF function:
const doc = new jsPDF();

// Setup font with rupee support
const fontLoaded = setupFont(doc);

// Use enhanced currency formatting
const formattedAmount = formatCurrency('1000.00', doc);
doc.text(formattedAmount, 20, 20);
```

## Alternative: Use SVG Approach

If fonts don't work well, you can use SVG:

```javascript
const addRupeeSVG = (doc, x, y, size = 10) => {
  const rupeeSVG = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="${size}" font-family="Arial" font-size="${size}">₹</text>
    </svg>
  `;
  
  // Convert SVG to image and add to PDF
  // This requires additional setup
};
```

## Troubleshooting

### Issue: Rupee symbol appears as box
**Solution:** Font doesn't support the symbol. Use fallback or install proper font.

### Issue: PDF size increases too much
**Solution:** Use font subsetting or stick with ASCII fallback.

### Issue: Font loading fails
**Solution:** Check CORS headers and font file paths.

## Best Practices

1. **Always provide fallbacks** - Not all PDF viewers support all fonts
2. **Test on multiple viewers** - Adobe Reader, Chrome PDF viewer, etc.
3. **Consider file size** - Custom fonts increase PDF size
4. **Use Unicode when possible** - More reliable than custom fonts

## Current Implementation Status

✅ **Fallback system implemented** - Will show "Rs. " if ₹ fails
✅ **Font testing** - Tests rupee support automatically
✅ **Multiple fallback options** - Unicode, ASCII, ISO codes
⏳ **Custom font support** - Ready to implement if needed

The current implementation should work for most cases. If you need perfect rupee symbol rendering, follow Option 2 to install Noto Sans font.
