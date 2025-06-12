let Printer;
try {
    if (process.platform === 'win32') {
        Printer = require('bindings')('escpos_printer').Printer;
    } else {
        throw new Error('This package only works on Windows platforms');
    }
} catch (error) {
    if (process.platform !== 'win32') {
        console.warn('Warning: @mixgeeker/node-escpos-win only works on Windows platforms. Native printer functionality will not be available.');
        Printer = null;
    } else {
        throw error;
    }
}

const iconv = require('iconv-lite');
const Jimp = require('jimp');

class ESCPOSPrinter {
    constructor(printerName) {
        if (!Printer) {
            throw new Error('ESCPOSPrinter is only supported on Windows platforms');
        }
        this.printer = new Printer(printerName);
        this.currentCharset = 'ASCII'; // 默认ASCII字符集
    }

    // 获取系统打印机列表
    static getPrinterList() {
        if (!Printer) {
            throw new Error('getPrinterList is only supported on Windows platforms');
        }
        return Printer.getPrinterList();
    }

    print(data) {
        if (!(data instanceof Buffer)) {
            data = Buffer.from(data);
        }
        return this.printer.print(data);
    }

    // 转换文本为指定编码的Buffer
    textToBuffer(text, charset = 'ASCII') {
        if (charset === 'GBK') {
            return iconv.encode(text, 'GBK');
        }
        return Buffer.from(text);
    }

    // 打印中文文本
    printChinese(text) {
        const data = Buffer.concat([
            ESCPOSPrinter.commands.CHINESE_MODE,
            this.textToBuffer(text, 'GBK')
        ]);
        return this.print(data);
    }

    // 打印英文文本
    printAscii(text) {
        const data = Buffer.concat([
            ESCPOSPrinter.commands.ASCII_MODE,
            this.textToBuffer(text, 'ASCII')
        ]);
        return this.print(data);
    }

    close() {
        return this.printer.close();
    }

    // 字体类型选择方法
    setFontA() {
        return this.print(ESCPOSPrinter.commands.FONT_A);
    }

    setFontB() {
        return this.print(ESCPOSPrinter.commands.FONT_B);
    }

    // 设置文本大小的方法
    setTextSize(width = 0, height = 0) {
        return this.print(ESCPOSPrinter.commands.TEXT_SIZE(width, height));
    }

    // 设置一些常用的文本大小预设
    setTextNormal() {
        return this.setTextSize(0, 0);
    }

    setTextDoubleHeight() {
        return this.setTextSize(0, 1);
    }

    setTextDoubleWidth() {
        return this.setTextSize(1, 0);
    }

    setTextDoubleSize() {
        return this.setTextSize(1, 1);
    }

