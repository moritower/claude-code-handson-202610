// 画面側のスクリプト。API を呼んで一覧を表示し、予約フォームを送信します。

const listEl = document.getElementById("performance-list");
const selectEl = document.getElementById("performanceId");
const formEl = document.getElementById("booking-form");
const messageEl = document.getElementById("message");
const bookingListEl = document.getElementById("booking-list");
const cancelMessageEl = document.getElementById("cancel-message");

// 公演IDからタイトルを引くための対応表（予約一覧の表示に使う）
let performanceTitles = {};

// 画面に出すテキストは最低限エスケープする（名前はユーザー入力のため）
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

async function loadPerformances() {
  const res = await fetch("/api/performances");
  const performances = await res.json();

  // 一覧カードを描画
  listEl.innerHTML = performances
    .map(
      (p) => `
      <div class="card ${p.soldOut ? "soldout" : ""}">
        <h3>${p.title}</h3>
        <p>📅 ${p.datetime.replace("T", " ")}</p>
        <p>📍 ${p.venue}</p>
        <p>💴 ${p.price.toLocaleString()}円</p>
        <p class="seats">残席: ${p.remaining} / ${p.capacity}
          ${p.soldOut ? '<span class="badge">満席</span>' : ""}</p>
      </div>`
    )
    .join("");

  // 予約フォームのプルダウンを更新（満席は選べないように）
  selectEl.innerHTML = performances
    .map(
      (p) =>
        `<option value="${p.id}" ${p.soldOut ? "disabled" : ""}>${p.title}${
          p.soldOut ? "（満席）" : ""
        }</option>`
    )
    .join("");

  // 予約一覧の公演名表示用に対応表を更新
  performanceTitles = Object.fromEntries(performances.map((p) => [p.id, p.title]));
}

async function loadBookings() {
  const res = await fetch("/api/bookings");
  const bookings = await res.json();

  if (bookings.length === 0) {
    bookingListEl.innerHTML = "<p>予約はまだありません。</p>";
    return;
  }

  bookingListEl.innerHTML = bookings
    .map((b) => {
      const title = performanceTitles[b.performanceId] ?? b.performanceId;
      const cancelled = b.status === "cancelled";
      return `
      <div class="card ${cancelled ? "cancelled" : ""}">
        <p><strong>${escapeHtml(b.name)}</strong> 様 / ${b.partySize}名</p>
        <p>🎭 ${escapeHtml(title)}（予約番号: ${b.id}）</p>
        <p>状態: ${cancelled ? "キャンセル済み" : "予約中"}</p>
        ${cancelled ? "" : `<button class="cancel-btn" data-id="${b.id}">キャンセル</button>`}
      </div>`;
    })
    .join("");
}

// キャンセルボタン（イベント委譲）
bookingListEl.addEventListener("click", async (e) => {
  const btn = e.target.closest(".cancel-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  if (!confirm(`予約番号 ${id} をキャンセルしますか？`)) return;

  cancelMessageEl.textContent = "";
  const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
  const data = await res.json();

  if (res.ok) {
    cancelMessageEl.textContent = `✅ 予約番号 ${data.id} をキャンセルしました`;
    cancelMessageEl.className = "ok";
  } else {
    cancelMessageEl.textContent = `⚠️ ${data.error}`;
    cancelMessageEl.className = "ng";
  }
  // 残席と予約一覧を再取得（残席が戻る／状態が変わる）
  await loadPerformances();
  await loadBookings();
});



formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageEl.textContent = "";

  const body = {
    performanceId: selectEl.value,
    name: document.getElementById("name").value,
    partySize: Number(document.getElementById("partySize").value),
  };

  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (res.ok) {
    messageEl.textContent = `✅ 予約が完了しました（予約番号: ${data.id}）`;
    messageEl.className = "ok";
    formEl.reset();
    loadPerformances();
    loadBookings();
  } else {
    messageEl.textContent = `⚠️ ${data.error}`;
    messageEl.className = "ng";
  }
});

// 初回表示：公演一覧を読んでから予約一覧を描画（公演名の対応表が先に必要）
loadPerformances().then(loadBookings);
