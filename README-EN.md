# node-escpos-win

An ESC/POS printer driver for Windows systems, implemented with Node.js and C++. Supports mixed Chinese and English printing with automatic encoding conversion.

## Features

- Mixed Chinese and English text printing
- Automatic Chinese encoding handling (GBK)
- Support for common ESC/POS commands
- Text styling (bold, alignment, size, etc.)
- **Complete TypeScript support** with type safety and IDE intellisense
- Image printing and QR code/barcode printing
- Windows-only support

## Installation

```bash
npm install @mixgeeker/node-escpos-win
```

## System Requirements

- Windows Operating System
- Node.js 14.0.0 or higher
- Windows SDK (for C++ compilation)
- Visual Studio Build Tools (for C++ compilation)

## Basic Usage

```javascript
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');

// Create printer instance with printer name
const printer = new ESCPOSPrinter('Your Printer Name');

// Method 1: Print Chinese and English separately
printer.printAscii('Hello World'); // Print English
printer.printChinese('你好，世界'); // Print Chinese

// Method 2: Mixed Chinese and English printing
const printData = Buffer.concat([
    ESCPOSPrinter.commands.INIT,
    ESCPOSPrinter.commands.ALIGN_CENTER,
    
    // English section
    ESCPOSPrinter.commands.ASCII_MODE,
    Buffer.from('Hello World\\n'),
    
    // Chinese section
    ESCPOSPrinter.commands.CHINESE_MODE,
    printer.textToBuffer('你好，世界\\n', 'GBK'),
    
    ESCPOSPrinter.commands.CUT
]);

printer.print(printData);

// Finally close the printer connection
printer.close();
```

## TypeScript Usage

This library provides complete TypeScript type definitions, supporting type safety and IDE intellisense.

```typescript
import ESCPOSPrinter from '@mixgeeker/node-escpos-win';

// Create printer instance with full TypeScript support
const printer = new ESCPOSPrinter('Your Printer Name');

// All methods have type definitions, IDE provides smart completion
printer.printChinese('你好，世界');
printer.printAscii('Hello World');

// Image printing with complete option type definitions
printer.printImage('path/to/image.jpg', {
  width: 384,
  threshold: 128,
  dither: true
}).then((success) => {
  console.log('Image print result:', success);
});

// Base64 image printing
const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
printer.printImageFromBase64(base64Image, {
  width: 384,
  threshold: 128,
  dither: true
}).then((success) => {
  console.log('Base64 image print result:', success);
});

// Barcode printing
printer.printBarcode('1234567890', 'EAN13', {
  width: 3,
  height: 64,
  position: 2
});

// QR code printing
printer.printQRCode('https://example.com', {
  size: 8,
  errorLevel: 49
});

printer.close();
```

### TypeScript Advantages

- **Type Safety**: Compile-time type checking prevents runtime errors
- **IDE Intellisense**: Complete code completion and parameter hints
- **Better Development Experience**: Support for refactoring, go-to-definition, and other modern IDE features
- **Integrated Documentation**: Type definitions serve as the best API documentation

## Supported ESC/POS Commands

### Initialization
- `ESCPOSPrinter.commands.INIT`: Initialize printer

### Paper Cutting
- `ESCPOSPrinter.commands.CUT`: Cut paper

### Character Sets
- `ESCPOSPrinter.commands.ASCII_MODE`: Switch to ASCII mode
- `ESCPOSPrinter.commands.CHINESE_MODE`: Switch to Chinese mode

### Text Styling
- `ESCPOSPrinter.commands.BOLD_ON`: Enable bold
- `ESCPOSPrinter.commands.BOLD_OFF`: Disable bold

### Text Alignment
- `ESCPOSPrinter.commands.ALIGN_LEFT`: Left alignment
- `ESCPOSPrinter.commands.ALIGN_CENTER`: Center alignment
- `ESCPOSPrinter.commands.ALIGN_RIGHT`: Right alignment

### Font Size
- `ESCPOSPrinter.commands.TEXT_NORMAL`: Normal size
- `ESCPOSPrinter.commands.TEXT_DOUBLE_HEIGHT`: Double height
- `ESCPOSPrinter.commands.TEXT_DOUBLE_WIDTH`: Double width
- `ESCPOSPrinter.commands.TEXT_DOUBLE_SIZE`: Double size

### Font Types
- `ESCPOSPrinter.commands.FONT_A`: Standard font
- `ESCPOSPrinter.commands.FONT_B`: Compressed font

### Other Commands
- `ESCPOSPrinter.commands.LF`: Line feed

## API Reference

### Class: ESCPOSPrinter

#### Constructor
```typescript
new ESCPOSPrinter(printerName: string)
```

#### Static Methods
- `ESCPOSPrinter.getPrinterList(): string[]`: Get list of available system printers

#### Instance Methods

##### Basic Printing
- `print(data: Buffer | string): boolean`: Print raw data
- `printChinese(text: string): boolean`: Print Chinese text
- `printAscii(text: string): boolean`: Print ASCII text
- `textToBuffer(text: string, charset?: 'ASCII' | 'GBK'): Buffer`: Convert text to encoded buffer
- `close(): void`: Close printer connection

