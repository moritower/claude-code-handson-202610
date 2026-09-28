// 画面側のスクリプト。API を呼んで一覧を表示し、予約フォームを送信します。

const listEl = document.getElementById("performance-list");
const selectEl = document.getElementById("performanceId");
const formEl = document.getElementById("booking-form");
const messageEl = document.getElementById("message");

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
}

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
  } else {
    messageEl.textContent = `⚠️ ${data.error}`;
    messageEl.className = "ng";
  }
});

loadPerformances();
