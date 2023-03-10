<template>
  <span :class="className">
    <slot />
    <label :for="inputId || name" />
    <input-file />
  </span>
</template>
<style lang="scss">
@import '@/assets/scss/_variables.scss';

.file-uploads {
	overflow: hidden;
	position: relative;
	text-align: center;
	display: inline-block;
}
.file-uploads.file-uploads-html4 input,
.file-uploads.file-uploads-html5 label {
	/* background fix ie  click */
	background: #fff;
	opacity: 0;
	font-size: $popup-title-font-size;
	z-index: 1;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	position: absolute;
	width: 100%;
	height: 100%;
	cursor: pointer;
}
.file-uploads.file-uploads-html5 input,
.file-uploads.file-uploads-html4 label {
	/* background fix ie  click */
	background: rgba(255, 255, 255, 0);
	overflow: hidden;
	position: fixed;
	width: 1px;
	height: 1px;
	z-index: -1;
	opacity: 0;
}
</style>
<script>
import ChunkUploadDefaultHandler from './chunk/ChunkUploadHandler';
import InputFile from './InputFile.vue';
import httpClient   from '@/apis/base/axiosHttpClient';
import commonFunc from '@/commons/commonFunction';

const CHUNK_DEFAULT_OPTIONS = {
	headers: {},
	action: '',
	minSize: 1048576,
	maxActive: 3,
	maxRetries: 5,
	handler: ChunkUploadDefaultHandler
};

