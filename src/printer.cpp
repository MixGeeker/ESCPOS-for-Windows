#include <napi.h>
#include <windows.h>
#include <string>
#include <vector>

class Printer : public Napi::ObjectWrap<Printer> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Printer(const Napi::CallbackInfo& info);

private:
    static Napi::FunctionReference constructor;
    HANDLE printerHandle;
    std::wstring printerName;
    std::vector<wchar_t> docName;
    std::vector<wchar_t> dataType;

    Napi::Value Print(const Napi::CallbackInfo& info);
    Napi::Value Close(const Napi::CallbackInfo& info);
    static Napi::Value GetPrinterList(const Napi::CallbackInfo& info);

    bool SendDataToPrinter(const std::vector<unsigned char>& data);
};

Napi::FunctionReference Printer::constructor;

Napi::Object Printer::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "Printer", {
        InstanceMethod("print", &Printer::Print),
        InstanceMethod("close", &Printer::Close),
        StaticMethod("getPrinterList", &Printer::GetPrinterList)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Printer", func);
    return exports;
}

Printer::Printer(const Napi::CallbackInfo& info) : Napi::ObjectWrap<Printer>(info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Printer name expected").ThrowAsJavaScriptException();
        return;
    }

    std::string utf8Name = info[0].As<Napi::String>().Utf8Value();

    // 转换为宽字符
    int wlen = MultiByteToWideChar(CP_UTF8, 0, utf8Name.c_str(), -1, NULL, 0);
    std::vector<wchar_t> wstr(wlen);
    MultiByteToWideChar(CP_UTF8, 0, utf8Name.c_str(), -1, wstr.data(), wlen);
    this->printerName = std::wstring(wstr.data());

    // 初始化文档名称和数据类型
    const wchar_t* docNameStr = L"ESC/POS Print Job";
    const wchar_t* dataTypeStr = L"RAW";
    this->docName.assign(docNameStr, docNameStr + wcslen(docNameStr) + 1);
    this->dataType.assign(dataTypeStr, dataTypeStr + wcslen(dataTypeStr) + 1);

    this->printerHandle = NULL;
    PRINTER_DEFAULTSW pd = {0};
    pd.DesiredAccess = PRINTER_ACCESS_USE;

    if (!OpenPrinterW((LPWSTR)this->printerName.c_str(), &this->printerHandle, &pd)) {
        Napi::Error::New(env, "Failed to open printer").ThrowAsJavaScriptException();
        return;
    }
}

bool Printer::SendDataToPrinter(const std::vector<unsigned char>& data) {
    if (!this->printerHandle) return false;

    DOC_INFO_1W docInfo = {0};
    docInfo.pDocName = this->docName.data();
    docInfo.pOutputFile = NULL;
    docInfo.pDatatype = this->dataType.data();

    if (StartDocPrinterW(this->printerHandle, 1, (LPBYTE)&docInfo)) {
        DWORD dwWritten = 0;
        if (StartPagePrinter(this->printerHandle)) {
            WritePrinter(this->printerHandle, (LPVOID)data.data(), (DWORD)data.size(), &dwWritten);
            EndPagePrinter(this->printerHandle);
        }
        EndDocPrinter(this->printerHandle);
        return dwWritten == data.size();
    }
    return false;
}

Napi::Value Printer::Print(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsBuffer()) {
        Napi::TypeError::New(env, "Buffer expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Buffer<unsigned char> buffer = info[0].As<Napi::Buffer<unsigned char>>();
    std::vector<unsigned char> data(buffer.Data(), buffer.Data() + buffer.Length());

    bool success = SendDataToPrinter(data);
    return Napi::Boolean::New(env, success);
}

Napi::Value Printer::Close(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (this->printerHandle) {
        ClosePrinter(this->printerHandle);
        this->printerHandle = NULL;
    }

    return env.Undefined();
}

Napi::Value Printer::GetPrinterList(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    DWORD needed = 0, returned = 0;
    EnumPrintersW(PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS, NULL, 2, NULL, 0, &needed, &returned);

    if (needed == 0) {
        return Napi::Array::New(env);
    }

    std::vector<BYTE> buffer(needed);
    PRINTER_INFO_2W* printerInfo = reinterpret_cast<PRINTER_INFO_2W*>(buffer.data());

    if (!EnumPrintersW(PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS, NULL, 2, buffer.data(), needed, &needed, &returned)) {
        Napi::Error::New(env, "Failed to enumerate printers").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array printerList = Napi::Array::New(env, returned);

    for (DWORD i = 0; i < returned; i++) {
        Napi::Object printer = Napi::Object::New(env);

        // 转换打印机名称为UTF8
        int utf8Length = WideCharToMultiByte(CP_UTF8, 0, printerInfo[i].pPrinterName, -1, NULL, 0, NULL, NULL);
        std::vector<char> utf8Name(utf8Length);
        WideCharToMultiByte(CP_UTF8, 0, printerInfo[i].pPrinterName, -1, utf8Name.data(), utf8Length, NULL, NULL);

        // 转换打印机描述为UTF8
        utf8Length = WideCharToMultiByte(CP_UTF8, 0, printerInfo[i].pComment ? printerInfo[i].pComment : L"", -1, NULL, 0, NULL, NULL);
        std::vector<char> utf8Comment(utf8Length);
        WideCharToMultiByte(CP_UTF8, 0, printerInfo[i].pComment ? printerInfo[i].pComment : L"", -1, utf8Comment.data(), utf8Length, NULL, NULL);

        printer.Set("name", utf8Name.data());
        printer.Set("description", utf8Comment.data());
        printer.Set("isDefault", (printerInfo[i].Attributes & PRINTER_ATTRIBUTE_DEFAULT) != 0);

        printerList[i] = printer;
    }

    return printerList;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return Printer::Init(env, exports);
}

NODE_API_MODULE(escpos_printer, Init)