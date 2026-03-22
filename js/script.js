const categories = [
  "CPU",
  "MAINBOARD",
  "RAM",
  "SSD",
  "HDD",
  "VGA",
  "Nguồn",
  "Vỏ Case",
  "Màn hình",
  "Bàn phím",
  "Chuột",
  "Tai nghe",
  "Phụ kiện"
];

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

        <td>
          <input placeholder="${cat}"
            value="${name}"
            onchange="update('${cat}', 'name', this.value)">
        </td>

        <td>
          <input type="text"
            value="${price === 0 ? '0' : price.toLocaleString('vi-VN')}"
            oninput="let v = this.value.replace(/[^0-9]/g, ''); this.value = v ? parseInt(v).toLocaleString('vi-VN') : '';"
            onchange="update('${cat}', 'price', this.value.replace(/\\./g, ''))">
        </td>

        <td>
          <input type="number"
            value="${qty}"
            onchange="update('${cat}', 'qty', this.value)">
        </td>

        <td>
         <div class="warranty-box">
          <input type="number"
              value="${warranty}"
              onchange="update('${cat}', 'warranty', this.value)">
            <span>Tháng</span>
          </div>
        </td>
      </tr>
    `;
  });

  document.getElementById("totalTop").innerText = money(total);
  document.getElementById("totalBottom").innerText = money(total);

  localStorage.setItem("build", JSON.stringify(build));
}

function update(category, field, value) {
  if (!build[category]) {
    build[category] = { name: "", price: 0, qty: 1, warranty: "" };
  }

  if (field === "price" || field === "qty") {
    value = parseInt(value) || 0;
  }

  build[category][field] = value;

  render();
}
function exportExcel() {
  let data = [
    ["STT", "Tên sản phẩm", "Số lượng", "Giá", "Bảo hành", "Thành tiền"]
  ];

  let total = 0;

  categories.forEach((cat, i) => {
    const item = build[cat] || {};

    const name = item.name || "";
    const price = item.price || 0;
    const qty = item.qty || 0;
    const warranty = item.warranty || 0;
    const sum = price * qty;

    total += sum;

    data.push([
      i + 1,
      name || cat,
      qty,
      money(price),
      warranty + " tháng",
      money(sum)
    ]);
  });

  // thêm dòng tổng
  data.push(["", "", "", "", "Tổng", money(total)]);

  // thêm logo
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
  ];
  // thêm dòng tiêu đề
  data.unshift(["TSS BUILD PC"]);
  
  // tạo workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Build PC");

  // xuất file
  XLSX.writeFile(wb, "build_pc.xlsx");
}

function money(n) {
  return (n || 0).toLocaleString('vi-VN') + " ₫";
}

function resetBuild() {
  build = {};
  localStorage.removeItem("build");
  render();
}

render();