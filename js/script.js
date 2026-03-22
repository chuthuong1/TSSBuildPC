// Danh sách các loại linh kiện cần nhập thông tin
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

// Lấy dữ liệu build từ localStorage hoặc khởi tạo mới nếu chưa có
let build = JSON.parse(localStorage.getItem("build")) || {};

// Hàm render giao diện
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

// Hàm cập nhật thông tin sản phẩm
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
// Hàm xuất Excel
async function exportExcel() {
  // 1. Khởi tạo file Excel
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Build PC");

  // Cài đặt độ rộng cho các cột để file hiển thị đẹp ngay khi mở
  sheet.columns = [
    { width: 5 },   // Cột A: STT
    { width: 40 },  // Cột B: Tên sản phẩm
    { width: 15 },  // Cột C: Giá
    { width: 10 },  // Cột D: Số lượng
    { width: 15 },  // Cột E: Bảo hành
    { width: 20 }   // Cột F: Thành tiền
  ];

  // 2. CHÈN LOGO
  try {
    // Tải ảnh từ thư mục (Phải chạy web qua Live Server thì mới tải được ảnh)
    const response = await fetch("images/TssLogo.jpg");
    const imageBuffer = await response.arrayBuffer();
    const logoId = workbook.addImage({
      buffer: imageBuffer,
      extension: 'jpeg',
    });

    // Mở rộng dòng đầu tiên cao lên để lấy không gian chứa logo
    sheet.getRow(1).height = 100;

    // Chèn logo vào file Excel (căn ở khoảng cột B)
    sheet.addImage(logoId, {
      tl: { col: 1, row: 0 }, // Vị trí bắt đầu
      ext: { width: 150, height: 120 } // Độ to nhỏ của logo
    });
  } catch (error) {
    console.warn("Không thể chèn logo. Hãy chắc chắn bạn đang chạy web bằng Live Server.", error);
  }

  // 3. TIÊU ĐỀ
  const titleRow = sheet.addRow(["TSS BUILD PC"]);
  sheet.mergeCells(`A2:F2`); // Gộp ô
  titleRow.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF0054A6' } }; // Chữ in đậm, màu xanh
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 30;

  sheet.addRow([]); // Thêm 1 dòng trống cách điệu

  // 4. TIÊU ĐỀ CÁC CỘT (Có màu nền)
  const headerRow = sheet.addRow(["STT", "Tên sản phẩm", "Giá", "Số lượng", "Bảo hành", "Thành tiền"]);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Chữ trắng
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;
  
  // Tô màu nền xanh cho thanh tiêu đề cột
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }
    };
  });

  // 5. ĐIỀN DỮ LIỆU
  let total = 0;
  categories.forEach((cat, i) => {
    const item = build[cat] || {};
    const name = item.name || "";
    const price = item.price || 0;
    const qty = item.qty || 1;
    const warranty = item.warranty || "";
    const sum = price * qty;

    total += sum;

    const row = sheet.addRow([
      i + 1,
      name || cat,
      money(price),
      qty,
      warranty ? warranty + " tháng" : "",
      money(sum)
    ]);
    
    // Căn giữa cho cột STT, Số lượng, Bảo hành
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(4).alignment = { horizontal: 'center' };
    row.getCell(5).alignment = { horizontal: 'center' };
  });

  // 6. DÒNG TỔNG CỘNG
  const totalRow = sheet.addRow(["", "", "", "", "Tổng cộng", money(total)]);
  totalRow.font = { bold: true, size: 12, color: { argb: 'FFFF0000' } }; // Chữ đỏ in đậm

  // 7. KẺ KHUNG (Border) cho bảng
  const startRow = 4; // Dòng 4 là dòng chứa Header
  const endRow = sheet.rowCount;
  for (let i = startRow; i <= endRow; i++) {
    sheet.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  }

  // 8. TẢI FILE VỀ MÁY
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, "build_pc.xlsx");
}

  // Hàm định dạng tiền tệ Việt Nam
function money(n) {
  return (n || 0).toLocaleString('vi-VN') + " ₫";
}

  // Hàm reset lại build
function resetBuild() {
  build = {};
  localStorage.removeItem("build");
  render();
}

render();