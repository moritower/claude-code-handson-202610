// マーダーミステリー予約の「ドメインロジック」を集めたファイルです。
// ここは "純粋な関数" だけを置きます（画面や通信のことは考えない）。
// → こうしておくと、フェーズ3 で自動テストが書きやすくなります。

/**
 * 確定している予約の合計人数を数える。
 * status が "confirmed" の予約だけを対象にする。
 */
export function bookedSeats(performance, bookings) {
  return bookings
    .filter((b) => b.performanceId === performance.id && b.status === "confirmed")
    .reduce((sum, b) => sum + b.partySize, 0);
}

/**
 * 残席数を返す。（定員 - 確定済み人数）
 */
export function remainingSeats(performance, bookings) {
  return performance.capacity - bookedSeats(performance, bookings);
}

/**
 * 満席かどうか。
 */
export function isSoldOut(performance, bookings) {
  return remainingSeats(performance, bookings) <= 0;
}

/**
 * 予約できるかどうかを判定する。
 * 予約 OK なら { ok: true }、ダメなら { ok: false, reason: "理由" } を返す。
 */
export function canBook(performance, bookings, partySize) {
  if (!Number.isInteger(partySize) || partySize < 1) {
    return { ok: false, reason: "人数は1以上の整数で指定してください" };
  }
  const remaining = remainingSeats(performance, bookings);
  if (partySize > remaining) {
    return { ok: false, reason: `残席が足りません（残り ${remaining} 席）` };
  }
  return { ok: true };
}

/**
 * 日時（または日付文字列）を JST の年月日の数値 YYYYMMDD に変換する。
 * 例: "2026-10-18T18:30" → 20261018
 * - 文字列（TZ表記なし）は JST の暦日として先頭 10 文字をそのまま使う。
 * - Date（現在時刻など）は UTC+9 に補正してから JST の暦日を取り出す。
 */
function toJstDateNumber(value) {
  if (typeof value === "string") {
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    return y * 10000 + m * 100 + d;
  }
  // Date を JST(UTC+9) に補正し、UTC 系メソッドで暦日を読む
  const jst = new Date(value.getTime() + 9 * 60 * 60 * 1000);
  return jst.getUTCFullYear() * 10000 + (jst.getUTCMonth() + 1) * 100 + jst.getUTCDate();
}

/**
 * キャンセルできるかどうかを判定する純粋関数。
 * 予約の存在確認（404）は store/HTTP 層の責務なので、ここには含めない。
 * 判定順: ① キャンセル済み → ② 期限切れ（公演当日以降） → OK
 * @param {object} performance 対象公演
 * @param {object} booking 対象予約
 * @param {Date} now 現在時刻（テストで固定値を注入できるよう引数で受け取る）
 */
export function canCancel(performance, booking, now) {
  if (booking.status === "cancelled") {
    return { ok: false, reason: "すでにキャンセル済みです" };
  }
  // 公演日の前日末（JST）まで可。公演日の 00:00(JST) 以降は不可。
  // 文字列の辞書順ではなく、JST の年月日の数値で比較する。
  if (toJstDateNumber(now) >= toJstDateNumber(performance.datetime)) {
    return { ok: false, reason: "公演前日までにキャンセルしてください" };
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
// 🚧 ここから下は「演習で Claude Code と一緒に実装する」部分です。
//    最初はコメントアウトされています。フェーズ1〜2 で育てていきます。
// ─────────────────────────────────────────────────────────────

// 【演習A】最少催行人数（minPlayers）に届いているか判定する関数
//   例: export function isConfirmedToRun(performance, bookings) { ... }

// 【演習B】キャンセル待ち（waitlist）の考え方を導入する
//   満席のときに予約を "waitlist" として受け付けられるようにする

// 【演習C】キャンセルされた席を、キャンセル待ちの人へ繰り上げる関数
