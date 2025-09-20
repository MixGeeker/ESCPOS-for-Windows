# node-escpos-win

这是一个用于 Windows 系统的 ESC/POS 打印机驱动程序，使用 Node.js 和 C++ 实现。支持中英文混合打印，自动编码转换。

## 特性

- 支持中英文混合打印
- 自动处理中文编码（GBK）
- 支持常用的 ESC/POS 命令
- 支持文本样式设置（加粗、对齐、大小等）
- 支持条形码打印（多种格式）
- 支持二维码打印（可调整大小和纠错等级）
- 支持图片打印（自动优化，支持抖动处理）
- 仅支持 Windows 系统

## 安装

```bash
npm i @mixgeeker/node-escpos-win
```

## 导入与类型支持（自 v2.0.0）

- 使用 ESM：
```javascript
import ESCPOSPrinter, { ESCPOSPrinter as Named } from '@mixgeeker/node-escpos-win';

const printer = new ESCPOSPrinter('Your Printer Name');
```

- 使用 CommonJS（保持兼容）：
```javascript
// import ESCPOSPrinter from '@mixgeeker/node-escpos-win';
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');

const printer = new ESCPOSPrinter('Your Printer Name');
```

- TypeScript 类型（自动提供声明）：
```ts
import ESCPOSPrinter, { type PrinterInfo, type BarcodeOptions, type QROptions, type ImageOptions } from '@mixgeeker/node-escpos-win';

const printers: PrinterInfo[] = ESCPOSPrinter.getPrinterList();
```

## 迁移指南（v2.0.0）

- CommonJS 用户：无需更改，原有 `require('@mixgeeker/node-escpos-win')` 保持可用。
- ESM/TS 用户：可直接使用 `import ESCPOSPrinter from '@mixgeeker/node-escpos-win'`。
- 类型支持：包内已内置 `index.d.ts`，自动获得完整 API 类型提示。
- 运行时与 API 无破坏性变更：`index.js` 仍为实现入口，`index.mjs` 仅为 ESM 包装层。

## 系统要求

- Windows 操作系统
- Node.js 14.0.0 或更高版本 (我用的是22)
- Windows SDK（用于编译 C++ 代码，单纯使用的话应该不要，何况我也没公布源码(bushi) 笑~）
- Visual Studio Build Tools (正常情况也不用)

## 基本使用

```javascript
// ESM
// import ESCPOSPrinter from '@mixgeeker/node-escpos-win';
// CJS
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');

// 创建打印机实例，参数为打印机名称
const printer = new ESCPOSPrinter('Your Printer Name');

// 方法一：分别打印中英文
printer.printAscii('Hello World'); // 打印英文
printer.printChinese('你好，世界'); // 打印中文

// 方法二：混合打印中英文
const printData = Buffer.concat([
    ESCPOSPrinter.commands.INIT,            // 初始化打印机
    ESCPOSPrinter.commands.ALIGN_CENTER,    // 居中对齐
    ESCPOSPrinter.commands.CHINESE_MODE,    // 切换到中文模式
    ESCPOSPrinter.commands.BOLD_ON,         // 开启加粗
    printer.textToBuffer('收据标题\n', 'GBK'),
    ESCPOSPrinter.commands.BOLD_OFF,        // 关闭加粗
    ESCPOSPrinter.commands.ALIGN_LEFT,      // 左对齐
    printer.textToBuffer('商品：测试商品\n', 'GBK'),
    printer.textToBuffer('价格：￥9.99\n', 'GBK'),
    printer.textToBuffer('时间：' + new Date().toLocaleString() + '\n', 'GBK'),
    ESCPOSPrinter.commands.LF,              // 换行
    ESCPOSPrinter.commands.ALIGN_CENTER,    // 居中对齐
    ESCPOSPrinter.commands.CUT              // 切纸
]);

printer.print(printData);

// 最后关闭打印机连接
printer.close();
```

## 图片打印

### 图片打印功能特点
- 支持多种图片格式（PNG、JPEG、BMP等）
- 自动调整图片大小以适应打印纸宽度
- 支持抖动算法处理，提高灰度打印效果
- 可调整打印参数（宽度、阈值、抖动等）

### 图片打印示例
```javascript
// import ESCPOSPrinter from '@mixgeeker/node-escpos-win';
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');
const printer = new ESCPOSPrinter('Your Printer Name');

// 打印图片
async function printImage() {
    try {
        // 使用默认参数打印
        await printer.printImage('path/to/image.png');
        
        // 使用自定义参数打印
        await printer.printImage('path/to/image.png', {
            width: 384,      // 打印宽度（针对58mm打印纸）
            threshold: 128,  // 黑白转换阈值（0-255）
            dither: true    // 是否使用抖动算法
        });
        
        printer.print(ESCPOSPrinter.commands.CUT);
        printer.close();
    } catch (error) {
        console.error('打印失败：', error);
        printer.close();
    }
}

printImage();
```

