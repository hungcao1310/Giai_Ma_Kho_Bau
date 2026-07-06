# Changelog

## 2026-07-03
- **Giao diện và nhân vật:** Thêm trang chủ, thay đổi icon người chơi, thêm nhân vật xác ướp.
  - Chỉnh sửa khả năng di chuyển của xác ướp.
  - Thêm thông báo khi xác ướp bắt được người chơi.
- **Audio:** Thêm nhạc nền màn hình chủ bằng `theme_song.mp3` và nhạc trong game bằng `ingame_song.mp3`.
  - Khi bắt đầu trò chơi, dừng nhạc chủ và phát nhạc game.
  - Khi quay về trang chủ, dừng nhạc game và phát lại nhạc chủ.
- **Bảng xếp hạng:** Tạo bảng xếp hạng local, cho phép người dùng nhập tên sau khi hoàn thành trò chơi.
- **Câu đố:** Thêm logic cho nhân vật quay lại vị trí trước khi hủy câu đố, thay đổi logic gem còn trên bản đồ sau khi hủy.
  - Chỉnh sửa logic xác ướp chỉ di chuyển khi người chơi dùng phím mũi tên.
  - Thêm 30 câu đố cho mỗi map, khu vực câu đố chọn 1 câu ngẫu nhiên.
  - Cải thiện quản lý câu đố để các câu đố không bị chặn nhau sau khi hủy.
- **Giao diện game:** Thay đổi màu đường đi với tường cho phù hợp.
- **Sửa lỗi:** Sửa lỗi số AES đổi liên tục bằng cách chỉ tạo chuỗi mã hóa một lần khi mở câu đố.

## 2026-07-04
- **Sửa lỗi:** Sửa lỗi `Start` không hiện map do đường dẫn tài nguyên không đúng.
- **Bản đồ:** Thêm map 5, nối map 4 sang map 5 bằng cửa `O` mới, cập nhật map 4 để ô `E` chuyển sang `O`.
- **Câu đố bảo mật:** Thêm những loại câu đố mới theo chủ đề: Caesar/Vigenère, Hash/Integrity, AES, RSA, và Vulnerability detection.
  - Bổ sung câu đố phát hiện lỗ hổng và gợi ý trả lời cho người chơi.

## 2026-07-05
- **Lưu tiến trình:** Thêm nút `Lưu tiến trình` trong màn chơi để lưu lại trạng thái hiện tại.
  - Lưu đầy đủ tiến trình: map, vị trí người chơi, vị trí xác ướp, điểm, thời gian, câu đố chưa hoàn thành.
  - Tự động phục hồi tiến trình khi tải lại trang nếu có dữ liệu đã lưu.
  - Thêm hộp thoại hỏi người chơi có muốn tiếp tục hành trình trước đó khi bắt đầu mới.
  - Xóa tiến trình khi người chơi thua cuộc hoặc phá đảo thành công.
- **Giao diện:** Loại bỏ nút `Về trang chủ` trong màn chơi và chuyển sang cơ chế lưu tiến trình.
- **Sửa lỗi tài nguyên:** Sửa đường dẫn tải tài nguyên cho `script.js` để load đúng ảnh và JSON từ `../data/`.
- **Popup giải mã:** Bổ sung hỗ trợ cho các loại câu đố: Vigenère, Hash / Integrity, AES, RSA và Vulnerability Detection.
  - Cập nhật giao diện popup giải mã để hiển thị nội dung mã hóa phù hợp với từng loại câu đố.
  - Mở rộng phần giải thích câu đố chi tiết cho các loại cipher: Caesar, Vigenère, RSA, AES, Hash/Integrity và Vulnerability Detection.
  - Cập nhật phần gợi ý `vuln` để tập trung vào đặc điểm nhận dạng lỗ hổng.
  - Sửa popup RSA để không hiển thị giá trị khoá thực tế; chỉ hiển thị hướng dẫn vị trí lưu trữ.
- **Dữ liệu câu đố:** Bổ sung dữ liệu câu đố cho các level 2, 3, 4 và 5.
  - Cập nhật câu hỏi hash trong Level 2 để chỉ chấp nhận 2 đáp án: "ok" và "tampered".
  - Cải thiện manh mối vuln (replay attack) bằng câu chuyện ẩn dụ rõ ràng hơn.
