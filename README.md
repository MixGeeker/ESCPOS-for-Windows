# node-escpos-win

这是一个用于 Windows 系统的 ESC/POS 打印机驱动程序，使用 Node.js 和 C++ 实现。支持中英文混合打印，自动编码转换。

## 特性

- 支持中英文混合打印
- 自动处理中文编码（GBK）
- 支持常用的 ESC/POS 命令
- 支持文本样式设置（加粗、对齐、大小等）
- **完整的 TypeScript 支持**，提供类型安全和 IDE 智能提示
- 支持图片打印和二维码/条形码打印
- 仅支持 Windows 系统

## 安装

```bash
npm install @mixgeeker/node-escpos-win
```

## 系统要求

- Windows 操作系统
- Node.js 14.0.0 或更高版本
- Windows SDK（用于编译 C++ 代码）
- Visual Studio Build Tools （用于编译 C++ 代码）

## 基本使用

```javascript
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');

// 创建打印机实例，参数为打印机名称
const printer = new ESCPOSPrinter('Your Printer Name');

// 方法一：分别打印中英文
printer.printAscii('Hello World'); // 打印英文
printer.printChinese('你好，世界'); // 打印中文

// 方法二：混合打印中英文
const printData = Buffer.concat([
    ESCPOSPrinter.commands.INIT,
    ESCPOSPrinter.commands.ALIGN_CENTER,
    
    // 英文部分
    ESCPOSPrinter.commands.ASCII_MODE,
    Buffer.from('Hello World\n'),
    
    // 中文部分
    ESCPOSPrinter.commands.CHINESE_MODE,
    printer.textToBuffer('你好，世界\n', 'GBK'),
    
    ESCPOSPrinter.commands.CUT
]);

printer.print(printData);

// 最后关闭打印机连接
printer.close();
```

## TypeScript 使用

本库提供完整的 TypeScript 类型定义，支持类型安全和 IDE 智能提示。

```typescript
import ESCPOSPrinter from '@mixgeeker/node-escpos-win';

// 创建打印机实例，TypeScript 会提供完整的类型支持
const printer = new ESCPOSPrinter('Your Printer Name');

// 所有方法都有类型定义，IDE 会提供智能提示
printer.printChinese('你好，世界');
printer.printAscii('Hello World');

// 图片打印支持完整的选项类型定义
printer.printImage('path/to/image.jpg', {
  width: 384,
  threshold: 128,
  dither: true
}).then((success) => {
  console.log('图片打印结果:', success);
});

// Base64图片打印
const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
printer.printImageFromBase64(base64Image, {
  width: 384,
  threshold: 128,
  dither: true
}).then((success) => {
  console.log('Base64图片打印结果:', success);
});

// 条形码打印
printer.printBarcode('1234567890', 'EAN13', {
  width: 3,
  height: 64,
  position: 2
});

// 二维码打印
printer.printQRCode('https://example.com', {
  size: 8,
  errorLevel: 49
});

printer.close();
```

### TypeScript 优势

- **类型安全**: 编译时检查类型错误，避免运行时异常
- **IDE 智能提示**: 完整的代码补全和参数提示
- **更好的开发体验**: 支持重构、跳转定义等现代 IDE 功能
- **文档集成**: 类型定义本身就是最好的 API 文档

## 支持的 ESC/POS 命令

### 初始化
- `ESCPOSPrinter.commands.INIT`: 初始化打印机

### 切纸
- `ESCPOSPrinter.commands.CUT`: 切纸

### 字符集
- `ESCPOSPrinter.commands.ASCII_MODE`: 切换到 ASCII 模式
- `ESCPOSPrinter.commands.CHINESE_MODE`: 切换到中文模式

### 文本样式
- `ESCPOSPrinter.commands.BOLD_ON`: 开启加粗
- `ESCPOSPrinter.commands.BOLD_OFF`: 关闭加粗

### 对齐方式
- `ESCPOSPrinter.commands.ALIGN_LEFT`: 左对齐
- `ESCPOSPrinter.commands.ALIGN_CENTER`: 居中对齐
- `ESCPOSPrinter.commands.ALIGN_RIGHT`: 右对齐

### 字体大小
- `ESCPOSPrinter.commands.TEXT_NORMAL`: 正常大小
- `ESCPOSPrinter.commands.TEXT_DOUBLE_HEIGHT`: 双倍高度
- `ESCPOSPrinter.commands.TEXT_DOUBLE_WIDTH`: 双倍宽度
- `ESCPOSPrinter.commands.TEXT_DOUBLE_SIZE`: 双倍大小

### 其他
- `ESCPOSPrinter.commands.LF`: 换行

## API 说明

### 类：ESCPOSPrinter

#### 构造函数
```javascript
new ESCPOSPrinter(printerName: string)
```

#### 方法
- `print(data: Buffer | string): boolean`: 打印数据
- `printChinese(text: string): boolean`: 打印中文文本
- `printAscii(text: string): boolean`: 打印英文文本
- `textToBuffer(text: string, charset?: 'ASCII' | 'GBK'): Buffer`: 文本转换为指定编码的 Buffer
- `close(): void`: 关闭打印机连接

## 注意事项

1. 确保打印机已正确安装并在 Windows 系统中可见
2. 使用管理员权限运行 Node.js 应用程序可能会获得更好的打印机访问权限
3. 某些 ESC/POS 命令可能需要根据具体打印机型号进行调整
4. 中文打印使用 GBK 编码，确保文本内容为正确的中文字符

## 获取打印机名称

在 Windows PowerShell 中运行以下命令可以获取系统中已安装的打印机名称：

```powershell
Get-Printer | Select-Object Name
```

## 许可证

MIT

## 问题反馈

如果你在使用过程中遇到任何问题，请在 GitHub Issues 中提出。
