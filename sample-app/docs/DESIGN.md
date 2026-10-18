# 設計: 予約のキャンセル機能

本書は `docs/SPEC.md`（仕様・受け入れ条件）を実装に落とすための設計と、
そこで下した**決定事項とその理由**をまとめたもの。実装着手前の計画を記録する。

関連: [SPEC.md](./SPEC.md)

## 1. 全体方針

既存のレイヤ分けを踏襲する:

- `src/booking.js` … 純粋関数（判定ロジック）。画面・通信・データ更新を含めない。
- `src/store.js` … データの保持と更新（`status` の書き換え）。
- `server.js` … HTTP の入出力。純粋関数で判定し、store で更新する。

**理由**: CLAUDE.md の約束（ドメインルールは `src/booking.js` に純粋関数で置く）に従う。
判定を純粋関数に切り出すことで、現在時刻やデータを引数注入でき、テストが安定する。

## 2. レイヤごとの設計

### 2.1 `src/booking.js`: `canCancel(performance, booking, now)`

キャンセル可否を判定する純粋関数。戻り値は既存の `canBook` と同じ
`{ ok: true }` / `{ ok: false, reason }` 形式に揃える。

判定順（SPEC「判定順」に対応）:

1. `booking.status === "cancelled"` → `{ ok:false, reason:"すでにキャンセル済みです" }`
2. 期限切れ（公演当日以降）→ `{ ok:false, reason:"公演前日までにキャンセルしてください" }`
3. それ以外 → `{ ok:true }`

> 「予約が存在するか」の 404 判定は store/HTTP 層の責務なので、この関数には渡さない
> （存在しない予約は `canCancel` を呼ぶ前に弾く）。

**決定: 期限判定は「公演日の前日末（JST）まで可」**

- `performance.datetime`（例 `"2026-10-18T18:30"`、TZ表記なし）を **JSTの日付**として解釈する。
- 公演日の **00:00:00（JST）以降**はキャンセル不可（＝前日 23:59:59 まで可）。
- 比較は文字列ではなく**年月日の数値**で行う（辞書順比較のバグを避ける）。
- `now` は**引数で受け取る**。`server.js` だけが `new Date()` を渡し、テストは固定値を渡す。

**理由**:
- 仕様で「前日まで」「JST固定」「`Date`/数値で比較」「`now` 注入」が明記されているため。
- `datetime` にTZが無く、`new Date()` のTZ依存で判定がブレるのを防ぐため、JSTの年月日に正規化してから比較する。

### 2.2 `src/store.js`: `cancelBooking(id)`

予約の `status` を `"confirmed"` → `"cancelled"` に更新する。

- `id` で予約を検索。無ければ `null` を返す（HTTP 層が 404 に変換）。
- 見つかった予約オブジェクトの `status` を直接書き換え、その予約を返す。
- **検索→更新を同一同期処理で完結**させ、途中に `await` を挟まない。

**決定: レコードは削除せず `status` を書き換える / 二重取り消しを防ぐ**

- `b_demo` のような既存予約も含め、履歴として残す。
- すでに `"cancelled"` のものは `canCancel` 側で弾くため、store は単純更新でよい。

**理由**:
- 仕様「レコードは削除せず cancelled に変更」「席を二重に戻さない」に対応。
- Node はシングルスレッドで、`await` を挟まない同期更新なら読み書きの割り込みが起きず、
  二重取り消しレースを構造的に防げる。

### 2.3 `server.js`: `DELETE /api/bookings/:id`

処理順（SPEC「判定順: ①存在 → ②キャンセル済み → ③期限」に一致）:

1. `cancelBooking` 対象を探すため、まず `getBookings()` から `:id` の予約を取得。
   - 無ければ `404 { error: "予約が見つかりません" }`。**他データは一切変更しない**。
2. 予約の公演を `getPerformance(booking.performanceId)` で取得。
3. `canCancel(performance, booking, new Date())` を評価。
   - `ok:false` なら `400 { error: reason }`（reason がキャンセル済み/期限切れを表す）。
4. `ok:true` なら `cancelBooking(id)` で更新し、`200` でキャンセル後の予約を返す。

**決定: 成功は `200` + キャンセル後の予約オブジェクト、再DELETEは `400`**

**理由**:
- 仕様のレスポンス定義に一致。学習用途では、再キャンセル時に 204 黙殺より
  `400 "すでにキャンセル済みです"` の方が挙動が分かりやすい（意図的な選択）。

## 3. 残席が戻る仕組み（既存ロジックの再利用）

残席・満席は `src/booking.js` の `remainingSeats` / `isSoldOut` が
`status === "confirmed"` のみを数える（bookedSeats）。
よって `status` を `"cancelled"` にするだけで、`GET /api/performances` の残席は自動的に戻る。
**新たな残席再計算ロジックは追加しない。**

## 4. 非対象（SPEC と同じ）

部分キャンセル / キャンセル待ち繰り上げ / minPlayers 連動 / 認証・認可 / キャンセルUI。

## 5. 前提・制約（SPEC と同じ）

- 認可なし（ID 連番で推測可能／学習用として許容）。
- 永続化なし（メモリ上、再起動で消える）。
- デモ公演に過去日付が含まれる場合があり、過去公演はキャンセル不可。動作確認は未来日付で。

## 6. 変更対象ファイル

- `src/booking.js` … `canCancel(performance, booking, now)` を追加（純粋関数）。
- `src/store.js` … `cancelBooking(id)` を追加。
- `server.js` … `DELETE /api/bookings/:id` を追加。
- `test/` … 受け入れ条件に対応するテストを追加。

## 7. 検証

- `npm test` が通ること。
- 受け入れ条件ベースで、成功 / 存在しないID(404) / キャンセル済み(400) / 期限切れ(400) /
  判定順 / 残席が戻る / 副作用なし を網羅する。
- `canCancel` のテストは `now` を固定値で注入し、前日末・当日00:00 の境界を確認する。
