
# 🏴‍☠️ GIẢI MÃ KHO BÁU – ĐỒ ÁN MÔN AN TOÀN & BẢO MẬT THÔNG TIN

> **Môn học:** An toàn và Bảo mật Thông tin  
> **Trường:** Đại học Đại Nam  
> **Giảng viên hướng dẫn:** ThS. Lê Thị Thùy Trang  
> **Nhóm thực hiện – Nhóm 12:**  
> - Nguyễn Việt Hoàng
> - Cao Minh Hưng
> - Mạc Đức Thắng
> - Lê Hoàng Nam

---

## 🧩 GIỚI THIỆU HỆ THỐNG

**Giải mã kho báu** là một trò chơi giáo dục được phát triển nhằm giúp sinh viên tiếp cận các khái niệm mã hóa thông tin một cách trực quan và sinh động. Hệ thống kết hợp yếu tố **trò chơi phiêu lưu 2D** với **giải mã câu đố bảo mật**, trong đó người chơi phải thu thập các viên ngọc (gem) để mở khóa các câu đố mã hóa và giải chúng chính xác để qua màn.

Mỗi câu đố mô phỏng một thuật toán mã hóa như: **Caesar Cipher**, **RSA**, **AES**, và được lựa chọn phù hợp theo từng cấp độ. Người chơi phải chọn đúng thuật toán, nhập kết quả giải mã chính xác, và đạt điểm yêu cầu để mở cửa thoát (`O`) qua cấp tiếp theo.

---

## 🎮 CÁCH CHƠI

1. **Di chuyển nhân vật** bằng các phím mũi tên trên bàn phím.
2. **Thu thập gem (`G`)** để nhận một **câu đố mã hóa**.
3. **Cửa ra (`O`)** sẽ được mở khi bạn đạt đủ điểm yêu cầu.
4. **Kẻ địch (`E`)** và **lava (`L`)** là chướng ngại. Va chạm sẽ thua.
5. **Mỗi câu trả lời đúng** sẽ cộng **10 điểm**.

---

## 🔐 KIẾN THỨC MÃ HÓA ĐƯỢC TÍCH HỢP

| ⚔️ Cấp độ | 🔐 Thuật toán      | 🎯 Điểm cần đạt |
|----------|--------------------|----------------|
| Level 1  | Caesar Cipher      | 10 điểm        |
| Level 2  | Caesar Cipher      | 20 điểm        |
| Level 3  | RSA (mô phỏng)     | 30 điểm        |
| Level 4  | AES (mô phỏng)     | 50 điểm        |
> Thuật toán mã hóa Caesar được triển khai thực tế. RSA và AES được mô phỏng để thể hiện khái niệm học thuật.

![Image](https://github.com/user-attachments/assets/58ebf57e-aa58-4dcd-98d5-b767b35798ba)

---

## 🧠 CHỨC NĂNG CHÍNH

- ✅ Vẽ bản đồ game động bằng thư viện `p5.js` với các phần tử như tường, lava, cửa ra, gem, địch...
- ✅ Di chuyển nhân vật và kiểm tra va chạm theo lưới.
- ✅ Khi thu thập gem, hiển thị câu đố dạng mã hóa (có lựa chọn thuật toán).
- ✅ Xử lý kiểm tra đáp án mã hóa và tính điểm.
- ✅ Khi đủ điểm, cho phép vào cửa ra để chuyển cấp độ mới.
- ✅ Giao diện người chơi hiển thị điểm, thời gian, cấp độ và câu hỏi hiện tại.

---

## 🛠️ CÀI ĐẶT & TRIỂN KHAI

### Yêu cầu hệ thống

- Node.js >= 12  
- Trình duyệt hỗ trợ JavaScript (Chrome, Edge, Firefox)  
- Hệ điều hành: Windows, macOS hoặc Linux

### Các bước triển khai

1. **Cài đặt thư viện Express**

```bash
npm install express
```

2. **Chạy server**

```bash
node server.js
```

3. **Truy cập game**

Mở trình duyệt và vào: [http://localhost:3000](http://localhost:3000)

---

## 🗂️ CẤU TRÚC DỮ LIỆU VÀ FILE

- `map1.json → map4.json`: Dữ liệu bản đồ (tọa độ nhân vật, vị trí gem, địch, lava...)
- `puzzles.json`: Danh sách câu hỏi và câu trả lời đã mã hóa theo cấp độ.
- `script.js`: Điều khiển game, xử lý mã hóa, chuyển cấp, tính điểm.
- `style.css`: Giao diện và bố cục game.
- `index.html`: Trang giao diện chính chứa vùng canvas.
- `server.js`: File chạy web server bằng Express để phục vụ frontend và dữ liệu game.

---

## 🧪 MỤC TIÊU GIÁO DỤC

- Củng cố kiến thức về **các loại thuật toán mã hóa** (đối xứng & bất đối xứng).
- Mô phỏng tình huống ứng dụng trong thực tế (truyền tin bí mật, xác thực...).
- Tăng hứng thú học tập thông qua mô hình trò chơi tương tác.
- Giúp người học hiểu bản chất và giới hạn của mỗi phương pháp mã hóa.

---

## 📜 GIẤY PHÉP & LƯU Ý

Dự án được thực hiện phục vụ mục đích **học tập và nghiên cứu học thuật** trong khuôn khổ môn _An toàn và Bảo mật Thông tin_ tại **Trường Đại học Đại Nam**.


---

## 📬 LIÊN HỆ

**Nhóm 12 – Môn học An toàn và Bảo mật Thông tin**  
📍 Trường Đại học Đại Nam  
📧 Mọi liên hệ thông qua sinh viên thực hiện nhóm 12 
