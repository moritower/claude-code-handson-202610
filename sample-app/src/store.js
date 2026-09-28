// データの置き場所（今回はメモリ上だけ。サーバーを再起動すると消えます）。
// 本格運用では DB を使いますが、ハンズオンでは分かりやすさを優先しています。

let performances = [];
let bookings = [];
let nextBookingId = 1;

/** デモ用の公演データを入れ直す */
export function seed() {
  performances = [
    {
      id: "p1",
      title: "霧の館の殺人",
      datetime: "2026-10-10T19:00",
      venue: "新宿スタジオ A",
      capacity: 6,
      minPlayers: 4,
      price: 3500,
    },
    {
      id: "p2",
      title: "最後の晩餐会",
      datetime: "2026-10-12T14:00",
      venue: "渋谷ホール B",
      capacity: 8,
      minPlayers: 5,
      price: 4000,
    },
    {
      id: "p3",
      title: "沈黙の灯台",
      datetime: "2026-10-18T18:30",
      venue: "横浜ルーム C",
      capacity: 5,
      minPlayers: 4,
      price: 3000,
    },
  ];
  bookings = [
    { id: "b_demo", performanceId: "p1", name: "サンプル太郎", partySize: 2, status: "confirmed", createdAt: new Date().toISOString() },
  ];
  nextBookingId = 1;
}

export function getPerformances() {
  return performances;
}

export function getPerformance(id) {
  return performances.find((p) => p.id === id);
}

export function getBookings() {
  return bookings;
}

export function addBooking({ performanceId, name, partySize, status }) {
  const booking = {
    id: `b${nextBookingId++}`,
    performanceId,
    name,
    partySize,
    status: status ?? "confirmed",
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  return booking;
}

// 【演習】キャンセル処理（status を "cancelled" にする）をここに追加します。
// export function cancelBooking(id) { ... }

seed();
