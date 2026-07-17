## API UX Rules

Khi code màn hình có fetch API hoặc CRUD, bắt buộc xử lý đầy đủ các trạng thái UX:

### Fetch list/detail
- Luôn có loading state khi đang fetch lần đầu.
- Luôn có empty state khi data rỗng.
- Luôn có error state khi API lỗi.
- Không render list trực tiếp khi data chưa sẵn sàng.
- Nếu dùng React Query, dùng `isLoading`, `isFetching`, `isError`, `error`.

### Create / Edit / Delete
- Luôn có pending/loading state khi mutation đang chạy.
- Disable button submit khi pending.
- Hiển thị loading text/icon trên button, ví dụ: `Saving...`, `Creating...`, `Deleting...`.
- Success phải hiển thị toast.
- Error phải hiển thị toast lỗi.
- Sau success phải invalidate/refetch query liên quan.
- Không dùng `alert`, dùng toast/shared notification component của project.

### Toast
- Create success: `Created successfully`
- Update success: `Updated successfully`
- Delete success: `Deleted successfully`
- Error: lấy message từ API nếu có, fallback `Something went wrong`

### Form submit
- Không cho submit nhiều lần.
- Validate required fields trước khi gọi API.
- Nếu API lỗi validation, map lỗi về field nếu backend trả field errors.

### Rule bắt buộc
Không được hoàn thành task CRUD/API nếu thiếu loading, empty, error, success toast, fail toast, và query invalidation.

Bắt buộc tuân thủ docs/api.md.
Đặc biệt: mọi API fetch/CRUD phải có loading, empty, error, pending state, success toast, error toast và invalidate query.
Không được chỉ code happy path.