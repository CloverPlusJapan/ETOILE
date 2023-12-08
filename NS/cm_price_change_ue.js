/**
 *  機能: CM_アイテム価格自動変更
 *  Author: 宋金来
 *  Date : 2023/11/02
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/search', '../LIBRARY/common_lib.js'],

    (runtime, search,utils) => {

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            let currRecord = scriptContext.newRecord;
            let form = scriptContext.form;
            let status = currRecord.getValue({fieldId: "custrecord_etonet_status"});// ステータス
            // ステータス なし 申請中 	承認済み 否認  編集ボタンを隠す
            if (status == '2' || status == "3" || status == "4") hiddenButton(form);
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            let currRecord = scriptContext.newRecord;
            let type = scriptContext.type
            if (type == "delete") return;
            let item = currRecord.getValue({fieldId: "custrecord_etonet_item"});// アイテム
            let startDate = currRecord.getValue({fieldId: "custrecord_etonet_start_date"});// 開始日
            let endDate = currRecord.getValue({fieldId: "custrecord_etonet_end_date"});// 終了日
            let changeType = currRecord.getValue({fieldId: "custrecord_etonet_price_change_type"});// 価格変更種別
            if (startDate && endDate) {
                //日付逆チェック
                if (paramsDate(startDate) > paramsDate(endDate)) {
                    throw "価格反映　開始日・価格反映　終了日が不正ですので、正しく入力ください"
                }
            }
            let dateS = search.createColumn({
                name: "formulatext",
                formula: "to_char({custrecord_etonet_start_date},'YYYYMMDD')"
            })
            let dateE = search.createColumn({
                name: "formulatext",
                formula: "to_char({custrecord_etonet_end_date},'YYYYMMDD')"
            })
            let filtersArr = [["custrecord_etonet_item", "anyof", item]]
            if (type != "create") {
                filtersArr.push("AND", ["internalid", "noneof", currRecord.id])
            }
            let priceSearchObj = search.create({
                type: "customrecord_change_of_reservation_price",
                filters: filtersArr,
                columns: [dateS, dateE, search.createColumn({name: "custrecord_etonet_price_change_type"})]
            });
            if (priceSearchObj.runPaged().count == 0) return;
            priceSearchObj.run().each(function (res) {
                let dateA = Number(res.getValue(dateS));
                let dateB = Number(res.getValue(dateE));
                let changeTypeA = res.getValue("custrecord_etonet_price_change_type");
                //現在の記録の価格変化の種別はセール そしてsearchでは セール
                if (changeType == "1" && changeTypeA == "1") {
                    if (paramsDate(startDate) <= dateB && paramsDate(endDate) >= dateA) {
                        throw "既存のセール期間と重複しています。セール期間を修正してください。"
                    }
                    //現在の記録の セール そしてsearchでは 恒久
                } else if (changeType == "1" && changeTypeA == "2") {
                    if (paramsDate(startDate) <= dateA && paramsDate(endDate) >= dateA) {
                        throw "既存のセール期間と重複しています。セール期間を修正してください。"
                    }
                    //現在の記録の 恒久 してsearchでは  セール
                } else if (changeType == "2" && changeTypeA == "1") {
                    if (paramsDate(startDate) >= dateA && paramsDate(startDate) <= dateB) {
                        throw "既存のセール期間と重複しています。セール期間を修正してください。"
                    }
                    //現在の記録の  恒久 してsearchでは  恒久
                } else if (changeType == "2" && changeTypeA == "2") {
                    if (paramsDate(startDate) == dateA) {
                        throw "既存のセール期間と重複しています。セール期間を修正してください。"
                    }
                }
                return true;
            })
        }

        /**
         *編集ボタンを隠す
         * @param form
         */
        function hiddenButton(form) {
            let edit = form.getButton("edit");
            edit.isHidden = true;
        }

        /**
         * 日付オブジェクトの変換
         * @param date
         * @returns {string|*}
         */
        function paramsDate(date) {
            return Number( utils.setDateToString(date,"yyyyMMdd"));
        }

        return {
            beforeLoad,
            beforeSubmit,
        }
    }
);