### 图片打印测试工具
包含了一个测试工具 `test_image.js`，可以测试不同的图片打印效果：

```bash
node test_image.js "打印机名称" "图片路径"
```

测试工具会：
1. 使用默认参数打印图片
2. 使用无抖动效果打印图片
3. 使用较小尺寸打印图片

这样您可以比较不同参数下的打印效果，选择最适合的设置。

### 图片打印建议
1. 图片格式：
   - 推荐使用 PNG 或 JPEG 格式
   - 对于线条图或文字，建议使用 PNG 格式
   - 对于照片，可以使用 JPEG 格式

2. 图片大小：
   - 58mm 打印纸最大可打印 384 点
   - 80mm 打印纸最大可打印 576 点
   - 建议根据打印纸宽度调整 width 参数

3. 图片优化：
   - 使用 `dither: true` 可以提高灰度图片的打印效果
   - 对于黑白图片，可以设置 `dither: false` 获得更清晰的效果
   - 通过调整 `threshold` 参数（0-255）可以控制黑白转换的临界值

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

### 字体类型
- `ESCPOSPrinter.commands.FONT_A`: 标准字体
- `ESCPOSPrinter.commands.FONT_B`: 压缩字体
- `printer.setFontA()`: 设置为标准字体A
- `printer.setFontB()`: 设置为压缩字体B

### 字体大小（新方法）
- `ESCPOSPrinter.commands.TEXT_SIZE(width, height)`: 设置字体宽度和高度
  - `width`: 宽度倍数（0-7，0表示正常宽度，1表示2倍宽度，2表示三倍高度，以此类推）
  - `height`: 高度倍数（0-7，0表示正常高度，1表示2倍高度，2表示三倍高度，以此类推）
- `printer.setTextSize(width, height)`: 设置字体大小
- `printer.setTextNormal()`: 设置为正常大小
- `printer.setTextDoubleHeight()`: 设置为双倍高度
- `printer.setTextDoubleWidth()`: 设置为双倍宽度
- `printer.setTextDoubleSize()`: 设置为双倍大小（宽度和高度都是2倍）

### 条码打印
- `ESCPOSPrinter.commands.BARCODE_HEIGHT`: 设置条形码高度
- `ESCPOSPrinter.commands.BARCODE_WIDTH`: 设置条形码宽度
- `ESCPOSPrinter.commands.BARCODE_FONT`: 设置 HRI 字符字体
- `ESCPOSPrinter.commands.BARCODE_POSITION`: 设置 HRI 字符打印位置
- `ESCPOSPrinter.commands.BARCODE_TYPE`: 条形码类型
  - `UPC_A`: UPC-A 条码
  - `UPC_E`: UPC-E 条码
  - `EAN13`: EAN-13 条码
  - `EAN8`: EAN-8 条码
  - `CODE39`: CODE 39 条码
  - `ITF`: ITF 条码
  - `CODABAR`: CODABAR 条码

### 二维码打印
- `ESCPOSPrinter.commands.QR_SIZE`: 设置二维码大小（1-16）
- `ESCPOSPrinter.commands.QR_ERROR_LEVEL`: 设置二维码纠错等级
- `ESCPOSPrinter.commands.QR_STORE_DATA`: 存储二维码数据
- `ESCPOSPrinter.commands.QR_PRINT`: 打印二维码

### 其他
- `ESCPOSPrinter.commands.LF`: 换行

### 图片打印
- `ESCPOSPrinter.imageCommands.S8_HIGH_DENSITY`: 高密度点阵图模式
- `ESCPOSPrinter.imageCommands.LINE_SPACING`: 设置行间距

## API 说明

### 类：ESCPOSPrinter

