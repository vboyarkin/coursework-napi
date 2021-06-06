using namespace std;

#include <limits.h>
#include <math.h>

#include <algorithm>
#include <functional>
#include <iomanip>
#include <iostream>
#include <limits>
#include <map>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <vector>
#define all(x) x.begin(), x.end()
#define vec vector
#define fi first
#define sec second
typedef long long ll;
typedef unsigned long long ull;
typedef pair<int, int> pii;
typedef pair<ll, ll> pll;
typedef vec<vec<int>> vvi;
typedef vec<vec<ll>> vvll;

string mx_begin = "\\begin{pmatrix}";
string mx_end = "\\end{pmatrix}";
string md = " & ";
string nl = " \\\\";

vvi mx_zero(int N) { return vvi(N, vec<int>(N)); }

vvi mx_read(int N) {
    // read mx
    vvi mx(N, vec<int>(N));
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            cin >> mx[i][j];
        }
    }

    return mx;
}

vvi mx_prod_bin(vvi &a, vvi &b) {
    int rows = a.size();
    int cols = b[0].size();
    vvi mult(rows, vec<int>(cols));

    if (a[0].size() != b.size()) cout << "bad mx size!\n";

    for (int i = 0; i < rows; ++i)
        for (int j = 0; j < cols; ++j)
            for (int k = 0; k < a[0].size(); ++k) {
                mult[i][j] = (mult[i][j] ^ (a[i][k] * b[k][j]));
            }

    return mult;
}
vvi mx_prod_old(vvi &a, vvi &b) {
    int rows = a.size();
    int cols = b[0].size();
    vvi mult(rows, vec<int>(cols));

    if (a[0].size() != b.size()) cout << "bad mx size!\n";

    for (int i = 0; i < rows; ++i)
        for (int j = 0; j < cols; ++j)
            for (int k = 0; k < a[0].size(); ++k) {
                mult[i][j] += a[i][k] * b[k][j];
            }

    return mult;
}

vvi mx_apply(vvi &a, vvi &b, function<int(int, int)> action) {
    if (a.size() != b.size() || a[0].size() != b[0].size())
        cout << "mx_apply: a & b sizes are not the same!";

    vvi result(a.size(), vec<int>(a[0].size()));

    for (size_t row = 0; row < a.size(); row++) {
        for (size_t col = 0; col < a[0].size(); col++) {
            result[row][col] = action(a[row][col], b[row][col]);
        }
    }

    return result;
}
vvi mx_apply(vvi &a, function<int(int)> action) {
    vvi result(a.size(), vec<int>(a[0].size()));

    for (size_t row = 0; row < a.size(); row++) {
        for (size_t col = 0; col < a[0].size(); col++) {
            result[row][col] = action(a[row][col]);
        }
    }

    return result;
}
vvi mx_e(int N) {
    vvi result(N, vec<int>(N));

    for (size_t row = 0; row < N; row++) {
        result[row][row] = 1;
    }

    return result;
}

void mx_print(vvi &mx, int INF = INT16_MAX) {
    cout << mx_begin << '\n';

    for (size_t row_i = 0; row_i < mx.size(); row_i++) {
        auto row = mx[row_i];

        for (size_t i = 0; i < row.size() - 1; i++) {
            // cout << row[i] << md;
            int entry = row[i];

            if (entry == INF) {
                cout << "\\infty";
            } else {
                cout << entry;
            }

            cout << md;
        }
        int entry = row[row.size() - 1];
        if (entry == INF) {
            cout << "\\inf";
        } else {
            cout << entry;
        }

        if (row_i != mx.size() - 1) cout << nl;

        cout << '\n';
    }

    cout << mx_end << '\n';
}

void clear_col(vvi &A, size_t col_to_clear) {
    for (size_t row = 0; row < A.size(); row++) {
        A[row][col_to_clear] = 0;
    }
}

///
int action_or(int l, int r) { return l || r; }
int action_and(int l, int r) { return l && r; }
vvi mx_bit_or(vvi &a, vvi &b) { return mx_apply(a, b, action_or); }
vvi mx_bit_and(vvi &a, vvi &b) { return mx_apply(a, b, action_and); }
vvi tran(vvi &a) {
    const int N = a.size();

    auto result = mx_zero(N);

    for (size_t i = 0; i < N; i++) {
        for (size_t j = 0; j < N; j++) {
            //    auto temp = a[i][j] ;
            //    a[i][j] = a[j][i];
            //    a[j][i] = temp;
            result[i][j] = a[j][i];
        }
    }

    return result;
}

vvi warshall_iter(vvi &T_old, int k) {
    const int N = T_old.size();

    if (k == 0) {
        return mx_bit_or(mx_e(N), T_old);
    } else {
        vvi result = mx_zero(N);

        k--;

        for (size_t i = 0; i < N; i++) {
            for (size_t j = 0; j < N; j++) {
                result[i][j] = T_old[i][j] || (T_old[i][k] && T_old[k][j]);
            }
        }

        return result;
    }
}
vvi warshall(vvi &A) {
    const int N = A.size();
    vvi T(A);

    for (size_t k = 0; k <= N; k++) {
        T = warshall_iter(T, k);

        // cout << "T^{(" << k << ")} = ";
        // mx_print(T);
    }

    return T;
}

vvi extract_scc(vvi A) {
    vector<int> row(A.size());
    const int n = A.size();

    vvi all_scc;

    for (size_t row_i = 0; row_i < n; row_i++) {
        auto row = A[row_i];

        vec<int> cur_scc;

        for (size_t col = 0; col < n; col++) {
            if (row[col] == 1) {
                cur_scc.push_back(col);
                clear_col(A, col);
            }
        }

        if (cur_scc.size() != 0) all_scc.push_back(cur_scc);
    }

    return all_scc;
}

string find_scc(vvi &mx) {
    auto T = warshall(mx);
    auto T_trans = tran(T);

    // T & T_trans
    auto S = mx_apply(T, T_trans, action_and);

    auto all_scc = extract_scc(S);

    ostringstream os;

    for (auto &scc : all_scc) {
        for (auto &vert : scc) {
            os << vert + 1 << ' ';
        }
        os << '\n';
    }

    return os.str();
}