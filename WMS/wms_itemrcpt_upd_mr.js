/**
 * 機能: WMS_入庫連携_プログラム
 * Author: CPC_劉
 * Date:2023/11/14
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['/SuiteScripts/LIBRARY/common_server_lib.js', '/SuiteScripts/LIBRARY/common_lib.js', 'N/file', 'N/record', 'N/search', 'N/format', "N/runtime", 'N/render'],
    /**
     * @param {runtime}
     *            runtime
     * @param {search}
     *            search
     * @param {format}
     *            format
     */
    (common_server_lib, common_lib, file, record, search, format, runtime, render) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */
        const getInputData = (inputContext) => {

            // パラメータ取得
            let script = runtime.getCurrentScript();

            // CSVファイル
            let csvFileId = script.getParameter({name: "custscript_csv_fileId"});

            let commonGetInput = common_server_lib.wmsGetInputData(csvFileId);

            return commonGetInput;

        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {

            const HTTDNPN = 0;  // 作成元
            const INTERNALID = 1;  // 内部ID
            const NYKKKTN = 2;  // 入庫番号
            const SHNC = 3;  // アイテム
            const NYKKKTH = 4;  // 入庫確定日
            const HTTDNPGYON = 5;  // 行番号
            const NYKS = 6;  // 入庫数

            let appendType = 'itemreceipt';

            // パラメータ取得
            let script = runtime.getCurrentScript();

            // CSV作成内部ID 正常系
            let saveFileId = script.getParameter({name: "custscript_save_fileid"});

            // CSV作成内部ID 異常系
            let errorFileId = script.getParameter({name: "custscript_error_fileid"});

            // コンテキスト取得
            let mapContextJson = JSON.parse(mapContext.value);

            // 受領書No
            let itemreceiptNo = mapContextJson['internalid'];

            // 受領書データ
            let valueAry = mapContextJson['dataAry'];

            // 検索条件
            let filters = [
                ['type', 'anyof', 'PurchOrd'],
                'AND',
                ['mainline', 'is', 'F'],
                'AND',
                ['taxline', 'is', 'F'],
                'AND',
                ['internalid', 'anyof', itemreceiptNo],
            ]

            // 受領書伝票存在チェック
//            if (!common_lib.dataExists('purchaseorder', filters)) {
//
//                common_server_lib.csvAppendLine(itemreceiptNo, valueAry, errorFileId, false, appendType, 'NUMBER_ISEMPTY');
//
//            } else {

                // 保存フラグ
                let saveFlag = true;

                // アイテム取得
                let itemAry = common_lib.getItemAryValue();

                // 行番号取得
//                let lineAry = common_lib.getLineValue(itemreceiptNo, appendType);

                // 受領書取得
                let itemreceiptRecord = record.load({
                    type: 'itemreceipt',
                    id: itemreceiptNo,
                });

                // 入庫番号
                itemreceiptRecord.setValue({
                    fieldId: 'wms_storage_num',
                    value: valueAry[0][NYKKKTN]
                });

                // 明細データ作成
                for (let lineNum = 0; lineNum < valueAry.length; lineNum++) {

                    // 詳細データ
                    let value = valueAry[lineNum];

                    // アイテム存在チェック
//                    if (itemAry.indexOf(value[SHNC]) == -1) {
//
//                        saveFlag = false;
//                        common_server_lib.csvAppendLine(itemreceiptNo, valueAry, errorFileId, false, appendType, 'ITEM_ISEMPTY');
//                        break;
//                    }

                    // 行番号存在チェック
//                    if (lineAry.indexOf(value[HTTDNPGYON]) == -1) {
//
//                        saveFlag = false;
//                        common_server_lib.csvAppendLine(itemreceiptNo, valueAry, errorFileId, false, appendType, 'LINE_ISEMPTY');
//                        break;
//                    }

                    // アイテム
                    itemreceiptRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: value[HTTDNPGYON],
                        value: value[SHNC],
                        ignoreFieldChange: true
                    });

                    // 入庫確定日
                    itemreceiptRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'receiving_date',
                        line: value[HTTDNPGYON],
                        value: value[NYKKKTH],
                        ignoreFieldChange: true
                    });

                    // 入庫数
                    itemreceiptRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: value[HTTDNPGYON],
                        value: value[NYKS],
                        ignoreFieldChange: true
                    });
                }

                // 受領書作成
                if (saveFlag) {
                    itemreceiptRecord.save();
                    common_server_lib.csvAppendLine(itemreceiptNo, valueAry, saveFileId, true, appendType);
                }
//            }
        }

        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

            // パラメータ取得
            let script = runtime.getCurrentScript();

            // CSV作成内部ID 正常系
            let saveFileId = script.getParameter({name: "custscript_save_fileid"});

            // CSV作成内部ID 異常系
            let errorFileId = script.getParameter({name: "custscript_error_fileid"});

            // スクリプトID
            let script_id = script.id;

            // 受信者
            let param_email_author = script.getParameter({name: "custscript_send_mail_author"});
            let param_email_recipients = script.getParameter({name: "custscript_send_mail_recipients"});

            common_server_lib.fileEmptyToDelete(saveFileId, errorFileId);
            common_lib.handleErrorIfAny(summaryContext);
        }

        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        }
    }
);