#### 静态方法
- `ESCPOSPrinter.getPrinterList(): Array<PrinterInfo>`: 获取系统中所有打印机的列表
  - 返回值：打印机信息数组
    ```typescript
    interface PrinterInfo {
        name: string;        // 打印机名称
        description: string; // 打印机描述
        isDefault: boolean;  // 是否为默认打印机
    }
    ```

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
- `setFontA(): boolean`: 设置为标准字体A
- `setFontB(): boolean`: 设置为压缩字体B
- `setTextSize(width?: number, height?: number): boolean`: 设置字体大小
- `setTextNormal(): boolean`: 设置为正常大小
- `setTextDoubleHeight(): boolean`: 设置为双倍高度
- `setTextDoubleWidth(): boolean`: 设置为双倍宽度
- `setTextDoubleSize(): boolean`: 设置为双倍大小
- `printBarcode(data: string, type?: string, options?: BarcodeOptions): boolean`: 打印条形码
  - `data`: 条形码数据
  - `type`: 条形码类型（默认为 'EAN13'）
  - `options`: 条形码选项
    - `width`: 条形码宽度（默认为 3）
    - `height`: 条形码高度（默认为 64）
    - `font`: HRI 字符字体（默认为 0）
    - `position`: HRI 字符打印位置（默认为 2）
- `printQRCode(data: string, options?: QRCodeOptions): boolean`: 打印二维码
  - `data`: 二维码数据（文本或URL）
  - `options`: 二维码选项
    - `size`: 二维码大小（1-16，默认为 8）
    - `errorLevel`: 纠错等级（48-51，默认为 49）
      - 48: 纠错等级 L (7%)
      - 49: 纠错等级 M (15%)
      - 50: 纠错等级 Q (25%)
      - 51: 纠错等级 H (30%)
- `processImage(imagePath: string, options?: ImageOptions): Promise<Buffer>`: 处理图片数据
  - `imagePath`: 图片文件路径
  - `options`: 图片处理选项
    - `width`: 打印宽度（默认 384，适用于 58mm 打印纸）
    - `threshold`: 黑白转换阈值（0-255，默认 128）
    - `dither`: 是否使用抖动算法（默认 true）
- `printImage(imagePath: string, options?: ImageOptions): Promise<boolean>`: 打印图片
  - 参数同 `processImage`

## 完整示例

### 打印收据示例
```javascript
// import ESCPOSPrinter from '@mixgeeker/node-escpos-win';
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');
const printer = new ESCPOSPrinter('Your Printer Name');

// 准备打印数据
const printData = Buffer.concat([
    ESCPOSPrinter.commands.INIT,
    ESCPOSPrinter.commands.ALIGN_CENTER,
    ESCPOSPrinter.commands.CHINESE_MODE,
    
    // 标题
    ESCPOSPrinter.commands.BOLD_ON,
    ESCPOSPrinter.commands.TEXT_DOUBLE_SIZE,
    printer.textToBuffer('收银小票\n', 'GBK'),
    ESCPOSPrinter.commands.TEXT_NORMAL,
    ESCPOSPrinter.commands.BOLD_OFF,
    
    // 商店信息
    printer.textToBuffer('测试商店\n', 'GBK'),
    printer.textToBuffer('电话：1234567890\n', 'GBK'),
    printer.textToBuffer('------------------------\n', 'GBK'),
    
    // 订单信息
    ESCPOSPrinter.commands.ALIGN_LEFT,
    printer.textToBuffer('订单号：123456789\n', 'GBK'),
    printer.textToBuffer('日期：' + new Date().toLocaleString() + '\n', 'GBK'),
    printer.textToBuffer('------------------------\n', 'GBK'),
    
    // 商品列表
    printer.textToBuffer('商品名称          数量    金额\n', 'GBK'),
    printer.textToBuffer('测试商品A         1      ￥9.9\n', 'GBK'),
    printer.textToBuffer('测试商品B         2      ￥19.8\n', 'GBK'),
    printer.textToBuffer('------------------------\n', 'GBK'),
    
    // 总计
    ESCPOSPrinter.commands.ALIGN_RIGHT,
    printer.textToBuffer('总计：￥29.7\n', 'GBK'),
    ESCPOSPrinter.commands.LF,
    
    // 二维码
    ESCPOSPrinter.commands.ALIGN_CENTER,
    printer.textToBuffer('扫描关注我们\n', 'GBK'),
    ESCPOSPrinter.commands.LF
]);

// 打印数据
printer.print(printData);

// 打印二维码
printer.printQRCode('https://github.com/MixGeeker/ESCPOS-for-Windows', {
    size: 8,
    errorLevel: 49
});

// 打印条形码
printer.print(Buffer.concat([
    ESCPOSPrinter.commands.LF,
    ESCPOSPrinter.commands.LF
]));

printer.printBarcode('1234567890128', 'EAN13', {
    width: 3,
    height: 64
});

// 最后切纸
printer.print(Buffer.concat([
    ESCPOSPrinter.commands.LF,
    ESCPOSPrinter.commands.LF,
    ESCPOSPrinter.commands.CUT
]));

// 关闭打印机连接
printer.close();
```

