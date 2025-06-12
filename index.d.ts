declare module '@mixgeeker/node-escpos-win' {
  export = ESCPOSPrinter;
}

/**
 * Options for image processing
 */
interface ImageProcessingOptions {
  /** Default print width (384 for 58mm thermal paper) */
  width?: number;
  /** Black and white conversion threshold (0-255) */
  threshold?: number;
  /** Whether to use Floyd-Steinberg dithering algorithm */
  dither?: boolean;
}

/**
 * Options for barcode printing
 */
interface BarcodeOptions {
  /** Barcode width (1-6) */
  width?: number;
  /** Barcode height in dots */
  height?: number;
  /** HRI character font (0-4) */
  font?: number;
  /** HRI character position (0-3) */
  position?: number;
}

/**
 * Options for QR code printing
 */
interface QRCodeOptions {
  /** QR code size (1-16) */
  size?: number;
  /** Error correction level (48-51) */
  errorLevel?: number;
}

/**
 * Supported barcode types
 */
type BarcodeType = 'UPC_A' | 'UPC_E' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'CODABAR';

/**
 * Supported character sets
 */
type CharacterSet = 'ASCII' | 'GBK';

/**
 * Native printer binding interface
 */
interface NativePrinter {
  print(data: Buffer): boolean;
  close(): void;
}

/**
 * Static methods for native printer binding
 */
interface NativePrinterConstructor {
  new(printerName: string): NativePrinter;
  getPrinterList(): string[];
}

/**
 * ESC/POS Commands interface
 */
interface ESCPOSCommands {
  // Printer control
  readonly INIT: Buffer;
  readonly CUT: Buffer;
  readonly LF: Buffer;

  // Text formatting
  readonly BOLD_ON: Buffer;
  readonly BOLD_OFF: Buffer;

  // Text alignment
  readonly ALIGN_LEFT: Buffer;
  readonly ALIGN_CENTER: Buffer;
  readonly ALIGN_RIGHT: Buffer;

  // Font selection
  readonly FONT_A: Buffer;
  readonly FONT_B: Buffer;

  // Text size (dynamic function)
  TEXT_SIZE(width?: number, height?: number): Buffer;

  // Text size presets (getters)
  readonly TEXT_NORMAL: Buffer;
  readonly TEXT_DOUBLE_HEIGHT: Buffer;
  readonly TEXT_DOUBLE_WIDTH: Buffer;
  readonly TEXT_DOUBLE_SIZE: Buffer;

  // Character set modes
  readonly ASCII_MODE: Buffer;
  readonly CHINESE_MODE: Buffer;
  readonly ENCODING_GBK: Buffer;
  readonly ENCODING_ASCII: Buffer;

  // Barcode commands
  BARCODE_HEIGHT(height: number): Buffer;
  BARCODE_WIDTH(width: number): Buffer;
  BARCODE_FONT(font: number): Buffer;
  BARCODE_POSITION(position: number): Buffer;

  // Barcode types
  readonly BARCODE_TYPE: {
    readonly UPC_A: Buffer;
    readonly UPC_E: Buffer;
    readonly EAN13: Buffer;
    readonly EAN8: Buffer;
    readonly CODE39: Buffer;
    readonly ITF: Buffer;
    readonly CODABAR: Buffer;
  };

  // QR code commands
  QR_SIZE(size: number): Buffer;
  QR_ERROR_LEVEL(level: number): Buffer;
  QR_STORE_DATA(data: string): Buffer;
  readonly QR_PRINT: Buffer;
}

/**
 * Image processing commands interface
 */
interface ImageCommands {
  readonly S8_HIGH_DENSITY: Buffer;
  LINE_SPACING(n: number): Buffer;
}

/**
 * Main ESC/POS Printer class for Windows
 */
declare class ESCPOSPrinter {
  /**
   * Creates a new ESC/POS printer instance
   * @param printerName The name of the Windows printer
   */
  constructor(printerName: string);

  /**
   * Get list of available printers on the system
   * @returns Array of printer names
   */
  static getPrinterList(): string[];

  /**
   * ESC/POS command constants
   */
  static readonly commands: ESCPOSCommands;

  /**
   * Image processing command constants  
   */
  static readonly imageCommands: ImageCommands;

  /**
   * Print raw data to the printer
   * @param data Buffer or string data to print
   * @returns Success status
   */
  print(data: Buffer | string): boolean;

  /**
   * Convert text to buffer with specified encoding
   * @param text Text to convert
   * @param charset Character set to use (default: 'ASCII')
   * @returns Encoded buffer
   */
  textToBuffer(text: string, charset?: CharacterSet): Buffer;

  /**
   * Print Chinese text with proper encoding
   * @param text Chinese text to print
   * @returns Success status
   */
  printChinese(text: string): boolean;

  /**
   * Print ASCII text
   * @param text ASCII text to print  
   * @returns Success status
   */
  printAscii(text: string): boolean;

  /**
   * Close the printer connection
   */
  close(): void;

  // Font methods
  /**
   * Set font type A (standard font)
   * @returns Success status
   */
  setFontA(): boolean;

  /**
   * Set font type B (compressed font)
   * @returns Success status
   */
  setFontB(): boolean;

  // Text size methods
  /**
   * Set custom text size
   * @param width Width multiplier (0-7)
   * @param height Height multiplier (0-7)
   * @returns Success status
   */
  setTextSize(width?: number, height?: number): boolean;

  /**
   * Set normal text size
   * @returns Success status
   */
  setTextNormal(): boolean;

  /**
   * Set double height text
   * @returns Success status
   */
  setTextDoubleHeight(): boolean;

  /**
   * Set double width text
   * @returns Success status
   */
  setTextDoubleWidth(): boolean;

  /**
   * Set double size text (both width and height)
   * @returns Success status
   */
  setTextDoubleSize(): boolean;

  // Barcode methods
  /**
   * Print barcode
   * @param data Barcode data
   * @param type Barcode type (default: 'EAN13')
   * @param options Barcode formatting options
   * @returns Success status
   */
  printBarcode(data: string, type?: BarcodeType, options?: BarcodeOptions): boolean;

  // QR code methods
  /**
   * Print QR code
   * @param data QR code data
   * @param options QR code formatting options
   * @returns Success status
   */
  printQRCode(data: string, options?: QRCodeOptions): boolean;

  // Image processing methods
  /**
   * Process image for printing
   * @param imagePath Path to image file
   * @param options Image processing options
   * @returns Promise resolving to print-ready buffer
   */
  processImage(imagePath: string, options?: ImageProcessingOptions): Promise<Buffer>;

  /**
   * Print image from file
   * @param imagePath Path to image file
   * @param options Image processing options
   * @returns Promise resolving to success status
   */
  printImage(imagePath: string, options?: ImageProcessingOptions): Promise<boolean>;

  // Private properties (for completeness)
  private printer: NativePrinter;
  private currentCharset: CharacterSet;
}

export = ESCPOSPrinter;