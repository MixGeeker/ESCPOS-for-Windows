const { Printer } = require('bindings')('escpos_printer');
const iconv = require('iconv-lite');

class ESCPOSPrinter {
    constructor(printerName) {
        this.printer = new Printer(printerName);
        this.currentCharset = 'ASCII'; // 默认ASCII字符集
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
        
        // 字体大小
        TEXT_NORMAL: Buffer.from([0x1B, 0x21, 0x00]),
        TEXT_DOUBLE_HEIGHT: Buffer.from([0x1B, 0x21, 0x10]),
        TEXT_DOUBLE_WIDTH: Buffer.from([0x1B, 0x21, 0x20]),
        TEXT_DOUBLE_SIZE: Buffer.from([0x1B, 0x21, 0x30]),
        
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
        ENCODING_ASCII: Buffer.from([0x1B, 0x74, 0x00])
    };
}

module.exports = ESCPOSPrinter; 