// store.cancelBooking と、キャンセルで残席が戻ることのテスト。

import { test } from "node:test";
import assert from "node:assert/strict";
import { seed, getBookings, getPerformance, addBooking, cancelBooking } from "../src/store.js";
import { remainingSeats, isSoldOut } from "../src/booking.js";

test("cancelBooking で status が cancelled になり、席が残席に戻る", () => {
  seed();
  const p1 = getPerformance("p1"); // capacity 6, 既存 b_demo が 2 席
  assert.equal(remainingSeats(p1, getBookings()), 4);

  const b = addBooking({ performanceId: "p1", name: "追加太郎", partySize: 3 });
  assert.equal(remainingSeats(p1, getBookings()), 1);

  const cancelled = cancelBooking(b.id);
  assert.equal(cancelled.status, "cancelled");
  // 3 席が戻る
  assert.equal(remainingSeats(p1, getBookings()), 4);
});

test("満席からキャンセルすると満席が解除される", () => {
  seed();
  const p1 = getPerformance("p1");
  const b = addBooking({ performanceId: "p1", name: "満席太郎", partySize: 4 }); // 2+4=6 で満席
  assert.equal(isSoldOut(p1, getBookings()), true);

  cancelBooking(b.id);
  assert.equal(isSoldOut(p1, getBookings()), false);
});

test("存在しない予約IDは null を返し、副作用がない", () => {
  seed();
  const p1 = getPerformance("p1");
  const before = remainingSeats(p1, getBookings());
  const statusesBefore = getBookings().map((b) => b.status).join(",");

  const result = cancelBooking("does-not-exist");
  assert.equal(result, null);
  assert.equal(remainingSeats(p1, getBookings()), before);
  assert.equal(getBookings().map((b) => b.status).join(","), statusesBefore);
});
