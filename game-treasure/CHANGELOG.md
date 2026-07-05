# Changelog

## 2026-07-03
- Thêm trang chủ
- Thay đổi icon người chơi
- Thêm nhân vật xác ướp
- Chỉnh sửa khả năng di chuyển của xác ướp
- Thêm thông báo khi xác ướp bắt được người chơi
- Tạo bảng xếp hạng local
- Cho phép người dùng nhập tên sau khi hoàn thành trò chơi
- Thay đổi màu đường đi với tường cho phù hợp
- Thêm nhạc nền cho màn hình chủ bằng file theme_song.mp3.
- Thêm nhạc trong game bằng file ingame_song.mp3.
- Khi bấm bắt đầu trò chơi, dừng nhạc chủ và phát nhạc game.
- Khi quay về trang chủ, dừng nhạc game và phát lại nhạc chủ.
- Thêm logic cho nhân vật quay lại vị trí trước khi hủy câu đố.
- Thay đổi logic câu đố: khi hủy, gem vẫn còn trên bản đồ cho đến khi giải đúng.
- Chỉnh sửa logic xác ướp chỉ di chuyển khi người chơi dùng phím mũi tên.
- Sửa lỗi số AES đổi liên tục bằng cách chỉ tạo chuỗi mã hóa một lần khi mở câu đố.
- Cải thiện quản lý câu đố để các câu đố không bị chặn nhau sau khi hủy.
- Thêm 30 câu đố cho mỗi map
- khu vực câu đố giờ sẽ chọn 1 câu ngẫu nhiên trong danh sách các câu hỏi

## 2026-07-04
- Sửa lỗi Start không hiện map do đường dẫn tài nguyên không đúng.
- Thêm map 5 và nối map 4 sang map 5 bằng cửa `O` mới.
- Cập nhật map 4 để ô `E` chuyển sang `O` dẫn đến map 5.
- Thêm những loại câu đố mới theo chủ đề bảo mật: Caesar/Vigenère, Hash/Integrity, AES, RSA, và Vulnerability detection.
- Bổ sung câu đố phát hiện lỗ hổng và gợi ý trả lời cho người chơi.

## 2026-07-05
- Thêm nút `Lưu tiến trình` trong màn chơi để lưu lại trạng thái hiện tại.
- Lưu lại đầy đủ tiến trình: map hiện tại, vị trí người chơi, vị trí xác ướp, điểm, thời gian và câu đố chưa hoàn thành.
- Tự động phục hồi tiến trình khi tải lại trang nếu có dữ liệu đã lưu.
- Thêm hộp thoại hỏi người chơi có muốn tiếp tục hành trình trước đó khi bắt đầu mới.
- Xóa tiến trình khi người chơi thua cuộc.
- Loại bỏ nút `Về trang chủ` trong màn chơi và chuyển sang cơ chế lưu tiến trình.
- Sửa đường dẫn tải tài nguyên cho `script.js` để load đúng ảnh và JSON từ `../data/`.
- Bổ sung hỗ trợ cho các loại câu đố mới: `Vigenère`, `Hash / Integrity`, `AES`, `RSA` và `Vulnerability Detection`.
- Cập nhật giao diện popup giải mã để hiển thị nội dung mã hóa phù hợp với từng loại câu đố và đưa ra gợi ý cho các câu đố bảo mật.
- Mở rộng phần giải thích câu đố chi tiết cho các loại cipher: Caesar, Vigenère, RSA, AES, Hash/Integrity và Vulnerability Detection; nêu rõ cơ chế giải mã ngược và tư duy xác minh.
- Cập nhật phần gợi ý `vuln` để tập trung vào đặc điểm nhận dạng lỗ hổng (replay, nonce reuse, unsalted hash) thay vì cung cấp ví dụ đáp án.
- Sửa popup RSA để không hiển thị giá trị khoá thực tế; khoá chung RSA hiện được lưu trong thư mục `data/keys` và chỉ hiển thị hướng dẫn vị trí lưu trữ.
- Thêm dữ liệu câu đố mới cho các level 2, 3, 4 và 5, bao gồm các câu hỏi liên quan đến integrity, replay attack, unsalted hash và nonce reuse.
- Thêm map 5 và nối map 4 sang map 5 bằng cửa `O` mới.
- Cập nhật layout để game hiển thị vừa khít toàn bộ màn hình, loại bỏ tình trạng vượt quá kích thước viewport.
- Điều chỉnh bố cục canvas và container để canvas phủ toàn bộ vùng chơi và không bị lệch hoặc tràn khỏi màn hình.