- **Bản đồ:** Cập nhật layout để game hiển thị vừa khít toàn bộ màn hình, điều chỉnh bố cục canvas và container.
  - Thêm câu hỏi đặc biệt ở map 5 khi bước vào ô `E`: "Bản chất của thế giới là gì?".
  - Cập nhật logic map 5: nhập đúng `code!` cộng 100 điểm và phá đảo trò chơi.
  - Sửa lỗi ở map 5 vẫn báo "Bạn chưa kích hoạt hết các công tắc" dù đã hoàn thành.
  - Loại bỏ các câu hỏi vulnerability trùng đáp án ở map 5.

## 2026-07-06
- **Thay thế Level 3 (AES):** Thay tất cả 30 câu hỏi giải mã AES bằng câu hỏi lý thuyết AES cơ bản dành cho sinh viên nhập môn an toàn bảo mật (cipher_type: "theory").
  - Các câu hỏi bao gồm: tên gọi, tên gọi khác (Rijndael), kích thước khối 128 bit, kích thước khóa 128/192/256 bit, số vòng (round), tính đối xứng, mã hóa khối, cấu trúc SPN, các bước SubBytes/ShiftRows/MixColumns/AddRoundKey, DES, ma trận trạng thái, key expansion, chế độ ECB/CBC/CFB, năm công bố 2001, v.v.
- **Thay thế Level 4 (RSA):** Thay tất cả 30 câu hỏi giải mã RSA bằng câu hỏi lý thuyết RSA cơ bản (cipher_type: "theory").
  - Các câu hỏi bao gồm: tên viết tắt (Rivest-Shamir-Adleman), mã hóa bất đối xứng, bài toán phân tích số nguyên tố, thành phần khóa công khai (n, e) và khóa bí mật (n, d), kích thước khóa 2048 bit, chữ ký số, hàm Euler φ(n), tính chậm hơn AES, mã hóa khóa phiên, giải mã lượng tử, giao thức SSL/TLS, v.v.
- **Thay thế Level 5 (AES):** Thay 7 câu hỏi cipher_type "aes" còn lại trong Level 5 bằng câu hỏi lý thuyết AES (cipher_type: "theory").
  - Các câu hỏi: bốn bước chính của vòng AES, mã hóa khối, thứ tự giải mã ngược lại, chức năng S-box (thay thế byte), padding khi dữ liệu không phải bội số 128 bit, DES 56 bit, MixColumns dùng GF(2⁸), AES-NI, so sánh mã hóa dòng vs khối.
- **Tạo cipher_type "theory" mới:** Thêm option "Lý thuyết" vào dropdown cipher-type trong `script.js`.
- **Xử lý hiển thị:** Thêm nhánh `cipherType === 'theory'` trong `showDecodeScreen()` để hiển thị thông báo phù hợp.
- **Giải thích chi tiết:** Mở rộng `showPuzzleExplanation()` với hệ thống if-else toàn diện — tự động nhận diện nội dung câu hỏi (AES hay RSA) và hiển thị giải thích cụ thể cho từng câu hỏi lý thuyết (phân biệt hơn 40 trường hợp khác nhau).
- **Cập nhật câu hỏi hash:** Rút gọn tất cả câu hỏi hash trong Level 2 để chỉ chấp nhận 2 đáp án: "ok" (dữ liệu không thay đổi) và "tampered" (dữ liệu bị thay đổi).
- **Cải thiện manh mối vuln (replay attack):** Viết lại phần note/manh mối cho 8 câu hỏi vuln replay attack trong Level 2, sử dụng câu chuyện ẩn dụ rõ ràng hơn (cuộn giấy ghi âm, sợi dây kéo cửa, gõ nhịp, chìa khóa cũ, sao chép thư, huýt sáo, chim bồ câu đưa thư) giúp gợi ý mà không đưa ra đáp án trực tiếp.
- Bổ sung dữ liệu câu đố AES/RSA lý thuyết vào `puzzles.json` (cipher_type: "theory").