export default {
    name: 'vi',
    messages: {
        _default: field => `Giá trị của ${field} không đúng.`,
        after: (field, [target]) => `${field} phải xuất hiện sau ${target}.`,
        alpha: field => `${field} chỉ có thể chứa các kí tự chữ.`,
        alpha_dash: field =>
            `${field} có thể chứa các kí tự chữ (A-Z a-z), số (0-9), gạch ngang (-) và gạch dưới (_).`,
        alpha_num: field => `${field} chỉ có thể chứa các kí tự chữ và số.`,
        alpha_spaces: field =>
            `${field} chỉ có thế chứa các kí tự và khoảng trắng.`,
        before: (field, [target]) => `${field} phải xuất hiện trước ${target}.`,
        between: (field, [min, max]) =>
            `${field} phải có giá trị nằm trong khoảng giữa ${min} và ${max}.`,
        confirmed: (field, [confirmedField]) =>
            `${field} khác với ${confirmedField}.`,
        credit_card: field => `Đã điền ${field} không chính xác.`,
        date_between: (field, [min, max]) =>
            `${field} phải có giá trị nằm trong khoảng giữa  ${min} và ${max}.`,
        date_format: (field, [format]) =>
            `${field} phải có giá trị dưới định dạng ${format}.`,
        decimal: (field, [decimals = '*'] = []) =>
            `${field} chỉ có thể chứa các kí tự số và dấu thập phân${!decimals || decimals === '*' ? '' : ' ' + decimals
            }.`,
        digits: (field, [length]) =>
            `Trường ${field} chỉ có thể chứa các kí tự số và bắt buộc phải có độ dài là ${length}.`,
        dimensions: (field, [width, height]) =>
            `${field} phải có chiều rộng ${width} pixels và chiều cao ${height} pixels.`,
        email: field => `${field} không đúng định dạng.`,
        excluded: field => `${field} phải chứa một giá trị hợp lệ.`,
        ext: field => `${field} phải là một tệp.`,
        image: field => `Trường ${field} phải là một ảnh.`,
        included: field => `${field} phải là một giá trị.`,
        ip: field => `${field} phải là một địa chỉ ip hợp lệ.`,
        max: (field, [length]) =>
            `${field} không thể có nhiều hơn ${length} kí tự.`,
        max_value: (field, [max]) => `${field} phải nhỏ hơn hoặc bằng ${max}.`,
        mimes: field => `${field} phải chứa kiểu tệp phù hợp.`,
        min: (field, [length]) => `${field} phải chứa ít nhất ${length} kí tự.`,
        min_value: (field, [min]) => `${field} phải lớn hơn hoặc bằng ${min}.`,
        numeric: field => `${field} chỉ có thể có các kí tự số.`,
        regex: field => `${field} có định dạng không đúng.`,
        required: field => `${field} không được để trống.`,
        errorlogin: field => `Bạn đã nhập sai mật khẩu, hoặc tài khoản.`,
        upToNow: field => `${field} không được lớn hơn ngày hiện tại.`,
        upToCurrentYear: field => `${field} không được lớn hơn năm hiện tại.`,
        date_required: field => `${field} không được để trống.`,
        size: (field, [size]) =>
            `${field} chỉ có thể chứa tệp nhỏ hơn ${formatFileSize(size)}.`,
        url: field => `${field} không phải là một địa chỉ URL hợp lệ.`,
        notSelectParent: field => `Không được chọn ${field ? field : "chỉ tiêu"} cha. Vui lòng kiểm tra lại.`,
        diffierentZero: field => `${field} không được để trống và phải có giá trị khác 0`,
        forceSelection: field => `${field} không đúng. Vui lòng chọn ${field} trong danh sách.`,
        selectionAccount: field =>
            `${field} chưa có trong danh mục tài khoản ngầm định. Vui lòng vào Hệ thống\\Tùy chọn\\Tùy chọn chung\\Tài khoản, Bỏ chọn Hạn chế tài khoản khi nhập chứng từ.`,
        emailMultiple: field => `Địa chỉ ${field} không hợp lệ.`,
        taxCode: field => `Mã số thuế không hợp lệ.`,
        phoneEmail: field => `${field} sai định dạng.`,
        phone: field => `${field} không đúng.`,
        // phone_agreement: field => `Vui lòng nhập SĐT gồm 10 số (Ví dụ: 0981234567)`,
        full_name: field => `Vui lòng ghi rõ họ tên (Ví dụ: Lê Xuân Phương)`,
        requiredNumber: field => `${field} không được bỏ trống.`,
        LicenseExpried: "Hết hạn sử dụng MISA mTax. Vui lòng đặt mua thêm để thực hiện chức năng này.",
        NonLicense: "Chưa có quyền sử dụng MISA mTax. Vui lòng đặt mua hoặc thanh toán đơn hàng để thực hiện chức năng này.",
        TooQuantity: (field) => `Số lượng ${field} không được vượt quá Số lượng có thể thanh lý.`,
        notDuplicateLocationOfAsset: (field) => `Cùng một tài sản không được trùng vị trí tài sản.`,
        outPutQuantity: (field) => `Số lượng xuất phải lớn hơn 0. Vui lòng kiểm tra lại`,
        materialNotAllowNull: (field) => `Mã không được để trống.`,

    }
};