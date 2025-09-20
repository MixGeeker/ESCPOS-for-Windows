const ESCPOSPrinter = require('./index.js');

// 获取命令行参数中的打印机名称和图片路径
const printerName = process.argv[2];
const imagePath = process.argv[3];

if (!printerName || !imagePath) {
    console.error('请提供打印机名称和图片路径作为参数');
    console.error('使用方法: node test_image.js "打印机名称" "图片路径"');
    process.exit(1);
}

async function testImagePrint() {
    const printer = new ESCPOSPrinter(printerName);

    try {
        // 打印标题
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.INIT,
            ESCPOSPrinter.commands.ALIGN_CENTER,
            ESCPOSPrinter.commands.CHINESE_MODE,
            ESCPOSPrinter.commands.BOLD_ON,
            ESCPOSPrinter.commands.TEXT_DOUBLE_SIZE,
            printer.textToBuffer('图片打印测试\n', 'GBK'),
            ESCPOSPrinter.commands.TEXT_NORMAL,
            ESCPOSPrinter.commands.BOLD_OFF,
            ESCPOSPrinter.commands.LF
        ]));

        console.log('正在处理图片...');

        // 测试不同的打印效果
        console.log('1. 测试默认效果');
        await printer.printImage(imagePath);
        
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.LF,
            printer.textToBuffer('------------------------\n', 'GBK'),
            ESCPOSPrinter.commands.LF
        ]));

        console.log('2. 测试无抖动效果');
        await printer.printImage(imagePath, {
            dither: false,
            threshold: 128
        });

        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.LF,
            printer.textToBuffer('------------------------\n', 'GBK'),
            ESCPOSPrinter.commands.LF
        ]));

        console.log('3. 测试较小尺寸效果');
        await printer.printImage(imagePath, {
            width: 200,
            dither: true
        });

        // 打印页尾
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.LF,
            ESCPOSPrinter.commands.ALIGN_CENTER,
            printer.textToBuffer('测试完成\n', 'GBK'),
            ESCPOSPrinter.commands.LF,
            ESCPOSPrinter.commands.CUT
        ]));

        console.log('图片打印测试完成！');
    } catch (error) {
        console.error('打印过程中发生错误：', error);
    } finally {
        printer.close();
    }
}

testImagePrint().catch(console.error); 