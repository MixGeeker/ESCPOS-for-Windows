# node-escpos-win

这是一个用于 Windows 系统的 ESC/POS 打印机驱动程序，使用 Node.js 和 C++ 实现。

## 安装

```bash
npm install node-escpos-win
```

## 系统要求

- Windows 操作系统
- Node.js 14.0.0 或更高版本
- Windows SDK（用于编译 C++ 代码）
- Visual Studio Build Tools

## 使用方法

```javascript
const ESCPOSPrinter = require('node-escpos-win');

// 创建打印机实例，参数为打印机名称
const printer = new ESCPOSPrinter('Your Printer Name');

// 使用 ESC/POS 命令打印
const printData = Buffer.concat([
    ESCPOSPrinter.commands.INIT,
    ESCPOSPrinter.commands.ALIGN_CENTER,
    Buffer.from('Hello, World!\n'),
    ESCPOSPrinter.commands.CUT
]);

// 发送数据到打印机
printer.print(printData);

// 关闭打印机连接
printer.close();
```

## 支持的 ESC/POS 命令

- 初始化打印机：`ESCPOSPrinter.commands.INIT`
- 切纸：`ESCPOSPrinter.commands.CUT`
- 字体加粗：`ESCPOSPrinter.commands.BOLD_ON`, `ESCPOSPrinter.commands.BOLD_OFF`
- 对齐方式：
  - `ESCPOSPrinter.commands.ALIGN_LEFT`
  - `ESCPOSPrinter.commands.ALIGN_CENTER`
  - `ESCPOSPrinter.commands.ALIGN_RIGHT`
- 字体大小：
  - `ESCPOSPrinter.commands.TEXT_NORMAL`
  - `ESCPOSPrinter.commands.TEXT_DOUBLE_HEIGHT`
  - `ESCPOSPrinter.commands.TEXT_DOUBLE_WIDTH`
  - `ESCPOSPrinter.commands.TEXT_DOUBLE_SIZE`
- 换行：`ESCPOSPrinter.commands.LF`

## 注意事项

1. 确保打印机已正确安装并在 Windows 系统中可见
2. 使用管理员权限运行 Node.js 应用程序可能会获得更好的打印机访问权限
3. 某些 ESC/POS 命令可能需要根据具体打印机型号进行调整

## 许可证

MIT 

## 联系方式
如何有什么问题的话，加我微信 LinkTYLinkBY