### 图片打印示例
```javascript
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');
const printer = new ESCPOSPrinter('Your Printer Name');

// 打印图片
async function printWithImage() {
    try {
        // 打印标题
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.INIT,
            ESCPOSPrinter.commands.ALIGN_CENTER,
            ESCPOSPrinter.commands.CHINESE_MODE,
            ESCPOSPrinter.commands.BOLD_ON,
            printer.textToBuffer('图片打印测试\n', 'GBK'),
            ESCPOSPrinter.commands.BOLD_OFF,
            ESCPOSPrinter.commands.LF
        ]));

        // 打印 LOGO
        await printer.printImage('./logo.png', {
            width: 384,      // 适用于 58mm 打印纸
            threshold: 128,  // 黑白转换阈值
            dither: true    // 使用抖动算法，提高图片质量
        });

        // 打印分隔线和页尾
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.LF,
            printer.textToBuffer('------------------------\n', 'GBK'),
            ESCPOSPrinter.commands.ALIGN_CENTER,
            printer.textToBuffer('页尾信息\n', 'GBK'),
            ESCPOSPrinter.commands.LF,
            ESCPOSPrinter.commands.CUT
        ]));

        printer.close();
    } catch (error) {
        console.error('打印失败：', error);
        printer.close();
    }
}

printWithImage();
```

### 使用新字体功能示例
```javascript
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');
const printer = new ESCPOSPrinter('Your Printer Name');

// 初始化打印机
printer.print(ESCPOSPrinter.commands.INIT);
printer.print(ESCPOSPrinter.commands.CHINESE_MODE);

// 标准字体A
printer.setFontA();
printer.print(printer.textToBuffer('这是标准字体A\n', 'GBK'));

// 压缩字体B
printer.setFontB();
printer.print(printer.textToBuffer('这是压缩字体B\n', 'GBK'));

// 恢复标准字体A
printer.setFontA();

// 使用不同的字体大小
printer.print(printer.textToBuffer('以下是不同的字体大小示例：\n', 'GBK'));

// 正常大小
printer.setTextNormal();
printer.print(printer.textToBuffer('1. 正常大小文本\n', 'GBK'));
printer.print(printer.textToBuffer('ENGLISH\n'));

// 双倍高度
printer.setTextDoubleHeight();
printer.print(printer.textToBuffer('2. 双倍高度文本\n', 'GBK'));

// 双倍宽度
printer.setTextDoubleWidth();
printer.print(printer.textToBuffer('3. 双倍宽度文本\n', 'GBK'));

// 双倍大小（宽度和高度都是2倍）
printer.setTextDoubleSize();
printer.print(printer.textToBuffer('4. 双倍大小文本\n', 'GBK'));

// 自定义大小（3倍宽度，2倍高度）
printer.setTextSize(2, 1);
printer.print(printer.textToBuffer('5. 自定义大小文本\n', 'GBK'));

// 重置为正常大小
printer.setTextNormal();
printer.print(ESCPOSPrinter.commands.LF);

// 切纸并关闭
printer.print(ESCPOSPrinter.commands.CUT);
printer.close();
```

### 混合打印示例（文字、图片、二维码）
```javascript
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');
const printer = new ESCPOSPrinter('Your Printer Name');

async function printMixed() {
    try {
        // 1. 打印标题
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.INIT,
            ESCPOSPrinter.commands.ALIGN_CENTER,
            ESCPOSPrinter.commands.CHINESE_MODE,
            ESCPOSPrinter.commands.BOLD_ON,
            ESCPOSPrinter.commands.TEXT_DOUBLE_SIZE,
            printer.textToBuffer('商店名称\n', 'GBK'),
            ESCPOSPrinter.commands.TEXT_NORMAL,
            ESCPOSPrinter.commands.BOLD_OFF
        ]));

        // 2. 打印 LOGO
        await printer.printImage('./logo.png', {
            width: 300,    // 稍小的宽度使 LOGO 更美观
            dither: true
        });

        // 3. 打印商品信息
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.LF,
            ESCPOSPrinter.commands.ALIGN_LEFT,
            printer.textToBuffer('订单号：123456789\n', 'GBK'),
            printer.textToBuffer('日期：' + new Date().toLocaleString() + '\n', 'GBK'),
            printer.textToBuffer('------------------------\n', 'GBK'),
            printer.textToBuffer('商品信息：\n', 'GBK'),
            printer.textToBuffer('测试商品 1   x2   ￥18.00\n', 'GBK'),
            printer.textToBuffer('测试商品 2   x1   ￥12.00\n', 'GBK'),
            printer.textToBuffer('------------------------\n', 'GBK'),
            ESCPOSPrinter.commands.ALIGN_RIGHT,
            printer.textToBuffer('总计：￥30.00\n', 'GBK')
        ]));

        // 4. 打印二维码
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.LF,
            ESCPOSPrinter.commands.ALIGN_CENTER,
            printer.textToBuffer('扫码关注我们\n', 'GBK')
        ]));

        printer.printQRCode('https://github.com/MixGeeker/ESCPOS-for-Windows', {
            size: 8,
            errorLevel: 49
        });

        // 5. 打印页尾和切纸
        printer.print(Buffer.concat([
            ESCPOSPrinter.commands.LF,
            ESCPOSPrinter.commands.LF,
            printer.textToBuffer('谢谢惠顾\n', 'GBK'),
            ESCPOSPrinter.commands.LF,
            ESCPOSPrinter.commands.CUT
        ]));

        printer.close();
    } catch (error) {
        console.error('打印失败：', error);
        printer.close();
    }
}

printMixed();
```