##### Font and Text Formatting
- `setFontA(): boolean`: Set font type A (standard)
- `setFontB(): boolean`: Set font type B (compressed)
- `setTextSize(width?: number, height?: number): boolean`: Set custom text size
- `setTextNormal(): boolean`: Set normal text size
- `setTextDoubleHeight(): boolean`: Set double height text
- `setTextDoubleWidth(): boolean`: Set double width text
- `setTextDoubleSize(): boolean`: Set double size text

##### Barcode Printing
```typescript
printBarcode(
  data: string, 
  type?: 'UPC_A' | 'UPC_E' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'CODABAR', 
  options?: {
    width?: number;    // Barcode width (1-6)
    height?: number;   // Barcode height in dots
    font?: number;     // HRI character font (0-4)
    position?: number; // HRI character position (0-3)
  }
): boolean
```

##### QR Code Printing
```typescript
printQRCode(
  data: string, 
  options?: {
    size?: number;       // QR code size (1-16)
    errorLevel?: number; // Error correction level (48-51)
  }
): boolean
```

##### Image Printing
```typescript
processImage(
  imagePath: string, 
  options?: {
    width?: number;      // Print width (default 384 for 58mm paper)
    threshold?: number;  // B&W conversion threshold (0-255)
    dither?: boolean;    // Use Floyd-Steinberg dithering
  }
): Promise<Buffer>

printImage(
  imagePath: string, 
  options?: ImageProcessingOptions
): Promise<boolean>

processImageFromBase64(
  base64Data: string, 
  options?: ImageProcessingOptions
): Promise<Buffer>

printImageFromBase64(
  base64Data: string, 
  options?: ImageProcessingOptions
): Promise<boolean>
```

## Advanced Usage Examples

### Receipt Printing
```typescript
import ESCPOSPrinter from '@mixgeeker/node-escpos-win';

const printer = new ESCPOSPrinter('Your Receipt Printer');

// Print receipt header
const receiptData = Buffer.concat([
    ESCPOSPrinter.commands.INIT,
    ESCPOSPrinter.commands.ALIGN_CENTER,
    ESCPOSPrinter.commands.TEXT_DOUBLE_SIZE,
    printer.textToBuffer('RECEIPT\\n', 'ASCII'),
    
    ESCPOSPrinter.commands.TEXT_NORMAL,
    ESCPOSPrinter.commands.ALIGN_LEFT,
    printer.textToBuffer('Date: 2024-01-01\\n', 'ASCII'),
    printer.textToBuffer('Order: #12345\\n', 'ASCII'),
    
    ESCPOSPrinter.commands.LF,
    printer.textToBuffer('Items:\\n', 'ASCII'),
    printer.textToBuffer('Coffee x2 .......... $6.00\\n', 'ASCII'),
    printer.textToBuffer('Sandwich x1 ........ $4.50\\n', 'ASCII'),
    
    ESCPOSPrinter.commands.LF,
    ESCPOSPrinter.commands.BOLD_ON,
    printer.textToBuffer('Total: $10.50\\n', 'ASCII'),
    ESCPOSPrinter.commands.BOLD_OFF,
    
    ESCPOSPrinter.commands.LF,
    ESCPOSPrinter.commands.ALIGN_CENTER,
    printer.textToBuffer('Thank you!\\n', 'ASCII'),
    
    ESCPOSPrinter.commands.LF,
    ESCPOSPrinter.commands.CUT
]);

printer.print(receiptData);
printer.close();
```

### QR Code with Logo
```typescript
// Print QR code with company info
await printer.printQRCode('https://company.com/order/12345', {
    size: 8,
    errorLevel: 49
});

printer.print(ESCPOSPrinter.commands.LF);
printer.printAscii('Scan for order details');
```

## Notes

1. Ensure the printer is properly installed and visible in the Windows system
2. Running the Node.js application with administrator privileges may provide better printer access
3. Some ESC/POS commands may need adjustment based on specific printer models
4. Chinese printing uses GBK encoding, ensure text content contains valid Chinese characters
5. The library automatically skips building on non-Windows platforms to prevent installation errors

## Getting Printer Names

You can get installed printer names in Windows PowerShell with:

```powershell
Get-Printer | Select-Object Name
```

Or programmatically:
```javascript
const printers = ESCPOSPrinter.getPrinterList();
console.log('Available printers:', printers);
```

## Troubleshooting

### Common Issues

1. **Printer not found**: Ensure the printer name matches exactly with the system printer name
2. **Chinese characters not printing**: Verify the printer supports GBK encoding
3. **Build errors on macOS/Linux**: The install script now automatically skips building on non-Windows platforms
4. **Permission errors**: Try running with administrator privileges

### Debug Mode

```javascript
// Enable detailed error logging
const printer = new ESCPOSPrinter('Your Printer Name');
try {
    const result = printer.printChinese('测试');
    console.log('Print result:', result);
} catch (error) {
    console.error('Print error:', error.message);
}
```

## License

MIT

## Issues and Support

If you encounter any issues, please report them on GitHub Issues.

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing patterns
- TypeScript types are updated for new features
- Documentation is updated in both Chinese and English
- Tests pass on Windows systems