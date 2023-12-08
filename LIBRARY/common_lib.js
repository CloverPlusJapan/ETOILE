/**
 * 機能: 開発全体共通のライブラリ関数を記載する
 * Author: 劉相坤
 * Date: 2023/10/26
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['/SuiteScripts/LIBRARY/common_server_lib.js', 'N/search', 'N/record', "N/ui/dialog", "N/format", 'N/error', 'N/email', 'N/runtime', 'N/query', "N/log", "N/sftp", "N/file"],

    function (common_server_lib, search, record, dialog, format, error, email, runtime, query, log, sftp, file) {

        /**
         * マスタ / トランザクション取得
         * @param {Object|*} searchType 検索種類
         * @param {Object|*} searchFilters 検索条件
         * @param {Object|*} searchColumns 検索項目
         * @returns {Object} resultList 検索結果配列
         */
        const getSearchData = (searchType, searchFilters, searchColumns) => {
            let resultList = [];
            let resultIndex = 0;
            let resultStep = 1000;
            let results;
            let objSearch = search.create({
                type: searchType,
                filters: searchFilters,
                columns: searchColumns
            });
            let objResultSet = objSearch.run();

            do {
                results = objResultSet.getRange({
                    start: resultIndex,
                    end: resultIndex + resultStep
                });

                if (results.length > 0) {
                    resultList = resultList.concat(results);
                    resultIndex = resultIndex + resultStep;
                }
            } while (results.length > 0);

            return resultList;

        }

        /**
         * 歴日チェック
         * @param {String|*} date 歴日
         * @param {String|*} fh フォーマット
         * @returns {Boolean}
         */
        const isDateFormat = (date, fh) => {

            let pattern = new RegExp("(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})" + fh + "(((0[13578]|1[02])"
                + fh + "(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)" + fh + "(0[1-9]|[12][0-9]|30))|(02"
                + fh + "(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))" + fh + "02" + fh + "29)");

            if (!pattern.test(date)) {
                return false;
            }

            return true;

        }

        /**
         * 空白チェック
         * @param {Object|*} obj 文字列
         * @returns {Boolean}
         */
        const isEmpty = (obj) => {

            if (obj === undefined || obj == null || obj === '') {
                return true;
            }
            if (obj.length && obj.length > 0) {
                return false;
            }
            if (obj.length === 0) {
                return true;
            }
            for (let key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }
            if (typeof (obj) == 'boolean') {
                return false;
            }
            if (typeof (obj) == 'number') {
                return false;
            }
            return true;

        }

        /**
         * アイテムマスタ取得
         * @return {(Object)} アイテム内部ID
         */
        const getItemAryValue = () => {

            let infoDic = [];
            let itemSearch = "item";
            let itemFilters = [];
            let searchColumns = [search.createColumn({
                name: "internalid",
                label: "内部ID"
            })];
            let itemSearchResults = getSearchData(itemSearch, itemFilters, searchColumns);
            if (itemSearchResults && itemSearchResults.length > 0) {
                for (let itemSearchNum = 0; itemSearchNum < itemSearchResults.length; itemSearchNum++) {
                    let tmpResult = itemSearchResults[itemSearchNum];
                    // 内部ID
                    infoDic.push(tmpResult.getValue({
                        name: "internalid",
                        label: "内部ID"
                    }))
                }
            }
            return infoDic;
        }

        /**
         * SFTP連携情報
         * @param id SFTP連携情報内部ID
         */
        const getConnectInfo = (idName) => {

            let sftpInfo;

            if (!isEmpty(idName)) {

                //SFTP連携情報
                var customrecord_sftp_infoSearchObj = search.create({
                    type: "customrecord_sftp_info",
                    filters:
                        [
                            ["custrecord_sftp_connectinfo", "is", idName]
                        ],
                    columns:
                        [search.createColumn({
                            name: "custrecord_sftp_connectinfo",
                            label: "連携区分"
                        }), search.createColumn({
                            name: "custrecord_sftp_url",
                            label: "URL"
                        }), search.createColumn({
                            name: "custrecord_sftp_passwordguid",
                            label: "PASSWORDGUID"
                        }), search.createColumn({
                            name: "custrecord_sftp_username",
                            label: "USERNAME"
                        }), search.createColumn({
                            name: "custrecord_sftp_port",
                            label: "PORT"
                        }), search.createColumn({
                            name: "custrecord_sftp_directory",
                            label: "DIRECTORY"
                        }), search.createColumn({
                            name: "custrecord_sftp_timeout",
                            label: "TIMEOUT"
                        }), search.createColumn({
                            name: "custrecord_sftp_hostkey",
                            label: "HOSTKEYTYPE"
                        }), search.createColumn({
                            name: "custrecord_sftp_hostkeytype",
                            label: "HOSTKEYTYPE"
                        }), search.createColumn({
                            name: "custrecord_sftp_down_path",
                            label: "SFTP-ダウンロード-PATH"
                        }), search.createColumn({
                            name: "custrecord_sftp_down_file_name",
                            label: "SFTP-ダウンロード-FILE-NAME"
                        }), search.createColumn({
                            name: "custrecord_sftp_down_done",
                            label: "SFTP-ダウンロード-完了"
                        }), search.createColumn({
                            name: "custrecord_sftp_down_to_ns",
                            label: "SFTP-ダウンロード-NS"
                        }), search.createColumn({
                            name: "custrecord_sftp_down_ns_done",
                            label: "SFTP-ダウンロード-NS-完了"
                        }), search.createColumn({
                            name: "custrecord_ns_upload_sftp_path",
                            label: "NS-アップロード-SFTP-PATH"
                        }), search.createColumn({
                            name: "custrecord_ns_upload_sftp_file_name",
                            label: "NS-アップロード-SFTP-FILE-NAME"
                        })]

                });

                let searchResults = getAllResults(customrecord_sftp_infoSearchObj);

                if (searchResults && searchResults.length > 0) {
                    for (let sftpNum = 0; sftpNum < searchResults.length; sftpNum++) {
                        let tmpResult = searchResults[sftpNum];
                        sftpInfo = {
                            'CONNECTINFO': tmpResult.getValue({
                                name: "custrecord_sftp_connectinfo",
                                label: "連携区分"
                            }),
                            'URL': tmpResult.getValue({
                                name: "custrecord_sftp_url",
                                label: "URL"
                            }),
                            'PASSWORDGUID': tmpResult.getValue({
                                name: "custrecord_sftp_passwordguid",
                                label: "PASSWORDGUID"
                            }),
                            'HOSTKEY': tmpResult.getValue({
                                name: "custrecord_sftp_hostkey",
                                label: "HOSTKEY"
                            }),
                            'USERNAME': tmpResult.getValue({
                                name: "custrecord_sftp_username",
                                label: "USERNAME"
                            }),
                            'PORT': tmpResult.getValue({
                                name: "custrecord_sftp_port",
                                label: "PORT"
                            }),
                            'DIRECTORY': tmpResult.getValue({
                                name: "custrecord_sftp_directory",
                                label: "DIRECTORY"
                            }),
                            'TIMEOUT': tmpResult.getValue({
                                name: "custrecord_sftp_timeout",
                                label: "TIMEOUT"
                            }),
                            'HOSTKEYTYPE': tmpResult.getValue({
                                name: "custrecord_sftp_hostkeytype",
                                label: "HOSTKEYTYPE"
                            }),
                            'SFTPDOWNPATH': tmpResult.getValue({
                                name: "custrecord_sftp_down_path",
                                label: "SFTP-ダウンロード-PATH"
                            }),
                            'SFTPDOWNFILENAME': tmpResult.getValue({
                                name: "custrecord_sftp_down_file_name",
                                label: "SFTP-ダウンロード-FILE-NAME"
                            }),
                            'SFTPDOWNDONE': tmpResult.getValue({
                                name: "custrecord_sftp_down_done",
                                label: "SFTP-ダウンロード-完了"
                            }),
                            'DOWNTONS': tmpResult.getValue({
                                name: "custrecord_sftp_down_to_ns",
                                label: "SFTP-ダウンロード-NS"
                            }),
                            'DOWNTONSDONE': tmpResult.getValue({
                                name: "custrecord_sftp_down_ns_done",
                                label: "SFTP-ダウンロード-NS-完了"
                            }),
                            'UPLOADSFTPPATH': tmpResult.getValue({
                                name: "custrecord_ns_upload_sftp_path",
                                label: "NS-アップロード-SFTP-PATH"
                            }),
                            'UPLOADSFTPFILENAME': tmpResult.getValue({
                                name: "custrecord_ns_upload_sftp_file_name",
                                label: "NS-アップロード-SFTP-FILE-NAME"
                            })
                        };
                    }
                }
            }

            return sftpInfo;
        }


        /**
         * メール送信
         * @param mailJson メール内容
         * @param mailSftpId　メール連携情報内部ID
         */
        const sendMail = (mailJson, mailSftpId) => {

            let bodyData;
            let subject;

            if (mailSftpId) {
                let mailSftpJson = getMailSftpList(mailSftpId);

                bodyData = mailSftpJson.BODY;
                let bodyAry = mailJson.body;
                for (let num = 0; num < bodyAry.length; num++) {
                    bodyData = bodyData.replace("{" + num + "}", bodyAry[num]);
                }
                subject = mailSftpJson.SUBJECT;
            } else {
                bodyData = mailJson.body;
                subject = mailJson.subject;
            }

            email.send({
                author: mailJson.author,
                recipients: mailJson.recipients,
                replyTo: getJsonValue(mailJson, 'replyTo'),
                cc: getJsonValue(mailJson, 'cc'),
                bcc: getJsonValue(mailJson, 'bcc'),
                subject: subject,
                body: bodyData,
                attachments: getJsonValue(mailJson, 'attachments'),
                relatedRecords: getJsonValue(mailJson, 'relatedRecords'),
                isInternalOnly: getJsonValue(mailJson, 'isInternalOnly')
            });

        }

        /**
         * JSONから値を取得
         * @param json
         * @param key
         * @returns {*|string}
         */
        const getJsonValue = (json, key) => {

            if (json.hasOwnProperty(key)) {
                return json.key;
            } else {
                return '';
            }

        }


        /**
         * 月末日取得
         *
         * @param {date|*} year 年
         * @param {date|*} month 月
         * @param {holidayFlg|*} 営業日フラグ
         * @returns {date} 月末日
         */
        const getEndOfMonth = (year, month, holidayFlg) => {

            let date = new Date(year, month, 1);
            let lastDate = date.setDate(date.getDate() - 1);

            if (holidayFlg) {        //営業日のみ取得する
                while (lastDate.getDay() === 0 || lastDate.getDay() === 6 || checkHoliday(holidaySearchResults, lastDate)) {
                    if (lastDate.getDay() === 0 && checkHoliday(holidaySearchResults, lastDate)) {
                        lastDate.setDate(lastDate.getDate() - 2);
                    } else {
                        lastDate.setDate(lastDate.getDate() - 1);
                    }
                }
            }

            return lastDate;
        }

        /**
         * マスタ / トランザクション データ存在チェック
         * @param {Object|*} searchType 検索種類
         * @param {Object|*} searchFilters 検索条件
         * @returns {Boolean} boolean 検索結果配列が存在するか
         */
        const dataExists = (searchType, searchFilters) => {

            let objSearch = search.create({
                type: searchType,
                filters: searchFilters,
                columns: [
                    search.createColumn({name: "internalid"})
                ]
            });

            let searchResultCount = objSearch.runPaged().count;

            return !searchResultCount == 0;

        }

        /**
         * 数値チェック
         * @param {String|*} data 文字列
         * @returns {Boolean}
         */
        const isNumber = (data) => {

            // 数値チェック
            if (!isNaN(parseFloat(data)) && isFinite(data)) {
                return true;
            } else {
                return false;
            }

        }

        /**
         * 文字列から日付に変換
         *
         * @param {String|*} beforString 変換前文字列
         * @param {String|*} changeType 変換タイプ
         * @param {String|*} textColumn P1　※１
         * @param {String|*} textColumns P2　※２
         * @returns {Date} 変換フォーマット(日付)
         */
        const strConvert = (beforString, changeType, textColumn, textColumns) => {

            //　変換前文字列が空白の場合は、「対象文字列が不正」とログを出力し、空白を戻る。
            if (isEmpty(beforString)) {
                log.debug('対象文字列が不正');
                return null;
            }

            //　変換タイプが「0」と「1」以外の場合は、「変更タイプが不正」とログを出力し、空白を戻る。
            if (changeType != 0 && changeType != 1) {
                log.debug('変更タイプが不正');
                return null;
            }

            // 変換タイプが「0」でP1が空白の場合は、「変更前フォーマットが不正」とログを出力し、空白を戻る。
            if (!isEmpty(changeType) && changeType == 0 && isEmpty(textColumn)) {
                log.debug('変更前フォーマットが不正');
                return null;
            }

            //　変換タイプが「1」でP1が1桁以外の場合は、「埋込文字が不正」とログを出力し、空白を戻る。
            if (!isEmpty(changeType) && changeType == 1 && textColumn.length != 1) {
                log.debug('埋込文字が不正');
                return null;
            }

            // 変換タイプが「0」でP2が空白の場合は、「変更後フォーマットが不正」とログを出力し、空白を戻る。
            if (!isEmpty(changeType) && changeType == 0 && isEmpty(textColumns)) {
                log.debug('変更後フォーマットが不正');
                return null;
            }

            // 変換タイプが「1」でP2が空白又は数値ではない場合は、「桁数が不正」とログを出力し、空白を戻る。
            if (!isEmpty(changeType) && changeType == 1 && isEmpty(textColumns) || typeof (textColumns) != 'number') {
                log.debug('桁数が不正');
                return null;
            }

            //　変換タイプが「0」の場合は
            if (!isEmpty(changeType) && changeType == 0) {
                let date = new Date(dateString);
                // 日付有効
                if (!isNaN(date.getTime())) {
                    return setDateToString(date, textColumns);
                }
            }

            //　変換タイプが「1」の場合は
            if (!isEmpty(changeType) && changeType == 1) {
                return dateString.padStart(textColumns, textColumn);
            }

        }

        /**
         * 期日取得
         * @returns {Date} 期日
         */
        const getDueDate = () => {

            let now = new Date();
            let offSet = now.getTimezoneOffset();
            let offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);
            return now;

        }

        /**
         * システム日付と時間をフォーマットで取得
         * returns{String} yyyymmddhhmmssms
         */
        const getFormatYmdHms = () => {

            // システム時間
            let now = new Date();
            let offSet = now.getTimezoneOffset();
            let offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);

            let str = now.getFullYear().toString();
            str += (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1)
            str += now.getDate() < 10 ? "0" + now.getDate() : now.getDate();
            str += now.getHours();
            str += now.getMinutes();
            str += now.getSeconds();
            str += now.getMilliseconds();

            return str;
        }

        /**
         * 日後取得
         *
         * @param {date} date 日付
         * @param {number} days 経過日数
         * @param {number} computing 計算方法
         * @param {Boolean} holidayFlg 営業日フラグ
         * @returns {date} 明日の日払
         */
        const getAfterDate = (date, days, computing, holidayFlg) => {

            let tomorrow = new Date(date);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (holidayFlg) {
                while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6 || checkHoliday(holidaySearchResults, tomorrow)) {
                    if (tomorrow.getDay() === 0 && checkHoliday(holidaySearchResults, tomorrow)) {
                        tomorrow.setDate(tomorrow.getDate() + 2);
                    } else {
                        tomorrow.setDate(tomorrow.getDate() + 1);
                    }
                }
            }
            return tomorrow;

        }

        /**
         * 年後取得
         *
         * @param {date} date 日付
         * @param {number} days 経過日数
         * @param {number} computing 計算方法
         * @param {Boolean} holidayFlg 営業日フラグ
         * @returns {date} 明日の日払
         */
        const getAfterYear = (date, days, computing, holidayFlg) => {

            let dateTime = new Date().getFullYear();
            dateTime = new Date(new Date().setFullYear(dateTime + 1)).getFullYear();

            if (holidayFlg) {
                let LastDateTime = getAfterDate(date, days, computing, holidayFlg)
            }

            return dateTime;

        }

        /**
         * 年間祝日日付取得
         */
        const holidaySearchResults = () => {

            let resultList = new Array();
            let holidaysSearch = search.create({
                type: "customrecord_suitel10n_jp_non_op_day",
                filters:
                    [],
                columns:
                    [
                        search.createColumn({
                            name: "custrecord_suitel10n_jp_non_op_day_date",
                            summary: "GROUP",
                            label: "日付"
                        })
                    ]
            });
            holidaysSearch.run().each(function (result) {
                let value = result.getValue({
                    name: 'custrecord_suitel10n_jp_non_op_day_date',
                    summary: 'GROUP'
                });

                resultList.push(value);

                return true;
            });

            return resultList;
        }

        /**
         * 祝日かどうかを判断する
         * @param searchResults
         * @param date
         * @returns {boolean}
         */
        const checkHoliday = (searchResults, date) => {

            let returnFlag = false;
            if (searchResults && searchResults.length > 0) {
                for (let row = 0; row < searchResults.length; row++) {
                    if (date == searchResults[row]) {
                        returnFlag = true;
                        break;
                    }
                }
            }

            return returnFlag;
        }

        /**
         * CSVデータをArrayに変換する
         * @param {String|*} strData CSVデータ
         * @param {String} strDelimiter 区切り記号
         * @returns {Array} arrData
         */
        const getCSVData = (strData, strDelimiter) => {

            strDelimiter = (strDelimiter || ",");

            let objPattern = new RegExp((

                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");

            let arrData = [[]];
            let arrMatches = null;
            while (arrMatches = objPattern.exec(strData)) {

                let strMatchedDelimiter = arrMatches[1];
                if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                    arrData.push([]);
                }
                let strMatchedValue;
                if (arrMatches[2]) {
                    strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
                } else {
                    strMatchedValue = arrMatches[3];
                }
                arrData[arrData.length - 1].push(strMatchedValue);
            }

            return (arrData);
        }

        /**
         * 保存検索の結果よりCSVデータ作成
         *
         * @param searchId 保存検索内部ID
         * @param filename ファイル名
         * @param csvSaveFolder フォルダIDの保存
         */
        const setCSVBySearch = (searchId, filename, csvSaveFolder) => {

            let csvStr = '';

            // レコード保存検索
            let searchObj = search.load({
                id: searchId
            });

            // 内容取得
            let searchResults = getAllResults(searchObj);

            // 保存検索内容が存在する場合
            if (searchResults && searchResults.length > 0) {

                // 取得保存結果の列
                let columns = searchObj.columns;

                // CSVヘッド作成
                for (let count = 0; count < columns.length; count++) {
                    if (count == columns.length - 1) {
                        csvStr += columns[count]['label'] + '\r\n';
                        break;
                    }
                    csvStr += columns[count]['label'] + ',';
                }

                // CSV内容作成
                for (let searchCount = 0; searchCount < searchResults.length; searchCount++) {

                    let datas = searchResults[searchCount];
                    for (let columsCount = 0; columsCount < columns.length; columsCount++) {

                        if (columsCount == columns.length - 1) {
                            csvStr += datas.getValue(columns[columsCount]) + '\r\n';
                        } else {
                            csvStr += datas.getValue(columns[columsCount]) + ',';
                        }
                    }
                }
            }

            // CSV保存
            common_server_lib.writeCsvFile(csvStr, filename, csvSaveFolder);
        }

        /**
         *日付から文字列転換
         * @param date
         * @param format
         * @returns {String}
         *  例:
         console.log(setDateToString(date, 'yyyy-MM-dd HH:mm:ss')); // 2023-11-16 08:25:05
         console.log(setDateToString(date, 'yyyy年MM月dd日 HH:mm:ss')); // 2023年11月16日 08:25:05
         console.log(setDateToString(date, 'yyyy-MM-dd HH:mm:ss S')); // 2023-11-16 08:25:05 950
         console.log(setDateToString(date, 'yyyMM')); // 02311
         */
        const setDateToString = (date, format) => {

            const DATA_OBJECT = {
                'M+': date.getMonth() + 1, // 月
                'd+': date.getDate(), // 日
                'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //時間
                'H+': date.getHours(), // 時間
                'm+': date.getMinutes(), // 分
                's+': date.getSeconds(), // 秒
                S: date.getMilliseconds(), // ミリ秒
                A: date.getHours() < 12 ? 'AM' : 'PM', // AM/PM
            };
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            for (let k in DATA_OBJECT) {
                if (new RegExp('(' + k + ')').test(format)) {
                    format = format.replace(
                        RegExp.$1,
                        RegExp.$1.length === 1 ? DATA_OBJECT[k] : ('00' + DATA_OBJECT[k]).substr(('' + DATA_OBJECT[k]).length)
                    );
                }
            }
            return format;
        }

        /**
         * CSVデータ作成
         *
         * @param array
         * @returns {String} csv文字列
         */
        const setCSVByList = (array) => {

            if (!array || array.length === 0) {
                return "";
            }

            let result = array.map(function (item) {
                let convertedItem = item.replace(/"/g, '""');
                return '"' + convertedItem + '"';
            });

            let resultString = result.join(",");

            return resultString;
        }

        /**
         * MRエラー処理　入口
         * @param {Object|*} summary summarizeから呼び出す
         */
        const handleErrorIfAny = (summary) => {

            let script = runtime.getCurrentScript();
            let script_id = script.id;

            let inputSummary = summary.inputSummary;
            let mapSummary = summary.mapSummary;
            let reduceSummary = summary.reduceSummary;

            if (inputSummary.error) {
                let e = error.create({
                    name: 'INPUT_STAGE_FAILED',
                    message: inputSummary.error
                });
                log.error({title: 'getInputData：', details: inputSummary.error});
                handleErrorAndSendNotification(e, 'getInputData', script_id);
            }

            handleErrorInStage('map', mapSummary, script_id);
            handleErrorInStage('reduce', reduceSummary, script_id);
        }

        /**
         * mapとreduceのエラー処理
         * @param {Object} stage MapOrReduce
         * @param {Object} summary Summary
         * @param {String} scriptid スクリプトID
         */
        const handleErrorInStage = (stage, summary, scriptid) => {

            let errorMsg = [];
            summary.errors.iterator().each(function (key, value) {
                let msg = 'param key: ' + key + '. Error message: ' + JSON.parse(value).message + '\n';
                errorMsg.push(msg);
                log.error({title: stage, details: JSON.parse(value)});
                return true;
            });
            if (errorMsg.length > 0) {
                let e = error.create({
                    name: 'RECORD_TRANSFORM_FAILED',
                    message: JSON.stringify(errorMsg)
                });
                handleErrorAndSendNotification(e, stage, scriptid);
            }
        }

        /**
         * mapとreduceのメール送信処理
         * @param {Object} e エラー
         * @param {Object} stage MapOrReduce
         * @param {String} scriptid スクリプトID
         */
        const handleErrorAndSendNotification = (e, stage, scriptid) => {

            // メール送信処理
            let script = runtime.getCurrentScript();
            let script_id = script.id;
            let param_email_author = script.getParameter({name: "custscript_send_mail_author"});
            let param_err_recipients = script.getParameter({name: "custscript_send_mail_recipients"});
            let subject_contents = 'Map/Reduce script: ' + scriptid + ' failed for stage: ' + stage;
            let body_contents = 'An error occurred with the following information:\n' +
                'Error code: ' + e.name + '\n' +
                'Error msg: ' + e.message;

            email.send({
                author: param_email_author,
                recipients: param_err_recipients,
                subject: subject_contents,
                body: body_contents
            });
        }

        /**
         * リストが空白かどうかを返す関数
         * @param {Array|*} list リスト
         * @returns {Boolean} Boolean
         */
        const isEmptyList = (list) => {

            if (list === undefined || list == null) {
                return true;
            }
            if (list.length && list.length > 0) {
                return false;
            }
            if (list.length === 0) {
                return true;
            }
            if (!Array.isArray(list) || list.length == 0) {
                return true;
            } else {
                return false;
            }
            return true;
        }

        /**
         * APIの取得
         * @param apiKbn
         */
        const getAPIInfo = (apiKbn) => {

            let userId = "";
            let key = "";
            let systemDate = getFormatYmdHms();
            search.create({
                type: "customrecord_api_info",
                filters: [["custrecord_api_kbn", "equalto", apiKbn]],
                columns: [
                    search.createColumn({name: "custrecord_api_kbn", label: "API区分"}),
                    search.createColumn({name: "custrecord_user_id", label: "ユーザID"}),
                    search.createColumn({name: "custrecord_key", label: "共通キー"})
                ]
            }).run().each(function (result) {
                userId = result.getValue("custrecord_user_id");
                key = result.getValue("custrecord_key");
            });
            return {
                "アクセストークン": SHA256(userId + systemDate + key),
                "ユーザID": userId,
                "リクエスト日時": systemDate
            }
        }

        /**
         *  文字列変換SHA 256
         * @param s (string)
         * @returns {string}
         * @constructor
         */
        const SHA256 = (s) => {

            const CHRSZ = 8
            const HEXCASE = 0

            function safe_add(x, y) {
                const LSW = (x & 0xFFFF) + (y & 0xFFFF)
                const MSW = (x >> 16) + (y >> 16) + (LSW >> 16)
                return (MSW << 16) | (LSW & 0xFFFF)
            }

            function S(X, n) {
                return (X >>> n) | (X << (32 - n))
            }

            function R(X, n) {
                return (X >>> n)
            }

            function Ch(x, y, z) {
                return ((x & y) ^ ((~x) & z))
            }

            function Maj(x, y, z) {
                return ((x & y) ^ (x & z) ^ (y & z))
            }

            function Sigma0256(x) {
                return (S(x, 2) ^ S(x, 13) ^ S(x, 22))
            }

            function Sigma1256(x) {
                return (S(x, 6) ^ S(x, 11) ^ S(x, 25))
            }

            function Gamma0256(x) {
                return (S(x, 7) ^ S(x, 18) ^ R(x, 3))
            }

            function Gamma1256(x) {
                return (S(x, 17) ^ S(x, 19) ^ R(x, 10))
            }

            function core_sha256(m, l) {
                const K = [0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2]
                const HASH = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19]
                const W = new Array(64)
                let a, b, c, d, e, f, g, h, i, j
                let T1, T2
                m[l >> 5] |= 0x80 << (24 - l % 32)
                m[((l + 64 >> 9) << 4) + 15] = l
                for (i = 0; i < m.length; i += 16) {
                    a = HASH[0]
                    b = HASH[1]
                    c = HASH[2]
                    d = HASH[3]
                    e = HASH[4]
                    f = HASH[5]
                    g = HASH[6]
                    h = HASH[7]
                    for (j = 0; j < 64; j++) {
                        if (j < 16) {
                            W[j] = m[j + i]
                        } else {
                            W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16])
                        }
                        T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j])
                        T2 = safe_add(Sigma0256(a), Maj(a, b, c))
                        h = g
                        g = f
                        f = e
                        e = safe_add(d, T1)
                        d = c
                        c = b
                        b = a
                        a = safe_add(T1, T2)
                    }
                    HASH[0] = safe_add(a, HASH[0])
                    HASH[1] = safe_add(b, HASH[1])
                    HASH[2] = safe_add(c, HASH[2])
                    HASH[3] = safe_add(d, HASH[3])
                    HASH[4] = safe_add(e, HASH[4])
                    HASH[5] = safe_add(f, HASH[5])
                    HASH[6] = safe_add(g, HASH[6])
                    HASH[7] = safe_add(h, HASH[7])
                }
                return HASH
            }

            function str2binb(str) {
                const BIN = []
                const MASK = (1 << CHRSZ) - 1
                for (let row = 0; row < str.length * CHRSZ; row += CHRSZ) {
                    BIN[row >> 5] |= (str.charCodeAt(row / CHRSZ) & MASK) << (24 - row % 32)
                }
                return BIN
            }

            function Utf8Encode(string) {
                string = string.replace(/\r\n/g, '\n')
                let utfText = ''
                for (let row = 0; row < string.length; row++) {
                    const CHAR_NUM = string.charCodeAt(row)
                    if (CHAR_NUM < 128) {
                        utfText += String.fromCharCode(CHAR_NUM)
                    } else if ((CHAR_NUM > 127) && (CHAR_NUM < 2048)) {
                        utfText += String.fromCharCode((CHAR_NUM >> 6) | 192)
                        utfText += String.fromCharCode((CHAR_NUM & 63) | 128)
                    } else {
                        utfText += String.fromCharCode((CHAR_NUM >> 12) | 224)
                        utfText += String.fromCharCode(((CHAR_NUM >> 6) & 63) | 128)
                        utfText += String.fromCharCode((CHAR_NUM & 63) | 128)
                    }
                }
                return utfText
            }

            function binb2hex(binarray) {
                const HEX_TAB = HEXCASE ? '0123456789ABCDEF' : '0123456789abcdef'
                let str = ''
                for (let row = 0; row < binarray.length * 4; row++) {
                    str += HEX_TAB.charAt((binarray[row >> 2] >> ((3 - row % 4) * 8 + 4)) & 0xF) +
                        HEX_TAB.charAt((binarray[row >> 2] >> ((3 - row % 4) * 8)) & 0xF)
                }
                return str
            }

            s = Utf8Encode(s)
            return binb2hex(core_sha256(str2binb(s), s.length * chrsz))
        }

        /**
         * 結果セット配列の取得
         * @param mySearch
         * @returns {[]}
         */
        const getAllResults = (mySearch) => {

            let resultSet = mySearch.run();
            let resultArr = [];
            let start = 0;
            let step = 1000;
            let results = resultSet.getRange({start: start, end: step});
            while (results && results.length > 0) {
                resultArr = resultArr.concat(results);
                start = Number(start) + Number(step);
                results = resultSet.getRange({start: start, end: Number(start) + Number(step)});
            }
            return resultArr;
        }

        /**
         * 行番号取得
         * @param {String|*} internalid 内部ID
         * @param {String|*} type 種類
         * @return {(Object)} ライン番号
         */
        const getLineValue = (internalid, type) => {

            let lineAry = [];

            if (type == 'itemreceipt') {
                let tmpRecord = record.load({
                    type: 'itemreceipt',
                    id: internalid,
                });
            } else if (type == 'po') {
                let tmpRecord = record.load({
                    type: 'purchaseorder',
                    id: internalid,
                });
            } else if (type == 'itemful') {
                let tmpRecord = record.load({
                    type: 'itemfulfillment',
                    id: internalid,
                });
            }


            let lineCnt = tmpRecord.getLineCount({
                sublistId: 'item',
            });

            for (let count = 0; count < lineCnt; count++) {
                // アイテム内部IDを取得
                let linenum = tmpRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'linenum',
                    line: count
                });

                lineAry.push(linenum);
            }
            return lineAry;
        }

        /**
         * Mail連携情報取得
         * @param mailSftpId Mail連携情報内部ID
         * @returns {{SUBJECT: string, BODY: string, MSGID: string}}
         */
        const getMailSftpList = (mailSftpId) => {

            let mailSftpJson;

            let customrecord_mail_infoSearchObj = search.create({
                type: "customrecord_mail_info",
                filters:
                    [
                        ["custrecord_msgid_info", "is", mailSftpId]
                    ],
                columns:
                    [
                        search.createColumn({name: "custrecord_msgid_info", label: "メッセージID"}),
                        search.createColumn({name: "custrecord_subject_info", label: "件名"}),
                        search.createColumn({name: "custrecord_body_info", label: "内容"})
                    ]
            });

            let searchObj = getAllResults(customrecord_mail_infoSearchObj);
            if (searchObj && searchObj.length > 0) {
                mailSftpJson = {
                    'MSGID': searchObj[0].getValue({name: "custrecord_msgid_info", label: "メッセージID"}),
                    'SUBJECT': searchObj[0].getValue({name: "custrecord_subject_info", label: "件名"}),
                    'BODY': searchObj[0].getValue({name: "custrecord_body_info", label: "内容"}),
                }
            }

            return mailSftpJson;

        }

        return {
            getSearchData: getSearchData,
            isDateFormat: isDateFormat,
            isEmpty: isEmpty,
            sendMail: sendMail,
            getEndOfMonth: getEndOfMonth,
            dataExists: dataExists,
            isNumber: isNumber,
            strConvert: strConvert,
            getDueDate: getDueDate,
            getAfterDate: getAfterDate,
            getAfterYear: getAfterYear,
            getCSVData: getCSVData,
            handleErrorIfAny: handleErrorIfAny,
            isEmptyList: isEmptyList,
            getFormatYmdHms: getFormatYmdHms,
            getAPIInfo: getAPIInfo,
            getAllResults: getAllResults,
            setDateToString: setDateToString,
            setCSVByList: setCSVByList,
            setCSVBySearch: setCSVBySearch,
            checkHoliday: checkHoliday,
            holidaySearchResults: holidaySearchResults,
            getItemAryValue: getItemAryValue,
            getLineValue: getLineValue,
            getConnectInfo: getConnectInfo
        };
    });