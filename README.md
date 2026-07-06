
# 🏴‍☠️ GIẢI MÃ KHO BÁU - MÔN AN TOÀN VÀ BẢO MẬT THÔNG TIN

> **Môn học:** An toàn và Bảo mật Thông tin  
> **Trường:** Đại học Đại Nam  
> **Giảng viên hướng dẫn:** ThS. Lê Thị Thùy Trang  
> **Nhóm thực hiện – Nhóm 12:**  
> - Nguyễn Việt Hoàng  
> - Cao Minh Hưng  
> - Mạc Đức Thắng  
> - Lê Hoàng Nam

---

## 🎯 MỤC TIÊU ĐỀ TÀI

Dự án này xây dựng một trò chơi giáo dục 2D nhằm giúp người học tiếp cận kiến thức về an toàn và bảo mật thông tin một cách trực quan, sinh động và dễ tiếp thu hơn. Thay vì chỉ học qua lý thuyết, người chơi được đặt vào bối cảnh khám phá bản đồ, giải câu đố và vượt qua các thử thách liên quan đến mã hóa, toàn vẹn dữ liệu, lỗ hổng bảo mật và các khái niệm bảo mật hiện đại.

## 📝 TÓM TẮT ĐỀ TÀI

Game “Giải mã kho báu” là một sản phẩm được phát triển nhằm kết nối giữa kiến thức chuyên môn và trải nghiệm trò chơi tương tác. Người chơi sẽ di chuyển trong các bản đồ, thu thập gem, mở khóa câu đố và đưa ra đáp án liên quan đến các thuật toán bảo mật như Caesar, Vigenère, Hash, AES, RSA và các dạng lỗ hổng như replay attack. Qua đó, người học có thể hiểu rõ hơn về ý nghĩa của việc bảo vệ thông tin, cách phát hiện thay đổi dữ liệu và vai trò của mật mã trong đời sống số.

## 💡 Ý NGHĨA CỦA DỰ ÁN

- Giúp sinh viên hiểu được các khái niệm bảo mật thông tin thông qua trải nghiệm thực tế.
- Kết hợp giáo dục và giải trí để tăng tính hứng thú học tập.
- Minh họa rõ hơn mối liên hệ giữa lý thuyết mật mã và các tình huống ứng dụng trong thực tế.
- Rèn luyện tư duy logic, khả năng phân tích và kỹ năng giải quyết vấn đề.

---

## 🎮 TÍNH NĂNG CHÍNH

- Xây dựng trò chơi phiêu lưu 2D với nhiều bản đồ và cấp độ khác nhau.
- Tích hợp các câu đố bảo mật theo nhiều chủ đề: Caesar, Vigenère, Hash/Integrity, AES, RSA và Vulnerability Detection.
- Có hệ thống điểm số, bảng xếp hạng, âm thanh nền và nhạc hiệu ứng trong game.
- Hỗ trợ lưu tiến trình người chơi để tiếp tục chơi sau khi tải lại trang.
- Có màn hình kết thúc, nhập tên người chơi và lưu kết quả vào bảng xếp hạng cục bộ.

---

## 🔐 CÁC CHỦ ĐỀ BẢO MẬT ĐƯỢC TÍCH HỢP

| Chủ đề | Mô tả |
|---|---|
| Caesar Cipher | Mã hóa dịch chuyển ký tự đơn giản, phù hợp để giới thiệu về mã hóa đối xứng. |
| Vigenère Cipher | Mã hóa bằng khóa, giúp người chơi hiểu về mật mã cổ điển nâng cao. |
| Hash / Integrity | Hỗ trợ nhận biết dữ liệu bị thay đổi hay không. |
| AES | Minh họa thuật toán mã hóa khối hiện đại và các khái niệm lý thuyết liên quan. |
| RSA | Trình bày các khái niệm về mã hóa bất đối xứng, khóa công khai và khóa riêng. |
| Vulnerability Detection | Giới thiệu các lỗ hổng như replay attack và các hình thức tấn công phổ biến. |

---

## 🛠️ CẤU TRÚC DỰ ÁN

Dự án được tổ chức thành các thành phần chính sau:

```text
game-treasure/
├── public/                 # Giao diện trò chơi: index.html, style.css, script.js
├── data/                   # Dữ liệu bản đồ, câu đố, âm thanh và khóa RSA
├── server.js               # Server Express phục vụ ứng dụng trên localhost
├── package.json            # Cấu hình project và dependency
└── package-lock.json       # Danh sách phiên bản package đã cài đặt
```

Một số file quan trọng:

