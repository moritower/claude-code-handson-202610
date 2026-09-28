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

// ─────────────────────────────────────────────────────────────
// 🚧 ここから下は「演習で Claude Code と一緒に実装する」部分です。
//    最初はコメントアウトされています。フェーズ1〜2 で育てていきます。
// ─────────────────────────────────────────────────────────────

// 【演習A】最少催行人数（minPlayers）に届いているか判定する関数
//   例: export function isConfirmedToRun(performance, bookings) { ... }

// 【演習B】キャンセル待ち（waitlist）の考え方を導入する
//   満席のときに予約を "waitlist" として受け付けられるようにする

// 【演習C】キャンセルされた席を、キャンセル待ちの人へ繰り上げる関数
