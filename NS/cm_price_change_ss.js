/**
 * 機能: CM_アイテム価格自動変更
 * Author: 宋金来
 * Date : 2023/11/03
 *
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/record', '../LIBRARY/constant_lib.js', '../LIBRARY/common_lib.js'],

    (search, record, lib, utils) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            let dateJson = {}; //Json
            let caseDate = search.createColumn({
                name: "formulatext",
                formula: "   CASE WHEN to_char({custrecord_etonet_start_date},'YYYYMMDD') = to_char({today},'YYYYMMDD')  THEN 1 END || CASE WHEN to_char({custrecord_etonet_end_date},'YYYYMMDD') = TO_CHAR({today}-1,'YYYYMMDD')  THEN 0 END"
            });//  開始日、終了日の区分
            // 予約価格変更検索
            search.create({
                type: "customrecord_change_of_reservation_price",
                filters:
                    [
                        [["custrecord_etonet_start_date", "on", "today"], "OR", ["custrecord_etonet_end_date", "on", "yesterday"]],
                        "AND",
                        ["custrecord_etonet_status", "anyof", "3"]
                    ],
                columns:
                    [
                        search.createColumn({name: "custrecord_etonet_item"}),
                        search.createColumn({name: "type", join: "CUSTRECORD_ETONET_ITEM"}),
                        search.createColumn({name: "custrecord_etonet_vendor_price", label: "仕入価格"}),
                        search.createColumn({name: "custrecord_etonet_wholesale_price", label: "卸価格"}),
                        search.createColumn({name: "custrecord_etonet_retail_price", label: "小売価格"}),
                        search.createColumn({name: "custrecord_etonet_approver_date", label: "承認日時"}),
                        search.createColumn({name: "custrecord_old_vendor_price", label: "元仕入価格"}),
                        search.createColumn({name: "custrecord_old_wholesale_price", label: "元卸価格"}),
                        search.createColumn({name: "custrecord_old_retail_price", label: "元小売価格"}),
                        caseDate
                    ]
            }).run().each(function (res) {
                dateJson.endDateArr = dateJson.endDateArr || [];
                dateJson.startDateArr = dateJson.startDateArr || [];
                let kbn = res.getValue(caseDate);
                // today 開始日は今日と同じで、更新する必要があるデータ
                if (kbn == 1) {
                    let option = {
                        id: res.id, //レコード内部ID
                        itemType: res.getValue({name: "type", join: "CUSTRECORD_ETONET_ITEM"}), //品目タイプ
                        itemId: res.getValue({name: 'custrecord_etonet_item'}), //アイテム
                        vendorPrice: res.getValue('custrecord_etonet_vendor_price'),//仕入価格
                        wholesalePrice: res.getValue('custrecord_etonet_wholesale_price'),//卸価格
                        retailPrice: res.getValue('custrecord_etonet_retail_price'),//小売価格
                    };
                    dateJson.startDateArr.push(option);
                } else {
                    //yesterday  終了日は昨日のデータに等しく、データの更新が必要です
                    let option = {
                        itemType: res.getValue({name: "type", join: "CUSTRECORD_ETONET_ITEM"}),//品目タイプ
                        itemId: res.getValue({name: 'custrecord_etonet_item'}),//アイテム
                        vendorPrice: res.getValue('custrecord_old_vendor_price'),//元仕入価格
                        wholesalePrice: res.getValue('custrecord_old_wholesale_price'),//元卸価格
                        retailPrice: res.getValue('custrecord_old_retail_price'),//元小売価格
                    };
                    dateJson.endDateArr.push(option);
                }
                return true;
            })
            if (utils.isEmpty(dateJson)) {
                return;
            }
            //終了日の更新を先に実行する
            endDateExecute(dateJson.endDateArr);
            //実行開始日の更新
            startDateExecute(dateJson.startDateArr);
        }

        /**
         *  品目の更新の実行
         * @param dateArr 配列の更新
         */
        function endDateExecute(dateArr) {
            for (let count = 0; count < dateArr.length; count++) {
                let itemArr = dateArr[count];
                let itemType = itemArr.itemType;
                let itemId = itemArr.itemId;
                try {
                    let ltemRec = record.load({type: lib.ITEM_TYPE[itemType], id: itemId, isDynamic: true});
                    ltemRec.setValue({
                        fieldId: "custitem_wholesale_price",
                        value: itemArr.wholesalePrice
                    });//卸価格
                    ltemRec.setValue({
                        fieldId: "cost",
                        value: itemArr.vendorPrice
                    });//仕入価格
                    ltemRec.setValue({
                        fieldId: "custitem_retail_price",
                        value: itemArr.retailPrice
                    });//小売価格
                    ltemRec.save({ignoreMandatoryFields: true});
                } catch (e) {
                    log.audit("error", e);
                }
            }
        }

        /**
         *  品目の更新の実行
         * @param dateArr 配列の更新
         */
        function startDateExecute(dateArr) {
            for (let count = 0; count < dateArr.length; count++) {
                let itemArr = dateArr[count];
                let itemType = itemArr.itemType;
                let itemId = itemArr.itemId;
                try {
                    let ltemRec = record.load({type: lib.ITEM_TYPE[itemType], id: itemId, isDynamic: true});
                    let wholesalePrice = ltemRec.getValue({fieldId: "custitem_wholesale_price"})
                    let cost = ltemRec.getValue({fieldId: "cost"})
                    let retailPrice = ltemRec.getValue({fieldId: "custitem_retail_price"})
                    record.submitFields({
                        type: "customrecord_change_of_reservation_price",
                        id: itemArr.id,
                        values: {
                            custrecord_old_vendor_price: cost, //元仕入価格
                            custrecord_old_wholesale_price: wholesalePrice,//元卸価格
                            custrecord_old_retail_price: retailPrice//元小売価格
                        }
                    })
                    ltemRec.setValue({fieldId: "custitem_wholesale_price", value: itemArr.wholesalePrice});//卸価格
                    ltemRec.setValue({fieldId: "cost", value: itemArr.vendorPrice});//仕入価格
                    ltemRec.setValue({fieldId: "custitem_retail_price", value: itemArr.retailPrice});//小売価格
                    ltemRec.save({ignoreMandatoryFields: true});
                } catch (e) {
                    log.audit("error", e);
                }
            }
        }


        return {execute}

    });
