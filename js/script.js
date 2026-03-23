const categories = [
  "CPU", "MAINBOARD", "RAM", "SSD", "HDD", 
  "VGA", "Nguồn", "Vỏ Case", "Màn hình", 
  "Bàn phím", "Chuột", "Tai nghe", "Phụ kiện"
];

// Khởi tạo dữ liệu từ localStorage hoặc đối tượng rỗng
let build = JSON.parse(localStorage.getItem("build")) || {};

/**
 * Hàm định dạng hiển thị tiền tệ VNĐ
 */
function money(n) {
  return (n || 0).toLocaleString('vi-VN') + " ₫";
}

/**
 * Hàm xử lý định dạng dấu chấm khi người dùng đang gõ
 */
function formatMoneyInput(input) {
  // Xóa sạch mọi thứ không phải số
  let rawValue = input.value.replace(/\D/g, ''); 
  
  if (rawValue) {
    // Chuyển thành số rồi định dạng lại theo chuẩn vi-VN (1.000.000)
    input.value = parseInt(rawValue).toLocaleString('vi-VN');
  } else {
    input.value = '';
  }
}

/**
 * Hàm cập nhật dữ liệu vào biến 'build'
 */
function update(category, field, value) {
  if (!build[category]) {
    build[category] = { name: "", price: 0, qty: 1, warranty: 0 };
  }

  if (field === "price") {
    // QUAN TRỌNG: Xóa hết dấu chấm để lưu số thuần vào bộ nhớ (Ví dụ: "100.000" -> 100000)
    let numericValue = parseInt(value.toString().replace(/\D/g, '')) || 0;
    build[category][field] = numericValue;
  } else if (field === "qty" || field === "warranty") {
    build[category][field] = parseInt(value) || 0;
  } else {
    build[category][field] = value;
  }

  // Sau khi cập nhật xong thì vẽ lại giao diện để tính tổng tiền mới
  render();
}

/**
 * Hàm vẽ giao diện bảng
 */
function render() {
  const list = document.getElementById("list");
  if (!list) return; 

  list.innerHTML = "";
  let min = 0;
  let total = 0;

  categories.forEach((cat, i) => {
    const item = build[cat] || {};
    const name = item.name || "";
    const price = parseInt(item.price) || 0; 
    const qty = parseInt(item.qty) || 1;
    const warranty = item.warranty || "";
    
    total += price * qty;

    list.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>
          <input placeholder="${cat}" value="${name}" 
            onchange="update('${cat}', 'name', this.value)">
        </td>
        <td>
          <input type="text" 
            value="${price === 0 ? '' : price.toLocaleString('vi-VN')}"
            oninput="formatMoneyInput(this)"
            onchange="update('${cat}', 'price', this.value)">
        </td>
        <td>
          <input type="number" value="${qty}" 
            onchange="update('${cat}', 'qty', this.value)">
        </td>
        <td>
          <div class="warranty-box">
            <input type="number" value="${warranty}" min = "0" 
              oninput="if(this.value < 0) this.value = 0;"
              onchange="update('${cat}', 'warranty', this.value)">
            <span>Tháng</span>
          </div>
        </td>
      </tr>`;
  });

  // Cập nhật tổng tiền lên giao diện 
  const totalTopEl = document.getElementById("totalTop");
  if (totalTopEl) totalTopEl.innerText = money(total);

  const totalBottomEl = document.getElementById("totalBottom");
  if (totalBottomEl) totalBottomEl.innerText = money(total);

  // Lưu dữ liệu vào trình duyệt
  localStorage.setItem("build", JSON.stringify(build));
}

/**
 * Hàm làm mới bảng giá
 */
function resetBuild() {
  if (confirm("Bạn có chắc chắn muốn làm mới toàn bộ cấu hình?")) {
    build = {};
    localStorage.removeItem("build");
    render();
  }
}

/**
 * Hàm gọi xuất Excel
 */
function handleExport() {
  if (typeof exportExcel === "function") {
    exportExcel(categories, build, money);
  } else {
    alert("Tính năng xuất Excel đang được tải hoặc chưa sẵn sàng.");
  }
}

// Chạy hàm render lần đầu khi trang web tải xong
document.addEventListener("DOMContentLoaded", render);