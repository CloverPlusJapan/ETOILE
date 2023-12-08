/**
 * 機能: WMS_入荷連携_プログラム
 * Author: CPC_宋
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
            let csvFileId = script.getParameter({name: "custscript_csv_update_fileid"});

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

            const HTTDNPN = 0;  // ドキュメント番号
            const INTERNALID = 1;  // 内部ID
            const NYKKKTN = 2;  // 入荷番号
            const SHNC = 3;  // アイテム
            const NYKKKTH = 4;  // 入荷確定日
            const NYKS = 5;  // 入荷数
            const HTTDNPGYON = 6;  // 行番号
            const WMSNYKKKTN = 7;  // WMS入荷番号
            const WMSNYKKKTNUSER = 8;  // WMS入荷確定者

            let appendType = 'po';

            // パラメータ取得
            let script = runtime.getCurrentScript();

            // CSV作成内部ID 正常系
            let saveFileId = script.getParameter({name: "custscript_save_update_fileid"});

            // CSV作成内部ID 異常系
            let errorFileId = script.getParameter({name: "custscript_error_update_fileid"});

            // コンテキスト取得
            let mapContextJson = JSON.parse(mapContext.value);

            // 発注書No
            let poNo = mapContextJson['internalid'];

            // 発注書データ
            let valueAry = mapContextJson['dataAry'];

            // 検索条件
            let filters = [
                ['type', 'anyof', 'PurchOrd'],
                'AND',
                ['mainline', 'is', 'F'],
                'AND',
                ['taxline', 'is', 'F'],
                'AND',
                ['internalid', 'anyof', poNo],
            ]

            // 発注書伝票存在チェック
            if (!common_lib.dataExists('purchaseorder', filters)) {

                common_server_lib.csvAppendLine(poNo, valueAry, errorFileId, false, appendType, 'NUMBER_ISEMPTY');

            } else {

                // 保存フラグ
                let saveFlag = true;

                // アイテム取得
                let itemAry = common_lib.getItemAryValue();

                // 行番号取得
                let lineAry = common_lib.getLineValue(poNo, appendType);

                // 発注書取得
                let poRecord = record.load({
                    type: 'purchaseorder',
                    id: poNo,
                });

                // ドキュメント番号
                poRecord.setValue({
                    fieldId: 'tranid',
                    value: valueAry[0][HTTDNPN]
                });

                // 明細データ作成
                for (let lineNum = 0; lineNum < valueAry.length; lineNum++) {

                    // アイテム存在チェック
                    if (itemAry.indexOf(value[SHNC]) == -1) {

                        saveFlag = false;
                        common_server_lib.csvAppendLine(poNo, valueAry, errorFileId, false, appendType, 'ITEM_ISEMPTY');
                        break;
                    }

                    // 行番号存在チェック
                    if (lineAry.indexOf(value[HTTDNPGYON]) == -1) {

                        saveFlag = false;
                        common_server_lib.csvAppendLine(poNo, valueAry, errorFileId, false, appendType, 'LINE_ISEMPTY');
                        break;
                    }

                    // 詳細データ
                    let value = valueAry[lineNum];

                    // 入荷番号
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_wms_receipt_num',
                        line: value[HTTDNPGYON],
                        value: value[NYKKKTN],
                        ignoreFieldChange: true
                    });

                    // アイテム
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: value[HTTDNPGYON],
                        value: value[SHNC],
                        ignoreFieldChange: true
                    });

                    // 入荷確定日
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_received_confirmation_date',
                        line: value[HTTDNPGYON],
                        value: value[NYKKKTH],
                        ignoreFieldChange: true
                    });

                    // 入荷数
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_received_quantity',
                        line: value[HTTDNPGYON],
                        value: value[NYKS],
                        ignoreFieldChange: true
                    });

                    // WMS入荷確定者
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_wms_receipt_user',
                        line: value[HTTDNPGYON],
                        value: value[WMSNYKKKTNUSER],
                        ignoreFieldChange: true
                    });
                }

                // 発注書作成
                if (saveFlag) {
                    poRecord.save();
                    common_server_lib.csvAppendLine(poNo, valueAry, errorFileId, true, appendType);
                }
            }
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
            let saveFileId = script.getParameter({name: "custscript_save_update_fileid"});

            // CSV作成内部ID 異常系
            let errorFileId = script.getParameter({name: "custscript_error_update_fileid"});

            // スクリプトID
            let script_id = script.id;

            // 受信者
            let param_email_author = script.getParameter({name: "custscript_itemrcpt_send_mail_author"});
            let param_email_recipients = script.getParameter({name: "custscript_itemrcpt_send_mail_recipients"});

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