### 获取打印机列表示例
```javascript
const ESCPOSPrinter = require('@mixgeeker/node-escpos-win');

// 获取所有打印机列表
const printers = ESCPOSPrinter.getPrinterList();

// 打印所有打印机信息
printers.forEach(printer => {
    console.log(`打印机名称: ${printer.name}`);
    console.log(`描述: ${printer.description}`);
    console.log(`是否默认: ${printer.isDefault}`);
    console.log('------------------------');
});

// 使用第一个打印机
if (printers.length > 0) {
    const printer = new ESCPOSPrinter(printers[0].name);
    // ... 使用打印机进行打印
    printer.close();
}
```

## 获取打印机名称

在 Windows PowerShell 中运行以下命令可以获取系统中已安装的打印机名称：

```powershell
Get-Printer | Select-Object Name
```

## 注意事项

1. 确保打印机已正确安装并在 Windows 系统中可见
2. 使用管理员权限运行 Node.js 应用程序可能会获得更好的打印机访问权限
3. 某些 ESC/POS 命令可能需要根据具体打印机型号进行调整
4. 中文打印使用 GBK 编码，确保文本内容为正确的中文字符
5. 二维码打印时，如果内容包含中文，需要使用 `textToBuffer` 方法进行 GBK 编码转换
6. 条形码数据必须符合对应条形码类型的规范
7. 图片打印建议：
   - 使用黑白或灰度图片以获得最佳效果
   - 图片宽度建议不超过打印纸宽度（58mm 打印纸最大 384 点）
   - 对于照片类图片，建议启用抖动算法以获得更好的灰度效果
   - LOGO 类图片建议使用较小的 threshold 值以保持图片清晰度

## 版本历史

### v2.0.0
- 新增 ESM 入口 `index.mjs`，支持 `import` 导入
- 新增 TypeScript 类型声明 `index.d.ts`
- `package.json` 增加 `exports`/`module`/`types`，同时兼容 CJS 与 ESM
- 文档更新：示例增加 ESM/TS 用法与迁移指南

### v1.0.14
- 添加字体类型设置功能（FONT_A和FONT_B）
- 优化文本大小设置功能，支持自定义大小
- 添加便捷方法设置字体类型和大小
- 优化测试文件，展示更多打印功能

### v1.0.13
- 完善图片打印功能文档
- 添加详细的图片打印使用指南

### v1.0.12
- 我忘记编译了，编译重新上传

### v1.0.11
- 添加获取打印机列表功能
- 支持查看打印机详细信息
- 支持识别默认打印机

### v1.0.10
- 完善图片打印功能文档
- 添加详细的图片打印使用指南
- 优化图片打印测试工具
- 添加更多图片打印建议和最佳实践

### v1.0.9
- 完善图片打印功能
- 添加图片打印测试工具
- 优化图片处理算法
- 改进文档说明

### v1.0.8
- 修复中文字符编码问题
- 改进 Windows API 的调用方式
- 优化内存管理
- 增强字符串处理的稳定性

### v1.0.7
- 添加二维码打印功能
- 完善文档说明

### v1.0.6 及更早
- 我忘记改引用名了，改了重新上传
- 基础打印功能
- 条形码支持
- 中文支持

## 许可证

MIT

## 问题反馈

如果你在使用过程中遇到任何问题，请在 [GitHub Issues](https://github.com/MixGeeker/ESCPOS-for-Windows/issues) 中提出。