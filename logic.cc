#include <napi.h>

#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "find_scc.cc"

using namespace Napi;
using namespace std;

#define all(x) x.begin(), x.end()
#define vec vector

typedef vec<vec<int>> vvi;

vvi NapiStrToVector(const CallbackInfo& info_container) {
    auto str = info_container[0].ToString();

    istringstream is;
    is.str(str);

    int n;
    is >> n;

    vvi mx(n, vec<int>(n));

    for (size_t i = 0; i < n; i++) {
        for (size_t j = 0; j < n; j++) {
            is >> mx[i][j];
        }
    }

    return mx;
}
vvi NapiArrToVector(const CallbackInfo& info, const int n) {
    // auto info = info_container[0].As<Object>();
    // auto info = info_container[0].ToObject();
    // const int n = info.Length();
    // auto temp_str  = static_cast<string>(info["0"]);
    // const int n = (info["0"]);
    // const int n = static_cast<int>(temp_str);

    vvi mx(n, vec<int>(n, -1));

    for (size_t i = 0; i < n; i++) {
        auto row = info[i].As<Array>();

        for (size_t j = 0; j < n; j++) {
            mx[i][j] = static_cast<Value>(row[j]).ToNumber().Int32Value();
        }
    }

    return mx;
}

Array _VectorToRow(Env env, vvi& mx, int row) {
    Array arr = Array::New(env, mx.size());
    // Napi::Int32Array int_arr = Napi::Int32Array::New(env, mx.size())
    // Napi::Value::As<Napi::Number>

    for (size_t col = 0; col < mx.size(); col++) {
        auto val = Number::New(env, mx[row][col]);
        // auto val = String::New(env, to_string((int)mx[row][col]);
        arr.Set(String::New(env, to_string((int)col)), val);
    }

    return arr;
}
Int32Array _TypedVectorToRow(Env env, vvi& mx, int row) {
    // Array arr = Array::New(env, mx.size());
    Napi::Int32Array int_arr = Napi::Int32Array::New(env, mx.size());

    for (size_t col = 0; col < mx.size(); col++) {
        // auto val = Number::New(env, mx[row][col]);
        auto val = mx[row][col];
        // auto val = String::New(env, to_string((int)mx[row][col]);
        // int_arr.Set(String::New(env, to_string((int)col)), val);
        // int_arr.Set(col, val);
        int_arr[col] = val;
    }

    return int_arr;
}
Object VectorToOutObject(Env env, vvi& mx) {
    Object obj = Object::New(env);

    for (size_t row = 0; row < mx.size(); row++) {
        // obj.Set(row, _VectorToRow(env, mx, row));
        obj.Set(row, _TypedVectorToRow(env, mx, row));
    }

    return obj;
}

Object Compute(const CallbackInfo& info) {
    Env env = info.Env();

    if (info.Length() < 1) {
        Object err = Object::New(env);
        err.Set(String::New(env, "error"),
                String::New(env, "not enough parameters"));

        return err;
    }

    auto mx = NapiArrToVector(info, 3);

    auto out_mx = VectorToOutObject(env, mx);

    auto test = vvi{{8, 2, 3}, {5, 8, -9}, {8, 0, 3}};

    Object result = Object::New(env);

    result.Set(1, out_mx);
    result.Set(2, mx.size());
    // result.Set(3, info.Length());
    return result;

    // return out_mx;
    return VectorToOutObject(env, test);

    // return _VectorToRow(env, mx, 1);
}
Object Compute_str(const CallbackInfo& info) {
    Env env = info.Env();

    if (info.Length() < 1) {
        Object err = Object::New(env);
        err.Set(String::New(env, "error"),
                String::New(env, "not enough parameters"));

        return err;
    }

    auto mx = NapiStrToVector(info);

    // auto out_mx = VectorToOutObject(env, mx);

    auto out_str = find_scc(mx);

    Object result = Object::New(env);
    result.Set(String::New(env, "scc"), String::New(env, out_str));

    return result;
}

Object Init(Env env, Object exports) {
    exports.Set(String::New(env, "compute_str"),
                Function::New(env, Compute_str));

    return exports;
}

NODE_API_MODULE(native, Init)
