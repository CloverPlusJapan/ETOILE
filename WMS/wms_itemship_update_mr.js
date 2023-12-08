/**
 * 機能: WMS_出庫連携_プログラム
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
            let csvFileId = script.getParameter({name: "custscript_itemship_update_csv_fileid"});

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

            const INTERNALID = 0;  // 内部ID
            const SHNC = 1;  // アイテム
            const HTTDNPGYON = 2;  // 行番号
            const NYKKKTH = 3;  // 出庫確定日
            const WMSNYKKKTN = 4;  // WMS仕切書番号
            const NYKS = 5;  // 計算日

            let appendType = 'itemful';

            // パラメータ取得
            let script = runtime.getCurrentScript();

            // CSV作成内部ID 正常系
            let saveFileId = script.getParameter({name: "custscript_itemship_update_save_fileid"});

            // CSV作成内部ID 異常系
            let errorFileId = script.getParameter({name: "custscript_itemship_update_error_fileid"});

            // コンテキスト取得
            let mapContextJson = JSON.parse(mapContext.value);

            // 配送No
            let itemfulfillmentNo = mapContextJson['internalid'];

            // 配送Noデータ
            let valueAry = mapContextJson['dataAry'];

            // 検索条件
            let filters = [
                ['type', 'anyof', 'itemfulfillment'],
                'AND',
                ['mainline', 'is', 'F'],
                'AND',
                ['taxline', 'is', 'F'],
                'AND',
                ['internalid', 'anyof', itemfulfillmentNo],
            ]

            // 配送伝票存在チェック
            if (!common_lib.dataExists('itemfulfillment', filters)) {

                common_server_lib.csvAppendLine(itemfulfillmentNo, valueAry, errorFileId, false, appendType, 'NUMBER_ISEMPTY');

            } else {

                // 保存フラグ
                let saveFlag = true;

                // アイテム取得
                let itemAry = common_lib.getItemAryValue();

                // 行番号取得
                let lineAry = common_lib.getLineValue(itemfulfillmentNo, appendType);

                // 配送取得
                let itemfulRecord = record.load({
                    type: 'itemfulfillment',
                    id: itemfulfillmentNo,
                });

                // 明細データ作成
                for (let lineNum = 0; lineNum < valueAry.length; lineNum++) {

                    // アイテム存在チェック
                    if (itemAry.indexOf(value[SHNC]) == -1) {

                        saveFlag = false;
                        common_server_lib.csvAppendLine(itemfulfillmentNo, valueAry, errorFileId, false, appendType, 'ITEM_ISEMPTY');
                        break;
                    }

                    // 行番号存在チェック
                    if (lineAry.indexOf(value[HTTDNPGYON]) == -1) {

                        saveFlag = false;
                        common_server_lib.csvAppendLine(itemfulfillmentNo, valueAry, errorFileId, false, appendType, 'LINE_ISEMPTY');
                        break;
                    }

                    // 詳細データ
                    let value = valueAry[lineNum];

                    // 出庫確定日
                    itemfulRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_departure_date',
                        line: value[HTTDNPGYON],
                        value: value[NYKKKTH],
                        ignoreFieldChange: true
                    });

                    // アイテム
                    itemfulRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: value[HTTDNPGYON],
                        value: value[SHNC],
                        ignoreFieldChange: true
                    });

                    // WMS仕切書番号
                    itemfulRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_wms_partition_num',
                        line: value[HTTDNPGYON],
                        value: value[WMSNYKKKTN],
                        ignoreFieldChange: true
                    });

                    // 計算日
                    itemfulRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_calculation_day',
                        line: value[HTTDNPGYON],
                        value: value[NYKS],
                        ignoreFieldChange: true
                    });

                }

                // 配送作成
                if (saveFlag) {
                    itemfulRecord.save();
                    common_server_lib.csvAppendLine(itemfulfillmentNo, valueAry, saveFileId, true, appendType);
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
            let saveFileId = script.getParameter({name: "custscript_itemship_update_save_fileid"});

            // CSV作成内部ID 異常系
            let errorFileId = script.getParameter({name: "custscript_itemship_update_error_fileid"});

            // スクリプトID
            let script_id = script.id;

            // 受信者
            let param_email_author = script.getParameter({name: "custscript_itemship_mail_author"});
            let param_email_recipients = script.getParameter({name: "custscript_itemship_mail_recipients"});

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