const ESCPOSPrinter = require('./index.js');

// 获取命令行参数中的打印机名称
const printerName = process.argv[2];

if (!printerName) {
    console.error('请提供打印机名称作为参数');
    console.error('使用方法: node test.js "打印机名称"');
    process.exit(1);
}

try {
    // 创建打印机实例
    const printer = new ESCPOSPrinter(printerName);

    // 打印初始化和对齐方式
    printer.print(ESCPOSPrinter.commands.INIT);
    printer.print(ESCPOSPrinter.commands.ALIGN_CENTER);

    // 中文模式初始化
    printer.print(ESCPOSPrinter.commands.CHINESE_MODE);
    printer.print(ESCPOSPrinter.commands.ENCODING_GBK);

    // 标题（加粗）
    printer.print(ESCPOSPrinter.commands.BOLD_ON);
    printer.print(printer.textToBuffer('=== 打印测试 ===\n', 'GBK'));
    printer.print(ESCPOSPrinter.commands.BOLD_OFF);

    // 基础英文测试
    printer.print(printer.textToBuffer('English Test\n'));
    printer.print(ESCPOSPrinter.commands.LF);

    // 字体A测试
    printer.setFontA();
    printer.print(printer.textToBuffer('Font A\n'));
    printer.print(ESCPOSPrinter.commands.LF);

    // 字体B测试
    printer.setFontB();
    printer.print(printer.textToBuffer('Font B\n'));
    printer.print(ESCPOSPrinter.commands.LF);

    // 基本中文测试
    printer.print(printer.textToBuffer('中文打印测试\n', 'GBK'));
    printer.print(ESCPOSPrinter.commands.LF);

    printer.setFontA();
    printer.print(printer.textToBuffer('标准字体A (Font A)\n', 'GBK'));

    // 字体B测试
    printer.setFontB();
    printer.print(printer.textToBuffer('压缩字体B (Font B)\n', 'GBK'));

    // 恢复字体A
    printer.setFontA();
    printer.print(ESCPOSPrinter.commands.LF);

    // 文本大小测试 - 使用便捷方法
    printer.print(printer.textToBuffer('文本大小测试：\n', 'GBK'));

    // 双倍高度
    printer.setTextDoubleHeight();
    printer.print(printer.textToBuffer('双倍高度\n', 'GBK'));

    // 双倍宽度
    printer.setTextDoubleWidth();
    printer.print(printer.textToBuffer('双倍宽度\n', 'GBK'));

    // 双倍大小
    printer.setTextDoubleSize();
    printer.print(printer.textToBuffer('双倍大小\n', 'GBK'));

    // 自定义大小
    printer.setTextSize(3, 3);
    printer.print(printer.textToBuffer('4倍大小\n', 'GBK'));

    // 自定义六倍大小
    printer.setTextSize(5, 5);
    printer.print(printer.textToBuffer('6倍大小\n', 'GBK'));

    // 自定义八倍大小
    printer.setTextSize(7, 7);
    printer.print(printer.textToBuffer('8倍大小\n', 'GBK'));

    // 恢复正常大小
    printer.setTextNormal();
    printer.print(ESCPOSPrinter.commands.LF);

    // 对齐和正常内容
    printer.print(ESCPOSPrinter.commands.ALIGN_LEFT);
    printer.print(printer.textToBuffer('1. 中文测试项目\n', 'GBK'));
    printer.print(printer.textToBuffer('2. 英文测试 English Test\n', 'GBK'));
    printer.print(printer.textToBuffer('打印时间：' + new Date().toLocaleString() + '\n', 'GBK'));

    printer.print(ESCPOSPrinter.commands.ALIGN_CENTER);
    printer.print(printer.textToBuffer('------------------------\n', 'GBK'));
    printer.print(ESCPOSPrinter.commands.LF);

    // 条码测试
    printer.print(printer.textToBuffer('条码测试\n', 'GBK'));
    printer.print(ESCPOSPrinter.commands.LF);
    printer.printBarcode('1234567890128', 'EAN13', {
        width: 6,
        height: 128
    });
    printer.print(ESCPOSPrinter.commands.LF);

    // 二维码测试
    printer.print(printer.textToBuffer('二维码测试\n', 'GBK'));
    printer.print(ESCPOSPrinter.commands.LF);

    // 1. 基本二维码
    printer.print(ESCPOSPrinter.commands.QR_SIZE(8));
    printer.print(ESCPOSPrinter.commands.QR_ERROR_LEVEL(49));
    printer.print(ESCPOSPrinter.commands.QR_STORE_DATA(printer.textToBuffer('https://github.com/MixGeeker/ESCPOS-for-Windows', 'GBK')));
    printer.print(ESCPOSPrinter.commands.QR_PRINT);
    printer.print(ESCPOSPrinter.commands.LF);
    printer.print(ESCPOSPrinter.commands.LF);

    // 2. 中文二维码
    printer.print(printer.textToBuffer('中文二维码测试\n', 'GBK'));
    printer.print(ESCPOSPrinter.commands.QR_SIZE(10));
    printer.print(ESCPOSPrinter.commands.QR_ERROR_LEVEL(51));
    printer.print(ESCPOSPrinter.commands.QR_STORE_DATA(printer.textToBuffer('欢迎使用热敏打印机测试程序！', 'GBK')));
    printer.print(ESCPOSPrinter.commands.QR_PRINT);
    printer.print(ESCPOSPrinter.commands.LF);
    printer.print(ESCPOSPrinter.commands.LF);

    console.log('基础内容打印成功！');

    // 使用 printQRCode 方法测试
    const success = printer.printQRCode(printer.textToBuffer('访问 NPM 包主页', 'GBK'), {
        size: 8,
        errorLevel: 49
    });

    if (success) {
        console.log('二维码打印成功！');

        // 最后打印切纸命令
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.LF,
            ESCPOSPrinter.commands.LF,
            ESCPOSPrinter.commands.CUT
        ]));
    } else {
        console.error('二维码打印失败！');
    }

    // 关闭打印机连接
    printer.close();

} catch (error) {
    console.error('打印过程中发生错误：', error);
} 