export default {
	components: {
		InputFile
	},
	props: {
		inputId: {
			type: String
		},
		name: {
			type: String,
			default: 'file'
		},
		accept: {
			type: String
		},
		capture: {},
		disabled: {},
		multiple: {
			type: Boolean
		},
		maximum: {
			type: Number,
			default() {
				return this.multiple ? 0 : 1;
			}
		},
		addIndex: {
			type: [Boolean, Number]
		},
		directory: {
			type: Boolean
		},
		postAction: {
			type: String
		},
		putAction: {
			type: String
		},
		customAction: {
			type: Function
		},
		headers: {
			type: Object,
			default: Object
		},
		data: {
			type: Object,
			default: Object
		},
		timeout: {
			type: Number,
			default: 0
		},
		fileType: {
			default: Array
		},
		drop: {
			default: false
		},
		dropDirectory: {
			type: Boolean,
			default: true
		},
		size: {
			type: Number,
			default: 0
		},
		extensions: {
			default: Array
		},
		value: {
			type: Array,
			default: Array
		},
		thread: {
			type: Number,
			default: 1
		},
		// Chunk upload enabled
		chunkEnabled: {
			type: Boolean,
			default: false
		},
		// Chunk upload properties
		chunk: {
			type: Object,
			default: () => {
				return CHUNK_DEFAULT_OPTIONS;
			}
		},
		paramsKey: {
			default: 'file',
			type: String
		}
	},
	data() {
		return {
			files: this.value,
			features: {
				html5: true,
				directory: false,
				drag: false
			},
			active: false,
			dropActive: false,
			uploading: 0,
			destroy: false
		};
	},

	computed: {
		/**
		 * uploading ?????????????????????
		 * @return {[type]} [description]
		 */

		/**
		 * uploaded ?????????????????????????????????
		 * @return {[type]} [description]
		 */
		uploaded() {
			let file;
			for (let i = 0; i < this.files.length; i++) {
				file = this.files[i];
				if (file.fileObject && !file.error && !file.success) {
					return false;
				}
			}
			return true;
		},

		chunkOptions() {
			return Object.assign(CHUNK_DEFAULT_OPTIONS, this.chunk);
		},

		className() {
			return [
				'file-uploads',
				this.features.html5 ? 'file-uploads-html5' : 'file-uploads-html4',
				this.features.directory && this.directory
					? 'file-uploads-directory'
					: undefined,
				this.features.drop && this.drop ? 'file-uploads-drop' : undefined,
				this.disabled ? 'file-uploads-disabled' : undefined
			];
		}
	},

	watch: {
		active(active) {
			this.watchActive(active);
		},

		dropActive() {
			if (this.$parent) {
				this.$parent.$forceUpdate();
			}
		},

		drop(value) {
			this.watchDrop(value);
		},

		value(files) {
			if (this.files === files) {
				return;
			}
			this.files = files;

			let oldMaps = this.maps;

			// ?????? maps ??????
			this.maps = {};
			for (let i = 0; i < this.files.length; i++) {
				let file = this.files[i];
				this.maps[file.id] = file;
			}

			// add, update
			for (let key in this.maps) {
				let newFile = this.maps[key];
				let oldFile = oldMaps[key];
				if (newFile !== oldFile) {
					this.emitFile(newFile, oldFile);
				}
			}

			// delete
			for (let key in oldMaps) {
				if (!this.maps[key]) {
					this.emitFile(undefined, oldMaps[key]);
				}
			}
		}
	},

	/**
	 * mounted
	 * @return {[type]} [description]
	 */
	mounted() {
		let input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;

		// html5 ?????c t??nh
		if (window.FormData && input.files) {
			// T???i l??n c??c t??nh n??ng th?? m???c
			if (
				typeof input.webkitdirectory === 'boolean' ||
				typeof input.directory === 'boolean'
			) {
				this.features.directory = true;
			}

			// T??nh n??ng k??o
			if (this.features.html5 && typeof input.ondrop !== 'undefined') {
				this.features.drop = true;
			}
		} else {
			this.features.html5 = false;
		}

		// B??? nh??? cache v??? tr?? files
		this.maps = {};
		if (this.files) {
			for (let i = 0; i < this.files.length; i++) {
				let file = this.files[i];
				this.maps[file.id] = file;
			}
		}

		this.$nextTick(function() {
			// C???p nh???t cha ti???p theo
			if (this.$parent) {
				this.$parent.$forceUpdate();
				// K??o v?? th???
				this.$parent.$nextTick(() => {
					this.watchDrop(this.drop);
				});
			} else {
				// K??o v?? th???
				this.watchDrop(this.drop);
			}
		});
	},

	/**
	 * beforeDestroy
	 * @return {[type]} [description]
	 */
	beforeDestroy() {
		// ?????????
		this.destroy = true;

		// ??????????????????
		this.active = false;

		// ??????????????????
		this.watchDrop(false);
	},

	methods: {
		// ??????
		clear() {
			if (this.files.length) {
				let files = this.files;
				this.files = [];

				// ??????
				this.maps = {};

				// ??????
				this.emitInput();
				for (let i = 0; i < files.length; i++) {
					this.emitFile(undefined, files[i]);
				}
			}
			return true;
		},

		// ??????
		get(id) {
			if (!id) {
				return false;
			}

			if (typeof id === 'object') {
				return this.maps[id.id] || false;
			}

			return this.maps[id] || false;
		},

		// ??????
		add(_files, index = this.addIndex) {
			let files = _files;
			let isArray = files instanceof Array;

			// ???????????????????????????
			if (!isArray) {
				files = [files];
			}

			// ??????????????????
			let addFiles = [];
			for (let i = 0; i < files.length; i++) {
				let file = files[i];
				if (this.features.html5 && file instanceof Blob) {
					file = {
						file,
						size: file.size,
						name:
							file.webkitRelativePath ||
							file.relativePath ||
							file.name ||
							'unknown',
						type: file.type
					};
				}
				let fileObject = false;
				if (file.fileObject === false) {
					// false
				} else if (file.fileObject) {
					fileObject = true;
				} else if (
					typeof Element !== 'undefined' &&
					file.el instanceof Element
				) {
					fileObject = true;
				} else if (typeof Blob !== 'undefined' && file.file instanceof Blob) {
					fileObject = true;
				}
				if (fileObject) {
					file = {
						fileObject: true,
						size: -1,
						name: 'Filename',
						type: '',
						active: false,
						error: '',
						success: false,
						putAction: this.putAction,
						postAction: this.postAction,
						timeout: this.timeout,
						...file,
						response: {},

						progress: '0.00', // ??????
						speed: 0 // ??????
						// xhr: false,                // ??????
						// iframe: false,             // ??????
					};

					file.data = {
						...this.data,
						...(file.data ? file.data : {})
					};

					httpClient._processHeaders(file);
					file.headers = {
						...this.headers,
						...(file.headers ? file.headers : {})
					};
				}

				// ???????????? id
				if (!file.id) {
					file.id = Math.random()
						.toString(36)
						.substr(2);
				}

				if (this.emitFilter(file, undefined)) {
					continue;
				}

				// ??????????????????
				if (
					this.maximum > 1 &&
					addFiles.length + this.files.length >= this.maximum
				) {
					break;
				}

				addFiles.push(file);

				// ??????????????????
				if (this.maximum === 1) {
					break;
				}
			}

			// ????????????
			if (!addFiles.length) {
				return false;
			}

			// ????????? 1 ??????
			if (this.maximum === 1) {
				this.clear();
			}

			// ???????????? files
			let newFiles;
			if (index === true || index === 0) {
				newFiles = addFiles.concat(this.files);
			} else if (index) {
				newFiles = this.files.concat([]);
				newFiles.splice(index, 0, ...addFiles);
			} else {
				newFiles = this.files.concat(addFiles);
			}

			this.files = newFiles;

			// ??????
			for (let i = 0; i < addFiles.length; i++) {
				let file = addFiles[i];
				this.maps[file.id] = file;
			}

			// ??????
			this.emitInput();
			for (let i = 0; i < addFiles.length; i++) {
				this.emitFile(addFiles[i], undefined);
			}

			return isArray ? addFiles : addFiles[0];
		},

		// ??????????????????
		addInputFile(el) {
			let files = [];
			if (el.files) {
				for (let i = 0; i < el.files.length; i++) {
					let file = el.files[i];
					files.push({
						size: file.size,
						name: file.webkitRelativePath || file.relativePath || file.name,
						type: file.type,
						file
					});
				}
			} else {
				let names = el.value.replace(/\\/g, '/').split('/');
				delete el.__vuex__;
				files.push({
					name: names[names.length - 1],
					el
				});
			}
			if (this.fileType && this.fileType.length > 0) {
				let ret = false;
				files.forEach(file => {
					this.fileType.forEach(type => {
						if (file.name.endsWith(type)) {
							ret = true;
						}
					});
				});
				if (!ret) {
					this.$emit('errorsType');
					return null;
				}
			}
			return this.add(files);
		},

		// ?????? DataTransfer
		addDataTransfer(dataTransfer) {
			let files = [];
			if (dataTransfer.items && dataTransfer.items.length) {
				let items = [];
				for (let i = 0; i < dataTransfer.items.length; i++) {
					let item = dataTransfer.items[i];
					if (item.getAsEntry) {
						item = item.getAsEntry() || item.getAsFile();
					} else if (item.webkitGetAsEntry) {
						item = item.webkitGetAsEntry() || item.getAsFile();
					} else {
						item = item.getAsFile();
					}
					if (item) {
						items.push(item);
					}
				}

				return new Promise((resolve, reject) => {
					let forEach = i => {
						let item = items[i];
						// ?????? ?????????????????? ????????????
						if (!item || (this.maximum > 0 && files.length >= this.maximum)) {
							return resolve(this.add(files));
						}
						this.getEntry(item).then(function(results) {
							files.push(...results);
							forEach(i + 1);
						});
					};
					forEach(0);
				});
			}

			if (dataTransfer.files.length) {
				for (let i = 0; i < dataTransfer.files.length; i++) {
					files.push(dataTransfer.files[i]);
					if (this.maximum > 0 && files.length >= this.maximum) {
						break;
					}
				}
				return Promise.resolve(this.add(files));
			}

			return Promise.resolve([]);
		},

		// ?????? entry
		getEntry(entry, path = '') {
			return new Promise((resolve, reject) => {
				if (entry.isFile) {
					entry.file(function(file) {
						resolve([
							{
								size: file.size,
								name: path + file.name,
								type: file.type,
								file
							}
						]);
					});
				} else if (entry.isDirectory && this.dropDirectory) {
					let files = [];
					let dirReader = entry.createReader();
					let readEntries = () => {
						dirReader.readEntries(entries => {
							let forEach = i => {
								if (
									(!entries[i] && i === 0) ||
									(this.maximum > 0 && files.length >= this.maximum)
								) {
									return resolve(files);
								}
								if (!entries[i]) {
									return readEntries();
								}
								this.getEntry(entries[i], path + entry.name + '/').then(
									results => {
										files.push(...results);
										forEach(i + 1);
									}
								);
							};
							forEach(0);
						});
					};
					readEntries();
				} else {
					resolve([]);
				}
			});
		},

		replace(id1, id2) {
			let file1 = this.get(id1);
			let file2 = this.get(id2);
			if (!file1 || !file2 || file1 === file2) {
				return false;
			}
			let files = this.files.concat([]);
			let index1 = files.indexOf(file1);
			let index2 = files.indexOf(file2);
			if (index1 === -1 || index2 === -1) {
				return false;
			}
			files[index1] = file2;
			files[index2] = file1;
			this.files = files;
			this.emitInput();
			return true;
		},

		// ??????
		remove(id) {
			let file = this.get(id);
			if (file) {
				if (this.emitFilter(undefined, file)) {
					return false;
				}
				let files = this.files.concat([]);
				let index = files.indexOf(file);
				if (index === -1) {
					console.error('remove', file);
					return false;
				}
				files.splice(index, 1);
				this.files = files;

				// ??????
				delete this.maps[file.id];

				// ??????
				this.emitInput();
				this.emitFile(undefined, file);
			}
			return file;
		},

		// ??????
		update(id, data) {
			let file = this.get(id);
			if (file) {
				let newFile = {
					...file,
					...data
				};
				// ????????????????????????
				if (
					file.fileObject &&
					file.active &&
					!newFile.active &&
					!newFile.error &&
					!newFile.success
				) {
					newFile.error = 'abort';
				}

				if (this.emitFilter(newFile, file)) {
					return false;
				}

				let files = this.files.concat([]);
				let index = files.indexOf(file);
				if (index === -1) {
					console.error('update', file);
					return false;
				}
				files.splice(index, 1, newFile);
				this.files = files;

				// ??????  ????????? ?????? ????????? ?????????????????????id)
				delete this.maps[file.id];
				this.maps[newFile.id] = newFile;

				// ??????
				this.emitInput();
				this.emitFile(newFile, file);
				return newFile;
			}
			return false;
		},

		// ????????? ?????? ?????????
		emitFilter(newFile, oldFile) {
			let isPrevent = false;
			this.$emit('input-filter', newFile, oldFile, function() {
				isPrevent = true;
				return isPrevent;
			});
			return isPrevent;
		},

		// ????????? ?????? ??????
		emitFile(newFile, oldFile) {
			this.$emit('input-file', newFile, oldFile);
			if (
				newFile &&
				newFile.fileObject &&
				newFile.active &&
				(!oldFile || !oldFile.active)
			) {
				this.uploading++;
				// ??????
				this.$nextTick(function() {
					setTimeout(() => {
						this.upload(newFile)
							.then(() => {
								// eslint-disable-next-line
								newFile = this.get(newFile);
								if (newFile && newFile.fileObject) {
									this.update(newFile, {
										active: false,
										success: !newFile.error
									});
								}
							})
							.catch(e => {
								this.update(newFile, {
									active: false,
									success: false,
									error: e.code || e.error || e.message || e
								});
							});
					}, parseInt(Math.random() * 50 + 50, 10));
				});
			} else if (
				(!newFile || !newFile.fileObject || !newFile.active) &&
				oldFile &&
				oldFile.fileObject &&
				oldFile.active
			) {
				// ??????
				this.uploading--;
			}

			// ??????????????????
			if (
				this.active &&
				(Boolean(newFile) !== Boolean(oldFile) ||
					newFile.active !== oldFile.active)
			) {
				this.watchActive(true);
			}
		},

		emitInput() {
			this.$emit('input', this.files);
		},

		// ??????
		upload(id) {
			let file = this.get(id);

			// ?????????
			if (!file) {
				return Promise.reject('not_exists');
			}

			// ??????????????????
			if (!file.fileObject) {
				return Promise.reject('file_object');
			}

			// ?????????????????????
			if (file.error) {
				return Promise.reject(file.error);
			}

			// ?????????????????????
			if (file.success) {
				return Promise.resolve(file);
			}

			// ??????
			let extensions = this.extensions;
			if (
				extensions &&
				(extensions.length || typeof extensions.length === 'undefined')
			) {
				if (typeof extensions !== 'object' || !(extensions instanceof RegExp)) {
					if (typeof extensions === 'string') {
						extensions = extensions
							.split(',')
							.map(value => value.trim())
							.filter(value => value);
					}
					extensions = new RegExp(
						'\\.(' + extensions.join('|').replace(/\./g, '\\.') + ')$',
						'i'
					);
				}
				if (file.name.search(extensions) === -1) {
					return Promise.reject('extension');
				}
			}

			// ??????
			if (this.size > 0 && file.size >= 0 && file.size > this.size) {
				return Promise.reject('size');
			}

			if (this.customAction) {
				return this.customAction(file, this);
			}

			if (this.features.html5) {
				if (this.shouldUseChunkUpload(file)) {
					return this.uploadChunk(file);
				}
				if (file.putAction) {
					return this.uploadPut(file);
				}
				if (file.postAction) {
					return this.uploadHtml5(file);
				}
			}
			if (file.postAction) {
				return this.uploadHtml4(file);
			}
			return Promise.reject('No action configured');
		},

		/**
		 * Whether this file should be uploaded using chunk upload or not
		 *
		 * @param Object file
		 */
		shouldUseChunkUpload(file) {
			return (
				this.chunkEnabled &&
				!!this.chunkOptions.handler &&
				file.size > this.chunkOptions.minSize
			);
		},

		/**
		 * Upload a file using Chunk method
		 *
		 * @param File file
		 */
		uploadChunk(file) {
			const HandlerClass = this.chunkOptions.handler;
			file.chunk = new HandlerClass(file, this.chunkOptions);

			return file.chunk.upload();
		},

		uploadPut(file) {
			let querys = [];
			let value;
			for (let key in file.data) {
				value = file.data[key];
				if (value !== null && value !== undefined) {
					querys.push(
						encodeURIComponent(key) + '=' + encodeURIComponent(value)
					);
				}
			}
			let queryString = querys.length
				? (file.putAction.indexOf('?') === -1 ? '?' : '&') + querys.join('&')
				: '';
			let xhr = new XMLHttpRequest();
			xhr.open('PUT', file.putAction + queryString);
			return this.uploadXhr(xhr, file, file.file);
		},

		uploadHtml5(file) {
			let form = new window.FormData();
			let value;
			for (let key in file.data) {
				value = file.data[key];
				if (
					value &&
					typeof value === 'object' &&
					typeof value.toString !== 'function'
				) {
					if (value instanceof File) {
						form.append(key, value, value.name);
					} else {
						form.append(key, JSON.stringify(value));
					}
				} else if (value !== null && value !== undefined) {
					form.append(key, value);
				}
			}
			form.append(this.paramsKey, file.file, file.file.filename || file.name);
			let xhr = new XMLHttpRequest();
			xhr.open('POST', file.postAction);
			return this.uploadXhr(xhr, file, form);
		},

		uploadXhr(xhr, _file, body) {
			let file = _file;
			let speedTime = 0;
			let speedLoaded = 0;

			// ?????????
			xhr.upload.onprogress = e => {
				// ?????????????????? ????????? ?????????
				file = this.get(file);
				if (!e.lengthComputable || !file || !file.fileObject || !file.active) {
					return;
				}

				// ?????? ?????? ??????????????????
				let speedTime2 = Math.round(Date.now() / 1000);
				if (speedTime2 === speedTime) {
					return;
				}
				speedTime = speedTime2;

				file = this.update(file, {
					progress: ((e.loaded / e.total) * 100).toFixed(2),
					speed: e.loaded - speedLoaded
				});
				speedLoaded = e.loaded;
			};

			// ??????????????????
			let interval = setInterval(() => {
				file = this.get(file);
				if (
					file &&
					file.fileObject &&
					!file.success &&
					!file.error &&
					file.active
				) {
					return;
				}

				if (interval) {
					clearInterval(interval);
					interval = false;
				}

				try {
					xhr.abort();
					xhr.timeout = 1;
				} catch (e) {}
			}, 100);
			commonFunc.mask();
			return new Promise((resolve, reject) => {
				let complete;
				let fn = e => {
					// ??????????????????
					if (complete) {
						return;
					}
					complete = true;
					if (interval) {
						clearInterval(interval);
						interval = false;
					}

					file = this.get(file);

					// ?????????????????????
					if (!file) {
						return reject('not_exists');
					}

					// ??????????????????
					if (!file.fileObject) {
						return reject('file_object');
					}

					// ?????????????????????
					if (file.error) {
						return reject(file.error);
					}

					// ?????????
					if (!file.active) {
						return reject('abort');
					}

					// ????????? ????????????
					if (file.success) {
						return resolve(file);
					}

					let data = {};

					switch (e.type) {
						case 'timeout':
						case 'abort':
							data.error = e.type;
							break;
						case 'error':
							if (!xhr.status) {
								data.error = 'network';
							} else if (xhr.status >= 500) {
								data.error = 'server';
							} else if (xhr.status >= 400) {
								data.error = 'denied';
							}
							break;
						default:
							if (xhr.status >= 500) {
								data.error = 'server';
							} else if (xhr.status >= 400) {
								data.error = 'denied';
							} else {
								data.progress = '100.00';
							}
					}

					if (xhr.responseText) {
						let contentType = xhr.getResponseHeader('Content-Type');
						if (contentType && contentType.indexOf('/json') !== -1) {
							data.response = JSON.parse(xhr.responseText);
						} else {
							data.response = xhr.responseText;
						}
					}

					// ??????
					file = this.update(file, data);

					// ????????????
					if (file.error) {
						commonFunc.unmask();

						return reject(file.error);
					}
					commonFunc.unmask();

					// ??????
					return resolve(file);
				};

				// ??????
				xhr.onload = fn;
				xhr.onerror = fn;
				xhr.onabort = fn;
				xhr.ontimeout = fn;

				// ??????
				if (file.timeout) {
					xhr.timeout = file.timeout;
				}

				// headers
				for (let key in file.headers) {
					if (key == 'Content-Type') {
						continue;
					}
					xhr.setRequestHeader(key, file.headers[key]);
				}

				// ?????? xhr
				file = this.update(file, { xhr });

				// ????????????
				xhr.send(body);
			});
		},

		uploadHtml4(_file) {
			let file = _file;
			let onKeydown = function(e) {
				if (e.keyCode === 27) {
					e.preventDefault();
				}
			};

			let iframe = document.createElement('iframe');
			iframe.id = 'upload-iframe-' + file.id;
			iframe.name = 'upload-iframe-' + file.id;
			iframe.src = 'about:blank';
			iframe.setAttribute(
				'style',
				'width:1px;height:1px;top:-999em;position:absolute; margin-top:-999em;'
			);

			let form = document.createElement('form');

			form.action = file.postAction;

			form.name = 'upload-form-' + file.id;

			form.setAttribute('method', 'POST');
			form.setAttribute('target', 'upload-iframe-' + file.id);
			form.setAttribute('enctype', 'multipart/form-data');

			let value;
			let input;
			for (let key in file.data) {
				value = file.data[key];
				if (
					value &&
					typeof value === 'object' &&
					typeof value.toString !== 'function'
				) {
					value = JSON.stringify(value);
				}
				if (value !== null && value !== undefined) {
					input = document.createElement('input');
					input.type = 'hidden';
					input.name = key;
					input.value = value;
					form.appendChild(input);
				}
			}
			form.appendChild(file.el);

			document.body.appendChild(iframe).appendChild(form);

			let getResponseData = function() {
				let doc;
				try {
					if (iframe.contentWindow) {
						doc = iframe.contentWindow.document;
					}
				} catch (err) {}
				if (!doc) {
					try {
						doc = iframe.contentDocument
							? iframe.contentDocument
							: iframe.document;
					} catch (err) {
						doc = iframe.document;
					}
				}
				if (doc && doc.body) {
					return doc.body.innerHTML;
				}
				return null;
			};

			return new Promise((resolve, reject) => {
				setTimeout(() => {
					file = this.update(file, { iframe });

					// ?????????
					if (!file) {
						return reject('not_exists');
					}

					// ????????????
					let interval = setInterval(() => {
						file = this.get(file);
						if (
							file &&
							file.fileObject &&
							!file.success &&
							!file.error &&
							file.active
						) {
							return;
						}

						if (interval) {
							clearInterval(interval);
							interval = false;
						}

						iframe.onabort({ type: file ? 'abort' : 'not_exists' });
					}, 100);

					let complete;
					let fn = e => {
						// ??????????????????
						if (complete) {
							return;
						}
						complete = true;

						if (interval) {
							clearInterval(interval);
							interval = false;
						}

						// ?????? esc ??????
						document.body.removeEventListener('keydown', onKeydown);

						file = this.get(file);

						// ?????????????????????
						if (!file) {
							return reject('not_exists');
						}

						// ??????????????????
						if (!file.fileObject) {
							return reject('file_object');
						}

						// ?????????????????????
						if (file.error) {
							return reject(file.error);
						}

						// ?????????
						if (!file.active) {
							return reject('abort');
						}

						// ????????? ????????????
						if (file.success) {
							return resolve(file);
						}

						let response = getResponseData();
						let data = {};
						switch (e.type) {
							case 'abort':
								data.error = 'abort';
								break;
							case 'error':
								if (file.error) {
									data.error = file.error;
								} else if (response === null) {
									data.error = 'network';
								} else {
									data.error = 'denied';
								}
								break;
							default:
								if (file.error) {
									data.error = file.error;
								} else if (data === null) {
									data.error = 'network';
								} else {
									data.progress = '100.00';
								}
						}

						if (response !== null) {
							if (
								response &&
								response.substr(0, 1) === '{' &&
								response.substr(response.length - 1, 1) === '}'
							) {
								try {
									response = JSON.parse(response);
								} catch (err) {}
							}
							data.response = response;
						}

						// ??????
						file = this.update(file, data);

						if (file.error) {
							return reject(file.error);
						}

						// ??????
						return resolve(file);
					};

					// ????????????
					iframe.onload = fn;
					iframe.onerror = fn;
					iframe.onabort = fn;

					// ?????? esc ???
					document.body.addEventListener('keydown', onKeydown);

					// ??????
					form.submit();
				}, 50);
			})
				.then(function(res) {
					iframe.parentNode && iframe.parentNode.removeChild(iframe);
					return res;
				})
				.catch(function(res) {
					iframe.parentNode && iframe.parentNode.removeChild(iframe);
					return res;
				});
		},

		watchActive(active) {
			let file;
			let index = 0;
			while ((file = this.files[index])) {
				index++;
				if (!file.fileObject) {
					// ??????????????????
				} else if (active && !this.destroy) {
					if (
						this.uploading >= this.thread ||
						(this.uploading && !this.features.html5)
					) {
						break;
					}
					if (!file.active && !file.error && !file.success) {
						this.update(file, { active: true });
					}
				} else {
					if (file.active) {
						this.update(file, { active: false });
					}
				}
			}
			if (this.uploading === 0) {
				this.active = false;
			}
		},

		watchDrop(_el) {
			let el = _el;
			if (!this.features.drop) {
				return;
			}

			// ????????????
			if (this.dropElement) {
				try {
					document.removeEventListener('dragenter', this.onDragenter, false);
					document.removeEventListener('dragleave', this.onDragleave, false);
					document.removeEventListener('drop', this.onDocumentDrop, false);
					this.dropElement.removeEventListener(
						'dragover',
						this.onDragover,
						false
					);
					this.dropElement.removeEventListener('drop', this.onDrop, false);
				} catch (e) {}
			}

			if (!el) {
				el = false;
			} else if (typeof el === 'string') {
				el = document.querySelector(el) || this.$root.$el.querySelector(el);
			} else if (el === true) {
				el = this.$parent.$el;
			}

			this.dropElement = el;

			if (this.dropElement) {
				document.addEventListener('dragenter', this.onDragenter, false);
				document.addEventListener('dragleave', this.onDragleave, false);
				document.addEventListener('drop', this.onDocumentDrop, false);
				this.dropElement.addEventListener('dragover', this.onDragover, false);
				this.dropElement.addEventListener('drop', this.onDrop, false);
			}
		},

		onDragenter(e) {
			e.preventDefault();
			if (this.dropActive) {
				return;
			}
			if (!e.dataTransfer) {
				return;
			}
			let dt = e.dataTransfer;
			if (dt.files && dt.files.length) {
				this.dropActive = true;
			} else if (!dt.types) {
				this.dropActive = true;
			} else if (dt.types.indexOf && dt.types.indexOf('Files') !== -1) {
				this.dropActive = true;
			} else if (dt.types.contains && dt.types.contains('Files')) {
				this.dropActive = true;
			}
		},

		onDragleave(e) {
			e.preventDefault();
			if (!this.dropActive) {
				return;
			}
			if (
				e.target.nodeName === 'HTML' ||
				e.target === e.explicitOriginalTarget ||
				(!e.fromElement &&
					(e.clientX <= 0 ||
						e.clientY <= 0 ||
						e.clientX >= window.innerWidth ||
						e.clientY >= window.innerHeight))
			) {
				this.dropActive = false;
			}
		},

		onDragover(e) {
			e.preventDefault();
		},

		onDocumentDrop() {
			this.dropActive = false;
		},

		onDrop(e) {
			e.preventDefault();
			this.addDataTransfer(e.dataTransfer);
		}
	}
};
</script>
