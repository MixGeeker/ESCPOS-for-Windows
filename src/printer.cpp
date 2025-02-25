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
    std::string printerName;

    Napi::Value Print(const Napi::CallbackInfo& info);
    Napi::Value Close(const Napi::CallbackInfo& info);
    
    bool SendDataToPrinter(const std::vector<unsigned char>& data);
};

Napi::FunctionReference Printer::constructor;

Napi::Object Printer::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "Printer", {
        InstanceMethod("print", &Printer::Print),
        InstanceMethod("close", &Printer::Close)
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

    this->printerName = info[0].As<Napi::String>().Utf8Value();
    this->printerHandle = NULL;

    PRINTER_DEFAULTS pd = {0};
    pd.DesiredAccess = PRINTER_ACCESS_USE;

    if (!OpenPrinterA((LPSTR)this->printerName.c_str(), &this->printerHandle, &pd)) {
        Napi::Error::New(env, "Failed to open printer").ThrowAsJavaScriptException();
        return;
    }
}

bool Printer::SendDataToPrinter(const std::vector<unsigned char>& data) {
    if (!this->printerHandle) return false;

    DOC_INFO_1A docInfo = {0};
    docInfo.pDocName = (LPSTR)"ESC/POS Print Job";
    docInfo.pOutputFile = NULL;
    docInfo.pDatatype = (LPSTR)"RAW";

    if (StartDocPrinterA(this->printerHandle, 1, (LPBYTE)&docInfo)) {
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

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return Printer::Init(env, exports);
}

NODE_API_MODULE(escpos_printer, Init) 