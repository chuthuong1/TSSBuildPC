// Biến toàn cục để lưu trữ ảnh tạm thời
let currentImageDataUrl = "";

function previewImage() {
    // 1. Ép input đang nhập mất focus để dữ liệu được lưu ngay lập tức
    if (document.activeElement && document.activeElement.tagName === "INPUT") {
        document.activeElement.blur();
    }

    // 2. Hàm thực thi việc chụp ảnh
    const executeCapture = () => {
        const container = document.querySelector(".container");
        if (!container) return;

        // Đồng bộ giá trị thật vào HTML
        const allInputs = container.querySelectorAll("input");
        allInputs.forEach(input => {
            input.setAttribute("value", input.value);
        });

        // Bắt đầu chụp ảnh
        html2canvas(container, {
            scale: 2, 
            useCORS: true, 
            backgroundColor: "#ffffff",
            onclone: (clonedDoc) => {
                try {
                    const clonedContainer = clonedDoc.querySelector(".container");

                    // Ẩn nút bấm
                    const btnGroup = clonedContainer.querySelector(".button-group");
                    if (btnGroup) btnGroup.style.display = "none";

                    // Xử lý bảng
                    const rows = clonedContainer.querySelectorAll("#list tr");
                    rows.forEach(row => {
                        const nameInput = row.querySelector("td:nth-child(2) input");
                        
                        // Nếu không có tên SP -> Ẩn hàng
                        if (nameInput && nameInput.value.trim() === "") {
                            row.style.display = "none";
                        } else {
                            const inputsInRow = row.querySelectorAll("input");
                            inputsInRow.forEach(input => {
                                const td = input.closest('td');
                                if (!td) return;

                                const cellIndex = td.cellIndex;

                                // XỬ LÝ ẨN BẢO HÀNH 0 THÁNG
                                if (cellIndex === 4) {
                                    const warrantyValue = parseInt(input.value) || 0;
                                    if (warrantyValue === 0) {
                                        td.innerHTML = ""; // Xóa sạch ô
                                        return; 
                                    }
                                }

                                // Biến Input thành Text tĩnh
                                const span = clonedDoc.createElement("span");
                                span.textContent = input.value;
                                
                                if (cellIndex === 1) {
                                    span.style.fontWeight = "bold"; 
                                }

                                if (input.parentElement) {
                                    input.parentElement.insertBefore(span, input);
                                    input.style.display = "none"; 
                                }
                            });
                        }
                    });
                } catch (error) {
                    console.error("Lỗi trong quá trình xử lý ảnh nháp:", error);
                }
            }
        }).then((canvas) => {
            if (canvas.width === 0 || canvas.height === 0) {
                alert("Đang xử lý giao diện, bạn vui lòng bấm tải lại lần nữa nhé!");
                return;
            }

            // Hiển thị Modal
            currentImageDataUrl = canvas.toDataURL("image/png");
            document.getElementById("previewImageSrc").src = currentImageDataUrl;
            document.getElementById("previewModal").style.display = "flex"; 

        }).catch(err => {
            console.error("Lỗi html2canvas: ", err);
            alert("Có lỗi xảy ra khi tạo ảnh!");
        });
    };

    // 3. Đợi giao diện render xong (300ms) rồi mới chụp
    setTimeout(() => {
        requestAnimationFrame(executeCapture);
    }, 300);
}

// Hàm đóng popup xem trước
function closePreview() {
    document.getElementById("previewModal").style.display = "none";
    window.location.reload();
}

// Hàm tải ảnh từ popup
function downloadFromPreview() {
    if (!currentImageDataUrl) return;
    
    const link = document.createElement("a");
    link.download = "Bao_Gia_TSS_BuildPC.png"; 
    link.href = currentImageDataUrl;
    link.click();
    
    setTimeout(() => {
        window.location.reload();
    }, 2000);
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