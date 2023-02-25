

## Project required
## - nodejs (>=v14.17.1)
## - vue cli (>=4.5.13)
## - vs code
## - các extension vs code (vertur, eslint) tải trên mạng
## - các extension trên trình duyệt (devtools) : hoặc tải trên mạng
## - python (npm config set python c:\python27\python.exe)
## - Cập nhật lại registry: npm config set registry "http://registry.npmjs.org/

## Project setup
```
npm config set strict-ssl false
npm config set python {PATH_TO_PYTHON}
npm i
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Quy định tên file trong project
apis: API lấy dữ liệu từ backend
	base:						API base
	dictionary:					API danh mục
	report:						API report
	voucher:					API chứng từ
	system:						API hệ thống
assets: Chứa css, scss, image, font
	css							Css chung
	font						Font sử dụng
	images						Ảnh (TÊN FILE chữ thường: icon thì tiền tố là ic_, background thì tiền tố bg_, khoảng trằng thì thay bằng '_')
	scss						Style, TÊN FILE viết chữ thường hết
		components				Style các components trong dự án
		layouts					Style layout chung
		pages					Style các page
		views					Style các views
components
filters
i18ns							Localize
layouts							Layout chung
mixins							Các hàm mixin
pages							Các page
routers							Route
stores							Store
views							Các view