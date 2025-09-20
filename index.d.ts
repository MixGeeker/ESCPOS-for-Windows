export interface PrinterInfo {
  name: string;
  description: string;
  isDefault: boolean;
}

export type Charset = 'ASCII' | 'GBK';

export interface BarcodeOptions {
  width?: number; // default 3
  height?: number; // default 64
  font?: number; // default 0
  position?: number; // default 2
}

export type BarcodeType = 'UPC_A' | 'UPC_E' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'CODABAR';

export interface QROptions {
  size?: number; // 1-16, default 8
  errorLevel?: number; // 48-51, default 49
}

export interface ImageOptions {
  width?: number; // pixels, default 384
  threshold?: number; // 0-255, default 128
  dither?: boolean; // default true
}

export interface Commands {
  INIT: Buffer;
  CUT: Buffer;
  BOLD_ON: Buffer;
  BOLD_OFF: Buffer;
  ALIGN_LEFT: Buffer;
  ALIGN_CENTER: Buffer;
  ALIGN_RIGHT: Buffer;
  FONT_A: Buffer;
  FONT_B: Buffer;
  TEXT_SIZE: (width?: number, height?: number) => Buffer;
  readonly TEXT_NORMAL: Buffer;
  readonly TEXT_DOUBLE_HEIGHT: Buffer;
  readonly TEXT_DOUBLE_WIDTH: Buffer;
  readonly TEXT_DOUBLE_SIZE: Buffer;
  LF: Buffer;
  ASCII_MODE: Buffer;
  CHINESE_MODE: Buffer;
  ENCODING_GBK: Buffer;
  ENCODING_ASCII: Buffer;
  BARCODE_HEIGHT: (height: number) => Buffer;
  BARCODE_WIDTH: (width: number) => Buffer;
  BARCODE_FONT: (font: number) => Buffer;
  BARCODE_POSITION: (position: number) => Buffer;
  BARCODE_TYPE: {
    UPC_A: Buffer;
    UPC_E: Buffer;
    EAN13: Buffer;
    EAN8: Buffer;
    CODE39: Buffer;
    ITF: Buffer;
    CODABAR: Buffer;
  };
  QR_SIZE: (size: number) => Buffer;
  QR_ERROR_LEVEL: (level: number) => Buffer;
  QR_STORE_DATA: (data: string | Buffer) => Buffer;
  QR_PRINT: Buffer;
}

export interface ImageCommands {
  S8_HIGH_DENSITY: Buffer;
  LINE_SPACING: (n: number) => Buffer;
}

declare class ESCPOSPrinter {
  constructor(printerName: string);

  static getPrinterList(): PrinterInfo[];

  print(data: Buffer | string | Uint8Array): boolean;
  close(): void;

  textToBuffer(text: string, charset?: Charset): Buffer;

  printChinese(text: string): boolean;
  printAscii(text: string): boolean;

  setFontA(): boolean;
  setFontB(): boolean;

  setTextSize(width?: number, height?: number): boolean;
  setTextNormal(): boolean;
  setTextDoubleHeight(): boolean;
  setTextDoubleWidth(): boolean;
  setTextDoubleSize(): boolean;

  printBarcode(data: string, type?: BarcodeType, options?: BarcodeOptions): boolean;
  printQRCode(data: string, options?: QROptions): boolean;

  processImage(imagePath: string, options?: ImageOptions): Promise<Buffer>;
  printImage(imagePath: string, options?: ImageOptions): Promise<boolean>;

  static commands: Commands;
  static imageCommands: ImageCommands;
}

export default ESCPOSPrinter;
export { ESCPOSPrinter };
