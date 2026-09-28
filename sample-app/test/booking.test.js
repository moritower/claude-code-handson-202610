// 自動テストの見本です。`npm test` で実行できます。
// フェーズ3 では、Claude Code にここへテストを追加してもらいます。

import { test } from "node:test";
import assert from "node:assert/strict";
import { remainingSeats, isSoldOut, canBook } from "../src/booking.js";

const perf = { id: "p1", capacity: 6, minPlayers: 4 };

test("残席は 定員 - 確定人数 で計算される", () => {
  const bookings = [
    { performanceId: "p1", partySize: 2, status: "confirmed" },
    { performanceId: "p1", partySize: 1, status: "confirmed" },
  ];
  assert.equal(remainingSeats(perf, bookings), 3);
});

test("キャンセル済みは残席計算に含めない", () => {
  const bookings = [
    { performanceId: "p1", partySize: 2, status: "confirmed" },
    { performanceId: "p1", partySize: 3, status: "cancelled" },
  ];
  assert.equal(remainingSeats(perf, bookings), 4);
});

test("残席ちょうどなら予約OK、超えるとNG", () => {
  const bookings = [{ performanceId: "p1", partySize: 4, status: "confirmed" }];
  assert.equal(canBook(perf, bookings, 2).ok, true);
  assert.equal(canBook(perf, bookings, 3).ok, false);
});

test("残席0なら満席", () => {
  const bookings = [{ performanceId: "p1", partySize: 6, status: "confirmed" }];
  assert.equal(isSoldOut(perf, bookings), true);
});

// 【演習】minPlayers（最少催行人数）に関するテストを、
//         Claude Code に追加してもらいましょう。