    // ESC/POS 命令生成器
    static commands = {
        // 打印机初始化
        INIT: Buffer.from([0x1B, 0x40]),

        // 切纸
        CUT: Buffer.from([0x1D, 0x56, 0x41, 0x00]),

        // 字体加粗
        BOLD_ON: Buffer.from([0x1B, 0x45, 0x01]),
        BOLD_OFF: Buffer.from([0x1B, 0x45, 0x00]),

        // 对齐方式
        ALIGN_LEFT: Buffer.from([0x1B, 0x61, 0x00]),
        ALIGN_CENTER: Buffer.from([0x1B, 0x61, 0x01]),
        ALIGN_RIGHT: Buffer.from([0x1B, 0x61, 0x02]),

        // 字体类型
        FONT_A: Buffer.from([0x1B, 0x4D, 0x00]),  // 标准字体
        FONT_B: Buffer.from([0x1B, 0x4D, 0x01]),  // 压缩字体

        // 字体大小 - 使用函数代替静态值，更加灵活
        TEXT_SIZE: (width = 0, height = 0) => {
            // width和height的取值范围是0-7，0表示正常大小
            width = Math.max(0, Math.min(7, width));   // 限制在0-7范围内
            height = Math.max(0, Math.min(7, height)); // 限制在0-7范围内
            const n = (width << 4) | height;           // 组合宽度和高度
            return Buffer.from([0x1D, 0x21, n]);       // GS ! n 命令
        },

        // 为了兼容旧代码，保留原有的静态属性
        get TEXT_NORMAL() { return this.TEXT_SIZE(0, 0); },
        get TEXT_DOUBLE_HEIGHT() { return this.TEXT_SIZE(0, 1); },
        get TEXT_DOUBLE_WIDTH() { return this.TEXT_SIZE(1, 0); },
        get TEXT_DOUBLE_SIZE() { return this.TEXT_SIZE(1, 1); },

        // 换行
        LF: Buffer.from([0x0A]),

        // 字符集切换命令
        ASCII_MODE: Buffer.concat([
            Buffer.from([0x1B, 0x74, 0x00]),     // 选择字符集 ASCII
            Buffer.from([0x1C, 0x2E])            // 取消汉字模式
        ]),

        CHINESE_MODE: Buffer.concat([
            Buffer.from([0x1B, 0x74, 0x15]),     // 选择字符集 GBK
            Buffer.from([0x1C, 0x26])            // 启用汉字模式
        ]),

        // 编码方式
        ENCODING_GBK: Buffer.from([0x1B, 0x74, 0x15]),
        ENCODING_ASCII: Buffer.from([0x1B, 0x74, 0x00]),

        // 条形码相关命令
        BARCODE_HEIGHT: (height) => Buffer.from([0x1D, 0x68, height]),  // 设置条形码高度
        BARCODE_WIDTH: (width) => Buffer.from([0x1D, 0x77, width]),     // 设置条形码宽度
        BARCODE_FONT: (font) => Buffer.from([0x1D, 0x66, font]),        // 设置 HRI 字符字体
        BARCODE_POSITION: (position) => Buffer.from([0x1D, 0x48, position]), // 设置 HRI 字符打印位置

        // 条形码类型
        BARCODE_TYPE: {
            UPC_A: Buffer.from([0x1D, 0x6B, 0x00]),
            UPC_E: Buffer.from([0x1D, 0x6B, 0x01]),
            EAN13: Buffer.from([0x1D, 0x6B, 0x02]),
            EAN8: Buffer.from([0x1D, 0x6B, 0x03]),
            CODE39: Buffer.from([0x1D, 0x6B, 0x04]),
            ITF: Buffer.from([0x1D, 0x6B, 0x05]),
            CODABAR: Buffer.from([0x1D, 0x6B, 0x06])
        },

        // 二维码相关命令
        QR_SIZE: (size) => Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size]),  // 设置二维码大小 1-16
        QR_ERROR_LEVEL: (level) => Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, level]), // 设置纠错等级 48-51
        QR_STORE_DATA: (data) => {
            const length = data.length + 3;
            const pL = length % 256;
            const pH = Math.floor(length / 256);
            return Buffer.concat([
                Buffer.from([0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]),
                Buffer.from(data)
            ]);
        },
        QR_PRINT: Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30])
    };

    // 打印条形码的辅助方法
    printBarcode(data, type = 'EAN13', options = {}) {
        const { width = 3, height = 64, font = 0, position = 2 } = options;

        const barcodeData = Buffer.concat([
            ESCPOSPrinter.commands.BARCODE_HEIGHT(height),
            ESCPOSPrinter.commands.BARCODE_WIDTH(width),
            ESCPOSPrinter.commands.BARCODE_FONT(font),
            ESCPOSPrinter.commands.BARCODE_POSITION(position),
            ESCPOSPrinter.commands.BARCODE_TYPE[type],
            Buffer.from(data),
            Buffer.from([0x00])
        ]);

        return this.print(barcodeData);
    }

    // 打印二维码的辅助方法
    printQRCode(data, options = {}) {
        const { size = 8, errorLevel = 49 } = options;  // 默认大小8，纠错等级L(49)

        const qrData = Buffer.concat([
            ESCPOSPrinter.commands.QR_SIZE(size),           // 设置大小
            ESCPOSPrinter.commands.QR_ERROR_LEVEL(errorLevel), // 设置纠错等级
            ESCPOSPrinter.commands.QR_STORE_DATA(data),     // 存储数据
            ESCPOSPrinter.commands.QR_PRINT                 // 打印
        ]);

        return this.print(qrData);
    }

    // 图片处理相关命令
    static imageCommands = {
        // 光栅位图格式
        S8_HIGH_DENSITY: Buffer.from([0x1D, 0x76, 0x30, 0x00]),
        // 行间距
        LINE_SPACING: (n) => Buffer.from([0x1B, 0x33, n])
    };

    // 处理图片并返回打印数据
    async processImage(imagePath, options = {}) {
        const {
            width = 384,      // 默认打印宽度（针对58mm打印纸，可打印384点）
            threshold = 128,  // 黑白转换阈值
            dither = true    // 是否使用抖动算法
        } = options;

        try {
            // 读取图片
            const image = await Jimp.read(imagePath);

            // 调整图片大小，保持宽高比
            image.scaleToFit(width, Jimp.AUTO);

            // 转换为灰度图
            image.grayscale();

            if (dither) {
                // 使用 Floyd-Steinberg 抖动算法
                image.dither16();
            } else {
                // 简单的黑白转换
                image.threshold({ max: threshold });
            }

            // 获取图片尺寸
            const imgWidth = image.getWidth();
            const imgHeight = image.getHeight();

            // 计算每行字节数（8个点一个字节）
            const bytesPerLine = Math.ceil(imgWidth / 8);

            // 准备打印数据
            const printData = [];
            const header = Buffer.concat([
                ESCPOSPrinter.imageCommands.S8_HIGH_DENSITY,
                Buffer.from([bytesPerLine & 0xff, (bytesPerLine >> 8) & 0xff]),
                Buffer.from([imgHeight & 0xff, (imgHeight >> 8) & 0xff])
            ]);
            printData.push(header);

            // 转换图片数据为打印机位图格式
            for (let y = 0; y < imgHeight; y++) {
                const row = new Uint8Array(bytesPerLine);
                for (let x = 0; x < imgWidth; x++) {
                    const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
                    const isBlack = pixel.r < threshold;
                    if (isBlack) {
                        const byteIndex = Math.floor(x / 8);
                        const bitIndex = 7 - (x % 8);
                        row[byteIndex] |= (1 << bitIndex);
                    }
                }
                printData.push(Buffer.from(row));
            }

            return Buffer.concat(printData);
        } catch (error) {
            throw new Error(`图片处理失败: ${error.message}`);
        }
    }

    // 打印图片
    async printImage(imagePath, options = {}) {
        try {
            const imageData = await this.processImage(imagePath, options);
            return this.print(imageData);
        } catch (error) {
            throw new Error(`图片打印失败: ${error.message}`);
        }
    }
}

module.exports = ESCPOSPrinter; 