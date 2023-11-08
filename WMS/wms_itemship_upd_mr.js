/**
 * 機能: WMS_出荷連携_プログラム
 * Author: CPC_劉相坤
 * Date:2023/10/26
 * 
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['/SuiteScripts/LIBRARY/common_lib.js', 'N/file', 'N/record', 'N/search', 'N/format', "N/runtime", 'N/render' ],
    /**
     * @param {runtime}
     *            runtime
     * @param {search}
     *            search
     * @param {format}
     *            format
     */
    (common_lib, file, record, search, format, runtime, render) => {
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

            // 対象のCSVファイルの存在チェック
            let csvFileData = '';
            let mapJson = [];

            // WMS上のバケットフォルダに未連携のCSVファイルが存在しなかった場合、空のリストを戻り値に設定して処理を終了する
            if (common_lib.isEmpty(csvFile)) {
                return [];
            }

            // CSVファイルのダウンロード
            let csvFile = file.create({
                name: 'csvName',
                contents : JSON.stringify(poResults),
                folder: csvFile,
                fileType: 'CSV',
                encoding: file.Encoding.UTF_8
            });

            let csvFileId = csvFile.save();

            // ファイルをロードする
            csvFile = file.load({
                id : csvFileId,
                encoding : file.Encoding.SHIFT_JIS,
            });

            // ファイル内容を取得する
            let csvFileContents = csvFile.getContents();

            // CSVデータをArrayに変換する
            let csvFileToArray = common_lib.csvToArray(csvFileContents);

            // CSVデータが存在する場合
            if (csvFileToArray.length > 0) {

                // アイテムマスタ取得
                let infoDic = getItemJsonValue();

                // 配送情報取得
                let fulDic = getIfNoJsonValue();

                // CSVデータ整理
                let csvData = {};

                for (let line = 0; line < csvFileToArray.length; line++) {

                    if (!csvData.hasOwnProperty(csvFileToArray[line][2])) {
                        // 配送番号
                        csvData[csvFileToArray[line][2]] = new Array();
                        // 配送データ
                        csvData[csvFileToArray[line][2]].push(csvFileToArray[line]);
                    } else {
                        csvData[csvFileToArray[line][2]].push(csvFileToArray[line]);
                    }

                }

                for ( let key in csvData) {
                    // マスタチェック
                    let itemFlag = false;

                    // 配送データArray
                    let ifDataAry = csvData[key];

                    // 配送データ
                    for (let x = 0; x < ifDataAry.length; x++) {
                        let ifData = ifDataAry[x];

                        // 類番
                        let csvType = ifData[type];
                        // 品番
                        let csvNum = ifData[num];
                        // カラー
                        let csvColor = ifData[color];
                        // サイズ
                        let csvSize = ifData[size];

                        let csvItemKey = csvType + '_' + csvNum + '_' + csvColor + '_' + csvSize;

                        if (infoDic.hasOwnProperty(csvItemKey)) {
                            itemFlag = true;

                            // アイテム内部ID追加
                            csvData[key][x].push(infoDic[csvItemKey]);
                        }

                        // 配送伝票
                        let ifNo = key;
                        // 配送伝票行No
                        let ifNoLine = ifData[line];

                        if (fulDic.hasOwnProperty(ifNo)) {
                            if (fulDic[ifNo].indexOf(ifNoLine) && itemFlag) {

                                // MAPJSON追加
                                mapJson.push({
                                    'itemFulNo' : {
                                        'ifNo' : ifNo,
                                        'value' : csvData[key]
                                    }
                                   });
                            }
                        }
                    }
                }
            }
            return mapJson;
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reducereduceContext) => {

            // 値
            let reduceContextJson = JSON.parse(reduceContext.value);

            // 配送データ
            let contItemFul = reduceContextJson['itemFulNo'];

            // 配送No
            let ifNo = contItemFul['ifNo'];

            // 配送データ
            let value = contItemFul['value'];

            // 配送取得
            let ifRecord = record.load({
                type : 'itemfulfillment',
                id : ifNo,
            });

            // 配送ヘッダ作成
            ifRecord.setValue({
                fieldId : 'tranid',
                value : ifNo

            });

            // 配送明細作成
            for (let z = 0; z < value.length; z++) {
                let lineData = value[z];
                let line = lineData['line'];

                ifRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sw_sales_inv_qty',
                    line: line,
                    value: invQty,
                    ignoreFieldChange: true
                });
            }
            ifRecord.save();
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
        const summarize = (summarysummaryContext) => {
            let script = runtime.getCurrentScript();
            let script_id = script.id;
            let param_email_author = script.getParameter({name: "email_author_bl"});
            let param_email_recipients = script.getParameter({name: "email_recipients"});

            let inputSummary = summaryContext.inputSummary;
            let mapSummary = summaryContext.mapSummary;
            let reduceSummary = summaryContext.reduceSummary;

            if (inputSummary.error) {
                //　エラー処理
                common_lib.handleErrorIfAny(summaryContext);

                let errorObj = error.create({
                    name: 'INPUT_STAGE_FAILED',
                    message: inputSummary.error,
                    notifyOff: false
                });
                throw errorObj;
            }

            let errorName = '';
            let errorMsg = [];
            mapSummary.errors.iterator().each(function(key, value){
                let msg = 'param key: ' + key + '. Error message: ' + JSON.parse(value).message + '\n';
                errorMsg.push(msg);
                errorName = 'MAP_TRANSFORM_FAILED'
                return true;
            });

            reduceSummary.errors.iterator().each(function(key, value){
                let msg = 'param key: ' + key + '. Error message: ' + JSON.parse(value).message + '\n';
                errorMsg.push(msg);
                errorName = 'RECORD_TRANSFORM_FAILED'
                return true;
            });

            if (errorMsg.length > 0)
            {
                //　エラー処理
                common_lib.handleErrorIfAny(summaryContext);
                let errorObj = error.create({
                    name: errorName,
                    message: JSON.stringify(errorMsg),
                    notifyOff: false
                });
                throw errorObj;
            }
        }

        /**
         * アイテムマスタ取得
         * @return {(Object)} アイテム内部ID:類番,品番,カラー,サイズ
         */
        function getItemJsonValue() {
            let infoDic = {};
            let itemSearch = "item";
            let itemFilters = [];
            let itemSearchObj = [search.createColumn({
                name : "internalid",
                label : "内部ID"
            }),search.createColumn({
                name : "type",
                label : "類番"
            }),search.createColumn({
                name : "num",
                label : "品番"
            }),search.createColumn({
                name : "color",
                label : "カラー"
            }),search.createColumn({
                name : "size",
                label : "サイズ"
            })];
            let itemSearchResults = common_lib.getSearchdata(itemSearch, itemFilters, searchColumns);
            if (itemSearchResults && itemSearchResults.length > 0) {
                 for (let i = 0; i < itemSearchResults.length; i++) {
                     let tmpResult = itemSearchResults[i];
                     // 類番
                     let type = tmpResult.getValue(searchColumns[0]);
                     // 品番
                     let num = tmpResult.getValue(searchColumns[1]);
                     // カラー
                     let color = tmpResult.getValue(searchColumns[2]);
                     // サイズ
                     let size = tmpResult.getValue(searchColumns[3]);

                     let itemArr = new Array();
                     let itemKey = type + '_' + num + '_' + color + '_' + size;
                     infoDic[itemKey] = itemId;

                 }
            }
            return infoDic;
        }

        /**
         * 受領書情報取得
         * @return {(Object)} 受領書対応ライン番号
         */
        function getIfNoJsonValue() {
            let fulDic = {};
            let itemRcptSearch = "itemreceipt";
            let itemRcptFilters = [];
            itemRcptFilters.push(["type",'anyof',"ItemRcpt"]);
            itemRcptFilters.push(["AND"]);
            itemRcptFilters.push(["trackingnumber","isnotempty",""]);
            let itemRcptSearchObj = [search.createColumn({
                name : "trackingnumbers",
                label : "受領書No"
            }),search.createColumn({
                name : "",
                label : "受領書行番号"
            })];
            let itemRcptSearchResults = createSearch(itemRcptSearch, itemRcptFilters, searchColumns);
            if (itemRcptSearchResults && itemRcptSearchResults.length > 0) {
                let fulDic = {};
                for (let i = 0; i < itemRcptSearchResults.length; i++) {
                     let fulResult = itemRcptSearchResults[i];
                     let itemFulNo = fulResult.getValue(searchColumns[0]);
                     let itemFulLine = fulResult.getValue(searchColumns[1]);

                     let itemFulArr = new Array();
                     itemFulArr.push([itemFulLine]);
                     fulDic[itemFulNo] = new Array();
                     fulDic[itemFulNo].push(itemFulArr);

                }
            }
            return fulDic;
        }
        
        return {
            getInputData: getInputData,
            reduce: reduce,
            summarize: summarize
        }
    }
);