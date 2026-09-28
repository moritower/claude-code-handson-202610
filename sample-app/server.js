// 予約管理システムの Web サーバー本体です。
// Express という定番ライブラリを使っています。
// 画面（public/）を配信しつつ、/api 以下で予約データをやり取りします。

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPerformances, getPerformance, getBookings, addBooking } from "./src/store.js";
import { remainingSeats, isSoldOut, canBook } from "./src/booking.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 公演一覧（残席と満席フラグを付けて返す）
app.get("/api/performances", (req, res) => {
  const bookings = getBookings();
  const list = getPerformances().map((p) => ({
    ...p,
    remaining: remainingSeats(p, bookings),
    soldOut: isSoldOut(p, bookings),
  }));
  res.json(list);
});

// 予約作成
app.post("/api/bookings", (req, res) => {
  const { performanceId, name, partySize } = req.body ?? {};
  const performance = getPerformance(performanceId);

  if (!performance) {
    return res.status(404).json({ error: "公演が見つかりません" });
  }
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "お名前を入力してください" });
  }

  const check = canBook(performance, getBookings(), Number(partySize));
  if (!check.ok) {
    return res.status(400).json({ error: check.reason });
  }

  const booking = addBooking({ performanceId, name, partySize: Number(partySize) });
  res.status(201).json(booking);
});

// 予約一覧（管理画面用）
app.get("/api/bookings", (req, res) => {
  res.json(getBookings());
});

// 【演習】予約キャンセルのエンドポイント（DELETE /api/bookings/:id）をここに追加します。

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`予約システム起動: http://localhost:${PORT}`);
});
