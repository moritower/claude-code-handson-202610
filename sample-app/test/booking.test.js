// 自動テストの見本です。`npm test` で実行できます。
// フェーズ3 では、Claude Code にここへテストを追加してもらいます。

import { test } from "node:test";
import assert from "node:assert/strict";
import { remainingSeats, isSoldOut, canBook, canCancel } from "../src/booking.js";

const perf = { id: "p1", capacity: 6, minPlayers: 4 };
// 期限判定テスト用：公演日時（JST, TZ表記なし）付きの公演
const perfWithDate = { id: "p1", capacity: 6, minPlayers: 4, datetime: "2026-10-18T18:30" };

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

// ── canCancel（キャンセル可否の判定）────────────────────────────

test("公演前日まではキャンセルできる", () => {
  const booking = { performanceId: "p1", status: "confirmed" };
  const now = new Date("2026-10-17T23:59:59+09:00"); // 前日 JST
  assert.equal(canCancel(perfWithDate, booking, now).ok, true);
});

test("公演当日 00:00(JST) 以降はキャンセルできない", () => {
  const booking = { performanceId: "p1", status: "confirmed" };
  const now = new Date("2026-10-18T00:00:00+09:00"); // 当日 JST
  const result = canCancel(perfWithDate, booking, now);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "公演前日までにキャンセルしてください");
});

test("すでにキャンセル済みなら再キャンセルできない（判定はキャンセル済みが優先）", () => {
  const booking = { performanceId: "p1", status: "cancelled" };
  const now = new Date("2026-10-17T10:00:00+09:00"); // 期限内でも
  const result = canCancel(perfWithDate, booking, now);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "すでにキャンセル済みです");
});

// 【演習】minPlayers（最少催行人数）に関するテストを、
//         Claude Code に追加してもらいましょう。
