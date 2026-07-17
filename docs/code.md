# Code Organization Rule

Khi implement hoặc refactor code, tuyệt đối không gộp toàn bộ logic vào một file lớn.

## Bắt buộc tách file theo chuẩn senior

Mỗi màn hình / feature phải được chia theo trách nhiệm rõ ràng:

- `page.tsx` / `screen.tsx`: chỉ làm nhiệm vụ compose UI, gọi hook, render layout.
- `components/`: chứa các component nhỏ, reusable, không chứa business logic nặng.
- `hooks/`: chứa state logic, fetch API, mutation, form handling.
- `services/` hoặc `api/`: chứa hàm gọi API.
- `types.ts`: chứa interface/type dùng cho feature.
- `constants.ts`: chứa mock data, options, config tĩnh.
- `utils.ts`: chứa hàm xử lý dữ liệu thuần. 
- `schemas.ts`: chứa validation schema nếu có form.

## Nguyên tắc bắt buộc

1. Không tạo component quá 300 dòng nếu có thể tách nhỏ.
2. Không viết API call trực tiếp trong component UI.
3. Không viết business logic phức tạp trong JSX.
4. Không hard-code data lớn trong component.
5. Không duplicate type/interface giữa nhiều file.
6. File chỉ nên có một trách nhiệm chính.
7. Ưu tiên đặt file gần feature đang dùng, không đưa hết vào global nếu chưa reusable.
8. Nếu thêm code mới, phải kiểm tra có common component/hook/service đã tồn tại chưa rồi mới tạo mới.
9. Khi refactor, không đổi UI/UX nếu task không yêu cầu.
10. Luôn export/import rõ ràng, tránh tạo circular dependency.

## Cấu trúc feature khuyến nghị

```txt
src/features/<feature-name>/
├── components/
│   ├── <FeatureHeader>.tsx
│   ├── <FeatureForm>.tsx
│   └── <FeatureTable>.tsx
├── hooks/
│   ├── use<FeatureName>.ts
│   └── use<FeatureMutation>.ts
├── services/
│   └── <featureName>.api.ts
├── types.ts
├── constants.ts
├── utils.ts
└── index.ts