- `public/index.html`: Trang chính chứa giao diện trò chơi.
- `public/script.js`: Xử lý logic game, câu đố, điểm số, bảng xếp hạng và lưu tiến trình.
- `public/style.css`: Thiết kế giao diện và bố cục hiển thị.
- `data/map1.json` đến `data/map5.json`: Dữ liệu bản đồ cho từng cấp độ.
- `data/puzzles.json`: Danh sách câu hỏi, đáp án và kiểu câu đố.


---

## ▶️ HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY

### Yêu cầu hệ thống

- Node.js >= 12
- Trình duyệt hiện đại như Chrome, Edge hoặc Firefox

### Các bước thực hiện

1. Mở terminal và di chuyển vào thư mục dự án:

```bash
cd game-treasure
```

2. Cài đặt các thư viện cần thiết:

```bash
npm install
```

3. Khởi động server:

```bash
node server.js
```

4. Nếu server chạy thành công, mở trình duyệt và truy cập:

```text
http://localhost:3000
```

5. Nếu muốn dừng server, nhấn `Ctrl + C` trong terminal.

---

## 🎮 CÁCH CHƠI VÀ LUỒNG HOẠT ĐỘNG

Người chơi sẽ bắt đầu từ màn hình chính, lựa chọn bắt đầu trò chơi và di chuyển nhân vật trên bản đồ 2D bằng các phím mũi tên. Mỗi bản đồ chứa các đối tượng như gem, cửa ra, kẻ địch và vùng nguy hiểm. Khi người chơi tiếp xúc với gem, hệ thống sẽ kích hoạt một câu đố bảo mật tương ứng với chủ đề đang học. Nếu trả lời đúng, người chơi sẽ nhận điểm và tiếp tục tiến trình khám phá. Khi đạt đủ điều kiện, người chơi có thể mở cửa ra để chuyển sang cấp độ mới. Nếu va chạm với kẻ địch hoặc lava, trò chơi sẽ kết thúc và người chơi cần bắt đầu lại hoặc tiếp tục từ tiến trình đã lưu.

Quy trình chơi có thể tóm gọn như sau:

1. Di chuyển nhân vật trên bản đồ bằng các phím mũi tên.
2. Thu thập gem để nhận câu đố bảo mật.
3. Trả lời đúng để tích điểm và mở khóa các cấp độ tiếp theo.
4. Đạt đủ điều kiện để bước qua cửa ra và tiến đến bản đồ mới.
5. Tránh va chạm với kẻ địch, lava và các chướng ngại khác.

---

## 🧠 KẾT QUẢ ĐẠT ĐƯỢC

- Xây dựng thành công một trò chơi giáo dục tương tác, có khả năng ứng dụng trong giảng dạy môn An toàn và Bảo mật Thông tin.
- Tạo ra một môi trường học tập trực quan, giúp người chơi hình dung rõ hơn về các khái niệm bảo mật, mã hóa và phát hiện lỗ hổng.
- Tích hợp nhiều nội dung lý thuyết quan trọng của mật mã và bảo mật vào trong một hệ thống trò chơi thống nhất và dễ tiếp cận.
- Cải thiện trải nghiệm người dùng nhờ có hệ thống điểm số, bảng xếp hạng, âm thanh nền và chức năng lưu tiến trình.

## 🚀 HƯỚNG PHÁT TRIỂN TIẾP THEO

- Mở rộng thêm nhiều cấp độ và chủ đề bảo mật mới, chẳng hạn các kỹ thuật xác thực, chữ ký số và bảo mật mạng.
- Tích hợp bảng xếp hạng trực tuyến và lưu tiến trình trên server thay vì chỉ lưu cục bộ.
- Nâng cao chất lượng giao diện đồ họa và tăng mức độ tương tác của nhân vật, đối tượng và hiệu ứng trong game.
- Phát triển phiên bản mobile hoặc web responsive để tăng khả năng tiếp cận cho người dùng.

---

## 📋 GIẤY PHÉP VÀ LƯU Ý

Dự án này được thực hiện nhằm phục vụ mục đích học tập và nghiên cứu trong khuôn khổ môn An toàn và Bảo mật Thông tin tại Trường Đại học Đại Nam. Thông tin về giảng viên hướng dẫn và nhóm thực hiện được giữ nguyên trong tài liệu này.

---

## 📬 LIÊN HỆ

**Nhóm 12 – Môn học An toàn và Bảo mật Thông tin**  
📍 Trường Đại học Đại Nam  
📧 Mọi liên hệ thông qua sinh viên thực hiện nhóm 12
