const categories = ["CPU", "MAINBOARD", "RAM", "SSD", "HDD", "VGA", "Nguồn", "Vỏ Case", "Màn hình", "Bàn phím", "Chuột", "Tai nghe", "Phụ kiện"];

let build = JSON.parse(localStorage.getItem("build")) || {};

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";
  let total = 0;

  categories.forEach((cat, i) => {
    const item = build[cat] || {};
    const name = item.name || "";
    const price = item.price || 0;
    const qty = item.qty || 1;
    const warranty = item.warranty || "";
    total += price * qty;

    list.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td><input placeholder="${cat}" value="${name}" onchange="update('${cat}', 'name', this.value)"></td>
        <td>
          <input type="text" value="${price === 0 ? '0' : price.toLocaleString('vi-VN')}"
            oninput="let v = this.value.replace(/[^0-9]/g, ''); this.value = v ? parseInt(v).toLocaleString('vi-VN') : '';"
            onchange="update('${cat}', 'price', this.value.replace(/\\./g, ''))">
        </td>
        <td><input type="number" value="${qty}" onchange="update('${cat}', 'qty', this.value)"></td>
        <td>
         <div class="warranty-box">
          <input type="number" value="${warranty}" onchange="update('${cat}', 'warranty', this.value)">
            <span>Tháng</span>
          </div>
        </td>
      </tr>`;
  });

  document.getElementById("totalTop").innerText = money(total);
  document.getElementById("totalBottom").innerText = money(total);
  localStorage.setItem("build", JSON.stringify(build));
}

function update(category, field, value) {
  if (!build[category]) build[category] = { name: "", price: 0, qty: 1, warranty: "" };
  if (field === "price" || field === "qty") value = parseInt(value) || 0;
  build[category][field] = value;
  render();
}

function money(n) {
  return (n || 0).toLocaleString('vi-VN') + " ₫";
}

function resetBuild() {
  build = {};
  localStorage.removeItem("build");
  render();
}

// Hàm này được gọi từ button trong HTML
function handleExport() {
    // Gọi hàm từ file export-excel.js
    exportExcel(categories, build, money);
}

render();