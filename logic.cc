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

// convert input string from electron to matrix
vvi NapiStrToVector(const CallbackInfo &info_container)
{
    auto str = info_container[0].ToString();

    istringstream is;
    is.str(str);

    int n;
    is >> n;

    vvi mx(n, vec<int>(n));

    for (size_t i = 0; i < n; i++)
    {
        for (size_t j = 0; j < n; j++)
        {
            is >> mx[i][j];
        }
    }

    return mx;
}

Object Compute_str(const CallbackInfo &info)
{
    Env env = info.Env();

    if (info.Length() < 1)
    {
        Object err = Object::New(env);
        err.Set(String::New(env, "error"),
                String::New(env, "not enough parameters"));

        return err;
    }

    auto mx = NapiStrToVector(info);

    auto out_str = find_scc(mx);

    Object result = Object::New(env);
    result.Set(String::New(env, "scc"), String::New(env, out_str));

    return result;
}

Object Init(Env env, Object exports)
{
    exports.Set(String::New(env, "compute_str"),
                Function::New(env, Compute_str));

    return exports;
}

NODE_API_MODULE(native, Init)
