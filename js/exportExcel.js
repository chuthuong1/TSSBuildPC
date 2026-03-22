async function exportExcel(categories, build, money) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Build PC");

    sheet.columns = [
        { width: 5 }, { width: 40 }, { width: 15 }, { width: 10 }, { width: 15 }, { width: 20 }
    ];

   // ==========================================
    // 1. DÒNG 1: LOGO VÀ TEXT GỘP CHUNG MỘT KHỐI
    // ==========================================
    const row1 = sheet.addRow([]); 
    sheet.getRow(1).height = 110;

    // Gộp toàn bộ từ A đến F thành 1 ô duy nhất
    sheet.mergeCells('A1:F1'); 
    const headerCell = sheet.getCell('A1');

    // Chèn nội dung văn bản
    headerCell.value = {
        richText: [
            { font: { bold: true, size: 16, color: { argb: 'FFFF0000' } }, text: "Công nghệ và giải pháp TSS\n" },
            { font: { size: 10, color: { argb: 'FF333333' } }, text: "86 ngõ 68 Phú Diễn\nBắc Từ Liêm, Hà Nội\n" },
            { font: { bold: true, size: 11, color: { argb: 'FF000000' } }, text: "Hotline: 09" }
        ]
    };

    // CĂN LỀ: Căn trái hoàn toàn và dùng indent để né Logo
    headerCell.alignment = { 
        vertical: 'middle', 
        horizontal: 'left', 
        wrapText: true,
        indent: 11 // Số này càng lớn thì chữ càng lùi sang phải để nhường chỗ cho Logo
    };

  // Chèn Logo (Sử dụng tọa độ tuyệt đối để tránh lỗi hiển thị khi gộp ô)
    try {
        const response = await fetch("images/background.jpg");
        const imageBuffer = await response.arrayBuffer();
        const logoId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'jpeg',
        });

        sheet.addImage(logoId, {
            // tl: { col: 0, row: 0 } là góc trên cùng bên trái của ô A1
            tl: { col: 0.05, row: 0.8 }, 
            ext: { width: 100, height: 100 },
            editAs: 'oneCell' // Giúp logo "dính" vào ô ngay cả khi in ấn
        });
    } catch (error) {
        console.warn("Lỗi logo:", error);
    }

    // Xóa viền ô header
    headerCell.border = {};

    // 2. DÒNG 2: BẢNG BÁO GIÁ THIẾT BỊ (ĐƯỜNG KẺ NGANG ĐẬM DƯỚI TIÊU ĐỀ)
    const subTitleRow = sheet.addRow(["BẢNG BÁO GIÁ THIẾT BỊ"]);
    sheet.mergeCells('A2:F2');
    subTitleRow.font = { name: 'Arial', size: 16, bold: true };
    subTitleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(2).height = 35;
    
    // Chỉ kẻ một đường ngang duy nhất dưới dòng "Bảng báo giá"
    sheet.getRow(2).eachCell((cell) => {
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF000000' } } };
    });

    sheet.addRow([]); // Dòng 3 hoàn toàn trống, không kẻ gì cả

    // 3. DÒNG 4: TIÊU ĐỀ CỘT (MÀU ĐỎ)
    const headerRow = sheet.addRow(["STT", "Tên sản phẩm", "Giá", "Số lượng", "Bảo hành", "Thành tiền"]);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D3F95' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { 
            bottom: { style: 'thin' }, 
            top: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // 4. ĐIỀN DỮ LIỆU
    let total = 0;
    let stt = 1;
    categories.forEach((cat) => {
        const item = build[cat] || {};
        const name = (item.name || "").trim();
        if (name !== "") {
            const price = item.price || 0;
            const qty = item.qty || 1;
            const sum = price * qty;
            total += sum;

            const row = sheet.addRow([stt++, name, money(price), qty, item.warranty ? item.warranty + " tháng" : "", money(sum)]);
            
            row.height = 30; // Tăng độ cao dòng một chút cho thoáng

            for (let i = 1; i <= 6; i++) {
                row.getCell(i).border = {
                    // Viền dọc hai bên ngoài cùng thì để màu đen, bên trong để màu xám
                    left: { style: 'thin', color: { argb: i === 1 ? 'FF000000' : 'FFCCCCCC' } },
                    right: { style: 'thin', color: { argb: i === 6 ? 'FF000000' : 'FFCCCCCC' } },
                    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
                row.getCell(i).alignment = { vertical: 'middle', horizontal: 'center' };
            }
            
            // Căn trái cho tên sản phẩm để dễ đọc hơn
            row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
        }
    });

    // 5. DÒNG TỔNG CỘNG (Design lại cho sang)
    const totalRow = sheet.addRow(["", "", "", "", "TỔNG CỘNG", money(total)]);
    totalRow.height = 30;

    // Gộp ô từ 1 đến 4 nếu muốn, hoặc chỉ style 2 ô cuối
    for (let i = 1; i <= 6; i++) {
        const cell = totalRow.getCell(i);
        if (i >= 5) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } }; // Màu xám nhạt sang trọng hơn
            cell.font = { bold: true, color: { argb: 'FFFF0000' } }; // Chữ đỏ cho nổi bật tổng tiền
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'medium', color: { argb: 'FF000000' } }, // Viền dưới cùng đậm
                left: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        } else {
            // Kẻ viền dưới cho các ô trống để đóng khung bảng
            cell.border = { bottom: { style: 'medium', color: { argb: 'FF000000' } } };
        }
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }

    // 6. LƯU Ý & CẢM ƠN (KHÔNG KẺ VIỀN)
    sheet.addRow([]);
    const noteRow = sheet.addRow([]);
    sheet.mergeCells(`A${noteRow.number}:F${noteRow.number}`);
    noteRow.height = 60;
    noteRow.getCell(1).value = {
        richText: [
            { font: { bold: true, italic: true }, text: "Quý khách lưu ý: " },
            { font: { italic: true }, text: "Giá bán có thể thay đổi bất cứ lúc nào.\nLiên hệ Hotline: 09 - Email: TSS@gmail.com" }
        ]
    };
    noteRow.getCell(1).alignment = { wrapText: true, vertical: 'middle' };

    const thanksRow = sheet.addRow(["XIN CHÂN THÀNH CẢM ƠN !"]);
    sheet.mergeCells(`A${thanksRow.number}:F${thanksRow.number}`);
    thanksRow.font = { size: 15, bold: true, color: { argb: 'FFFF0000' } };
    thanksRow.alignment = { horizontal: 'left' };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "build_pc.xlsx");
}