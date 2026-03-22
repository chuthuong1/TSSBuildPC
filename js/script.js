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
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Build PC");

  // Cài đặt độ rộng cho các cột
  sheet.columns = [
    { width: 5 },   // Cột A: STT
    { width: 40 },  // Cột B: Tên sản phẩm
    { width: 15 },  // Cột C: Giá
    { width: 10 },  // Cột D: Số lượng
    { width: 15 },  // Cột E: Bảo hành
    { width: 20 }   // Cột F: Thành tiền
  ];

  // 1. TẠO Ô TIÊU ĐỀ VÀ CHÈN LOGO (CÙNG DÒNG 1)
  
  // Ghi chữ vào dòng 1
  const titleRow = sheet.addRow(["XÂY DỰNG CẤU HÌNH PC"]);
  sheet.mergeCells('A1:E1'); // Gộp từ cột A đến D thành 1 ô siêu to
  sheet.getRow(1).height = 100; // Kéo giãn chiều cao ô lên 100 để có chỗ chứa logo
  
  // Format chữ: To, in đậm, màu xanh, và căn giữa ô
  titleRow.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF0054A6' } }; 
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

  const rightHeader = sheet.getCell('F1');
    rightHeader.value = {
      richText: [
        { 
          font: { bold: true, size: 14, color: { argb: 'FFFF0000' } }, 
          text: "TSS\n" 
        },
        { 
          font: { size: 9, color: { argb: 'FF333333' } }, 
          text: "86 ngõ 68 Phú Diễn\nBắc Từ Liêm, Hà Nội" 
        },
        { 
          font: { size: 11, color: { argb: 'FF333333' } },
          text: "Hotline: 0\n" 
        }
      ]
    };
    rightHeader.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
    
  // Chèn hình ảnh vào góc trái của ô vừa gộp
  try {
    const response = await fetch("images/TssLogo.jpg");
    const imageBuffer = await response.arrayBuffer();
    const logoId = workbook.addImage({
      buffer: imageBuffer,
      extension: 'jpeg',
    });

    sheet.addImage(logoId, {
      // tl: Tọa độ bắt đầu (Top-Left). row: 0 là dòng 1, col: 0.2 là nhích cách mép trái cột A một tí cho đẹp
      tl: { col: 0.2, row: 0.1 }, 
      ext: { width: 120, height: 120 } // Kích thước logo
    });
  } catch (error) {
    console.warn("Không thể chèn logo. Hãy chạy qua Live Server.", error);
  }
  const subTitleRow = sheet.addRow(["BẢNG BÁO GIÁ THIẾT BỊ"]);
    sheet.mergeCells(`A2:F2`);
    subTitleRow.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } }; // In đậm, màu đen
    subTitleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(2).height = 25;

  // ==========================================
  // 2. TIÊU ĐỀ CÁC CỘT CỦA BẢNG (DÒNG 3)
  // ==========================================
  const headerRow = sheet.addRow(["STT", "Tên sản phẩm", "Giá", "Số lượng", "Bảo hành", "Thành tiền"]);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Chữ trắng
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;
  
  // Tô màu nền xanh cho thanh tiêu đề
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }
    };
  });

  // ==========================================
  // 3. ĐIỀN DỮ LIỆU
  // ==========================================
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
    
    // Căn giữa cho STT, Số lượng, Bảo hành
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(4).alignment = { horizontal: 'center' };
    row.getCell(5).alignment = { horizontal: 'center' };
  });

  // ==========================================
  // 4. DÒNG TỔNG CỘNG VÀ KẺ BẢNG
  // ==========================================
  const totalRow = sheet.addRow(["", "", "", "", "Tổng chi phí", money(total)]);
  totalRow.font = { bold: true, size: 12, color: { argb: 'FFFF0000' } }; // Chữ đỏ

 const startRow = 4; // Dòng tiêu đề "STT", "Tên sản phẩm"...
  const endRow = sheet.rowCount; // Dòng "Tổng cộng"

  for (let i = startRow; i <= endRow; i++) {
    const row = sheet.getRow(i);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // Thiết lập viền mặc định cho tất cả các ô là nét mảnh (thin)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Tùy chỉnh để viền bao quanh bảng to hơn (medium hoặc thick)
      // 1. Viền trên cùng của hàng tiêu đề
      if (i === startRow) {
        cell.border.top = { style: 'medium' };
      }
      // 2. Viền dưới cùng của hàng Tổng cộng
      if (i === endRow) {
        cell.border.bottom = { style: 'medium' };
      }
      // 3. Viền bên trái của cột đầu tiên (Cột A)
      if (colNumber === 1) {
        cell.border.left = { style: 'medium' };
      }
      // 4. Viền bên phải của cột cuối cùng (Cột F)
      if (colNumber === 6) {
        cell.border.right = { style: 'medium' };
      }
    });
  }
  // ==========================================
  // 5. THÊM DÒNG LƯU Ý Ở CUỐI FILE EXCEL
  // ==========================================
  sheet.addRow([]); // Thêm 1 dòng trống cho thoáng
  
    const combinedNoteRow = sheet.addRow([]);
    sheet.mergeCells(`A${combinedNoteRow.number}:F${combinedNoteRow.number}`);
    
    // Chiều cao dòng khoảng 60 để hiển thị đủ 2 dòng văn bản
    combinedNoteRow.height = 60;

    combinedNoteRow.getCell(1).value = {
      richText: [
        // Đoạn 1: Quý khách lưu ý (In đậm)
        { font: { bold: true, italic: true, size: 11, color: { argb: 'FF555555' } }, text: "Quý khách lưu ý: " },
        { font: { italic: true, size: 11, color: { argb: 'FF555555' } }, text: "Giá bán, khuyến mại của sản phẩm và tình trạng còn hàng có thể bị thay đổi bất cứ lúc nào mà không kịp báo trước.\n" }, 
        
        // Đoạn 2: Liên hệ + Hotline & Email (In đậm)
        { font: { italic: true, size: 11, color: { argb: 'FF555555' } }, text: "Mọi thông tin chi tiết xin vui lòng liên hệ " },
        { font: { bold: true, italic: true, size: 11, color: { argb: 'FF555555' } }, text: "Hotline : 0912074444" },
        { font: { italic: true, size: 11, color: { argb: 'FF555555' } }, text: " - " },
        { font: { bold: true, italic: true, size: 11, color: { argb: 'FF555555' } }, text: "Email: khanhchungcomputer@gmail.com" }
      ]
    };

    // Căn lề trái, tự động xuống dòng và căn giữa theo chiều dọc
    combinedNoteRow.getCell(1).alignment = { 
      wrapText: true, 
      vertical: 'middle', 
      horizontal: 'left' 
    };

    // Dòng cuối cùng cảm ơn khách hàng
    const noteRow3 = sheet.addRow(["Xin chân thành cảm ơn quý khách đã sử dụng dịch vụ của TSS!"]);
    sheet.mergeCells(`A${noteRow3.number}:F${noteRow3.number}`);
    noteRow3.font = { italic: true, size: 15, bold: true, color: { argb: 'FFFF0000' } };
    

  // Tải file
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