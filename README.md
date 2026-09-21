# MoneyFlow Frontend - Modular Version

Phiên bản này tách JavaScript thành nhiều module ES để dễ bảo trì và mở rộng.

## Cấu trúc

```text
expense_frontend_modular/
├── index.html
├── styles.css
└── js/
    ├── main.js
    ├── appController.js
    ├── config.js
    ├── constants.js
    ├── demoData.js
    ├── selectors.js
    ├── state.js
    ├── utils.js
    ├── services/
    │   ├── storageService.js
    │   └── transactionService.js
    └── ui/
        ├── elements.js
        ├── sidebar.js
        ├── modal.js
        ├── summary.js
        ├── transactions.js
        └── charts.js
```

## Vai trò từng module

### `main.js`
Entry point. Khởi tạo app và bind các thành phần tổng quát.

### `appController.js`
Điều phối nghiệp vụ giữa UI, state và service.

### `config.js`
Cấu hình API, ngân sách, localStorage.

### `constants.js`
Các constant như danh mục giao dịch.

### `state.js`
State trung tâm của frontend.

### `selectors.js`
Lọc và tổng hợp dữ liệu từ state.

### `utils.js`
Các helper dùng chung.

### `services/transactionService.js`
Tầng giao tiếp dữ liệu. UI không nên gọi localStorage hoặc FastAPI trực tiếp.

### `services/storageService.js`
Chỉ phụ trách localStorage.

### `ui/*`
Mỗi file quản lý một phần giao diện riêng.

## Vì sao cách này dễ maintain?

Luồng phụ thuộc:

```text
main.js
  ↓
appController.js
  ↓
state.js + services/
  ↓
ui/
```

UI không biết dữ liệu được lấy từ localStorage, FastAPI hay Firestore.

Khi nối FastAPI, chủ yếu chỉnh:

```text
js/config.js
js/services/transactionService.js
```

Các file biểu đồ, transaction UI, sidebar... gần như không cần thay đổi.

## Chạy project

Do sử dụng ES Modules:

```html
<script type="module" src="./js/main.js"></script>
```

nên khuyến nghị chạy bằng HTTP server thay vì double-click trực tiếp file.

### VS Code

Cài extension Live Server rồi:

```text
Open with Live Server
```

### Python

Trong thư mục project:

```bash
python -m http.server 5500
```

sau đó mở:

```text
http://localhost:5500
```

## Kết nối FastAPI

Trong `js/config.js`:

```js
export const APP_CONFIG = {
  apiBaseUrl: "http://127.0.0.1:8000/api",
  useLocalDemo: true,
  monthlyBudget: 10_000_000,
  storageKey: "moneyflow_transactions",
};
```

Khi backend sẵn sàng:

```js
useLocalDemo: false
```

Sau đó `transactionService.js` sẽ là nơi xử lý `fetch()`.

## Firebase Authentication

Khi thêm Firebase Auth, nên tạo thêm:

```text
js/services/authService.js
```

`authService.js` chịu trách nhiệm lấy Firebase ID token.

`transactionService.js` chỉ gọi:

```js
const token = await getIdToken();

headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
}
```

Như vậy authentication, API và UI hoàn toàn tách biệt.
