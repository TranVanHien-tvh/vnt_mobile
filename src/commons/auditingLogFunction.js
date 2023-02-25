import {MSEnum} from '@/commons/enumeration';
import localize from "@/i18ns/i18n";
import commonFn from "@/commons/commonFunction";

/**
 * Class chứa các hàm phục vụ render audit log
 */
class AuditingLogFunction {
	/**
	 * Hàm sinh description thêm mới và xoá
	 * @param {*} masterDescription
	 * @param {*} objAuditLog
	 * @returns
	 */
	buildAddDescription(masterDescription, objAuditLog) {
		let me = this,
			moduleName = localize.t(["i18nCommon.module.", objAuditLog.entity].join("")),
			action = commonFn.getEnumResource(
				objAuditLog.action,
				"AuditingLogAction"
			);

		// lấy đoạn text thêm ở đầu tiên của mô tả, mặc định lấy trong 18n của module tương ứng
		let preFix = me.getLocalizedText("Master.PreFix", objAuditLog);

		//nếu có preFix thì sử lý trong này
		if (preFix) {
			let defReference = JSON.parse(objAuditLog.reference);
			if (defReference && Array.isArray(defReference)) {
				//chưa phục vụ cho trường hợp thêm mới hàng loạt
			} else {
				let reference = defReference ? defReference : null;
				preFix = preFix.format(reference.code);
			}
		}

		let genLog = "";
		let logInsert = [];

		genLog = me.getLocalizedText("Master.FormatDescriptionModeAdd", objAuditLog);

		genLog = me.formatAuditingLogDescription(genLog, masterDescription, objAuditLog);

		logInsert.push(
			[[action, moduleName.toLowerCase()].join(" "), genLog].join(": ")
		);

		logInsert = logInsert.join("\n</br>");

		return logInsert;
	}

	/**
	 * Hàm sinh description update
	 * @param {} masterDescription
	 * @param {*} objAuditLog
	 */
	buildEditDescription(masterDescription, objAuditLog) {
		const me = this;

		let moduleName = localize.t(["i18nCommon.module.", objAuditLog.entity].join("")),
			action = commonFn.getEnumResource(
				objAuditLog.action,
				"AuditingLogAction"
			),
			editTextFormat = localize.$t("i18nAuditingLog.FormatStringChange");

		// lấy đoạn text thêm ở đầu tiên của mô tả, mặc định lấy trong 18n của module tương ứng
		let preFix = me.getLocalizedText("Master.PreFix", objAuditLog);

		//nếu có preFix thì sử lý trong này
		if (preFix) {
			let defReference = JSON.parse(objAuditLog.reference);
			if (defReference && Array.isArray(defReference)) {
				//chưa phục vụ cho trường hợp thêm mới hàng loạt
			} else {
				let reference = defReference ? defReference : null;
				preFix = preFix.format(reference.code);
			}
		}

		let logUpdate = [];
		for (var i of Object.keys(masterDescription)) {
			let field = me.getLocalizedText(`Field.${i}`, objAuditLog),
				des = editTextFormat.format(field, masterDescription[i].oldValue, masterDescription[i].newValue);

			logUpdate.push(des);
		}

		return `${action} ${moduleName}: <br> ${logUpdate.join("<br>")}`;
	}

	/**
	 * Hàm sinh description xoá
	 * NDHUY 06.12.2021
	 */
	buildDeleteDescription() {
		const me = this;
		let moduleName = localize.t(["i18nCommon.module.", objAuditLog.entity].join("")),
			action = commonFn.getEnumResource(
				objAuditLog.action,
				"AuditingLogAction"
			);

		return `${action} ${moduleName}.`;
	}

	/**
	 * Lấy ra i18n từ key truyền vào
	 * @param {*} metadata
	 * @param {*} key
	 * @returns
	 */
	getLocalizedText(key, metadata) {
		let result = metadata ? localize.t(`i18nAuditingLog.${metadata.entity}.${key}`) : "";

		if (result.contains("i18nAuditingLog")) {
			result = localize.t(`i18nAuditingLog.${metadata.entity}.${key}`);
		}

		if (result.contains("i18nAuditingLog")) {
			return null;
		}

		return result;
	}

	/**
	 * Format text auditing log description
	 * NDHUY 02.12.2021
	 */
	formatAuditingLogDescription(description, entity, metadata) {
		description = description || "";

		let me = this,
			pattern = new RegExp(/#{3}[0-9a-zA-Z_]*#{3}/g),
			listFieldInTemplate = description.match(pattern) || [],
			descriptionDetail = [];

		listFieldInTemplate = listFieldInTemplate.map(x => x.replaceAll("###", ""));

		for (let i of Object.keys(entity)) {
			if (listFieldInTemplate.includes(i)) {
				description = description.toString().replaceAll("###" + i + "###", entity[i]);
			} else if (description.contains("@Detail")) {
				descriptionDetail.push(`${me.getLocalizedText(`Field.${i}}`, metadata)}: ${entity[i]}`);
			}
		}

		description = description.replaceAll("@Detail", descriptionDetail.join("; "));

		return description;
	}
}

export const auditingLogFunction = new AuditingLogFunction();

export const DescriptionLogFactory = {
	getDescription(description, entityAuditLog) {
		let me = this;
		switch (entityAuditLog.action) {
			case MSEnum.AuditingLogAction.Insert:
				return auditingLogFunction.buildAddDescription(description.master, entityAuditLog);
			case MSEnum.AuditingLogAction.Edit:
				return auditingLogFunction.buildEditDescription(description.master, entityAuditLog);
			case MSEnum.AuditingLogAction.Delete:
				return auditingLogFunction.buildDeleteDescription(description.master, entityAuditLog);
		}
	}
}