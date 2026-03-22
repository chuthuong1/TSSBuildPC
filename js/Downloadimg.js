// Biến toàn cục để lưu trữ ảnh tạm thời
let currentImageDataUrl = "";

function previewImage() {
    const container = document.querySelector(".container");

    // 1. Đồng bộ giá trị vào HTML để bản nháp (clone) có thể đọc được chữ
    const allInputs = container.querySelectorAll("input");
    allInputs.forEach(input => {
        input.setAttribute("value", input.value);
    });

    // Cuộn lên đầu trang để tránh lỗi html2canvas cắt ngang ảnh
    window.scrollTo(0, 0);

    // 2. Tiến hành chụp ảnh với tính năng onclone (Chỉ thao tác trên bản nháp)
    html2canvas(container, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#ffffff",
        scrollY: 0,
        onclone: (clonedDoc) => {
         
            const clonedContainer = clonedDoc.querySelector(".container");

            // A. Ẩn nút bấm trên bản nháp
            const buttons = clonedContainer.querySelectorAll("button");
            buttons.forEach(btn => btn.style.display = "none");

            // B. Xử lý các hàng trong bảng
            const rows = clonedContainer.querySelectorAll("#list tr");
            rows.forEach(row => {
                const nameInput = row.querySelector("td:nth-child(2) input");
                
                // Nếu không nhập tên -> Ẩn hàng đó đi
                if (nameInput && nameInput.value.trim() === "") {
                    row.style.display = "none";
                } else {
                    // C. Biến các Input thành thẻ Text (Span) để ảnh chụp ra nét chữ tĩnh
                    const inputsInRow = row.querySelectorAll("input");
                    inputsInRow.forEach(input => {
                        const span = clonedDoc.createElement("span");
                        span.textContent = input.value;
                        
                        // In đậm tên sản phẩm
                        if (input.parentElement.cellIndex === 1) {
                            span.style.fontWeight = "bold";
                        }

                        input.parentElement.insertBefore(span, input);
                        input.style.display = "none"; // Giấu input trên bản nháp
                    });
                }
            });
            // --------------------------------------------------------------
        }
    }).then((canvas) => {
        // Kiểm tra xem ảnh có bị lỗi rỗng không
        if (canvas.width === 0 || canvas.height === 0) {
            alert("Lỗi: Khung hình chụp bị rỗng, vui lòng thử lại!");
            return;
        }

        // 3. Lưu ảnh và hiển thị Modal xem trước
        currentImageDataUrl = canvas.toDataURL("image/png");
        document.getElementById("previewImageSrc").src = currentImageDataUrl;
        document.getElementById("previewModal").style.display = "flex"; 

    }).catch(err => {
        console.error("Lỗi khi tạo ảnh xem trước: ", err);
        alert("Có lỗi xảy ra khi tạo ảnh xem trước!");
    });
}

function closePreview() {
    // Ẩn Popup đi
    document.getElementById("previewModal").style.display = "none";
    
    // Refresh (tải lại) trang web
    window.location.reload();
}

function downloadFromPreview() {
    if (!currentImageDataUrl) return;
    
    // Tạo link tải ảo và kích hoạt tải xuống
    const link = document.createElement("a");
    link.download = "Bao_Gia_TSS_BuildPC.png"; 
    link.href = currentImageDataUrl;
    link.click();
    
    
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}