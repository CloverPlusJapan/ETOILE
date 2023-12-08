/**
 * 機能: 開発全体共通のライブラリ関数を記載する
 * Author: 劉相坤
 * Date: 2023/10/26
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['/SuiteScripts/LIBRARY/common_lib.js', 'N/search', 'N/record', "N/ui/dialog", "N/format", 'N/error', 'N/email', 'N/runtime', 'N/query', "N/log", "N/sftp", "N/file"],

    function (common_lib, search, record, dialog, format, error, email, runtime, query, log, sftp, file) {

        /**
         * SFTPファイル受信
         *
         * @param connectinfoId SFTP連携情報内部ID
         */
        const executeTrusted = (connectInfoName) => {

            let sftpInfo = common_lib.getConnectInfo(connectInfoName);

            if (!common_lib.isEmpty(sftpInfo)) {
                let sftp = connectSFTP(sftpInfo);
                let downloadedFile = sftp.download({
                    directory: sftpInfo.SFTPDOWNPATH,
                    filename: sftpInfo.SFTPDOWNFILENAME
                });

                downloadedFile.folder = sftpInfo.DOWNTONS;
                downloadedFile.save();
            }

        }

        /**
         * SFTPファイル送信
         *
         * @param connectInfoId SFTP連携情報内部ID
         * @param nsFile NSファイル内部ID
         */
        const executeSend = (connectInfoId, nsFile) => {

            let sftpInfo = common_lib.getConnectInfo(connectInfoId);

            if (!common_lib.isEmpty(sftpInfo)) {
                let sftp = connectSFTP(sftpInfo);
                sftp.upload({
                    directory: sftpInfo.UPLOADSFTPPATH,
                    filename: sftpInfo.UPLOADSFTPFILENAME,
                    file: nsFile,
                    replaceExisting: true
                });
            }
        }

        /**
         * WMS-REDUCEデータ作成
         * @param csvFileId {String} CSVID
         * @returns {Object}
         */
        const wmsGetInputData = (csvFileId) => {

            const INTERNALID = 1;  // 内部ID

            let reduceAry = [];  // 渡された値

            if (!common_lib.isEmpty(csvFileId)) {
                // ファイルをロードする
                let csvFile = file.load({
                    id: csvFileId,
                    encoding: file.Encoding.SHIFT_JIS,
                });

                // ファイル内容を取得する
                let csvFileContents = csvFile.getContents();

                //分割記号
                let separator = ',';

                // CSVデータをArrayに変換する
                let csvFileToArray = common_lib.getCSVData(csvFileContents, separator);

                // CSVデータが存在する場合
                if (csvFileToArray.length > 0) {
                    let internalIdJson = {};  // 詳細データ

                    // CSVデータチェック
                    for (let csvFile = 0; csvFile < csvFileToArray.length; csvFile++) {
                        // CSV詳細データ
                        let csvLineData = csvFileToArray[csvFile];

                        // 内部ID
                        let ifInternalId = csvLineData[INTERNALID];

                        // 内部IDによるデータ整理、内部IDが存在する場合
                        if (internalIdJson.hasOwnProperty(ifInternalId)) {

                            internalIdJson[ifInternalId].push(csvLineData);

                        } else { // 内部IDが存在ない場合

                            let ary = [];
                            ary.push(csvLineData);
                            internalIdJson[ifInternalId] = ary;

                        }

                    }

                    // REDUCEデータ作成
                    for (let key in internalIdJson) {

                        // INTERNALID:内部ID  DATAARY:詳細データ
                        reduceAry.push({'internalid': key, 'dataAry': internalIdJson[key]});

                    }
                }
            }
            return reduceAry
        }


        /**
         * CSVまたはテキストファイルの末尾にラインを挿入します。
         * @param internalId {String} CSVNo
         * @param data {Array} CSVデータ
         * @param fileId {String} CSVファイルID
         * @param flag {Boolean} 正常系|異常系
         * @param type {String} 配送|発注書|受領書
         * @returns
         */
        const csvAppendLine = (internalId, data, fileId, flag, type, errorId) => {

            // ファイルをロードする
            let csvFile = file.load({
                id: fileId,
                encoding: file.Encoding.SHIFT_JIS,
            });

            // ファイル内容を取得する
            let csvFileContents = csvFile.getContents();

            // CSV文字列を作成する
            let csvStr = '';

            let typeValue;
            if (type == 'itemful') {
                typeValue = '配送';
            } else if (type == 'po') {
                typeValue = '発注書';
            } else if (type == 'itemreceipt') {
                typeValue = '受領書';
            }

            if (flag) {

                if (common_lib.isEmpty(csvFileContents)) {
                    csvStr = typeValue + "No.,CSV" + '\r\n';
                }

                // 正常系内容追加
                for (let count = 0; count < data.length; count++) {

                    let newData = data[count];

                    csvStr += internalId + ',' + '"' + newData.join(',') + '"' + '\r\n';
                }

            } else {

                if (common_lib.isEmpty(csvFileContents)) {
                    csvStr += '処理結果,エラー項目,' + typeValue + 'No.,CSV' + '\r\n';
                }

                let errorValue;
                if (errorId == 'NUMBER_ISEMPTY') {
                    errorValue = typeValue + '存在チェックエラー';
                } else if (errorId == 'LINE_ISEMPTY') {
                    errorValue = '行番号存在チェックエラー';
                } else if (errorId == 'ITEM_ISEMPTY') {
                	errorValue = 'アイテム存在チェックエラー';
                }

                // 異常系内容追加
                for (let count = 0; count < data.length; count++) {
                    let newData = data[count];
                    csvStr += errorValue + ',配送No.,' + internalId + ',' + '"' + newData.join(',') + '"' + '\r\n';
                }
            }

            csvFile.appendLine({
                value: csvStr
            });

            csvFile.save();

        }

        /**
         * WMS-エラー情報
         * @param saveFileId {String} 正常系
         * @param errorFileId {String} 異常系
         * @param inputSummary {String} inputエラー
         * @param mapSummary {String} mapエラー
         * @param reduceSummary {String} reduceエラー
         * @param summaryContext {String}
         */
        const fileEmptyToDelete = (saveFileId, errorFileId) => {

            // ファイルをロードする
            let saveCsvFile = file.load({
                id: saveFileId,
                encoding: file.Encoding.SHIFT_JIS,
            });

            // ファイル内容を取得する
            let saveCsvFileContents = saveCsvFile.getContents();

            if (common_lib.isEmpty(saveCsvFileContents)) {
                file.delete({
                    id: saveFileId
                });
            }

            // ファイルをロードする
            let errorCsvFile = file.load({
                id: errorFileId,
                encoding: file.Encoding.SHIFT_JIS,
            });

            // ファイル内容を取得する
            let errorCsvFileContents = errorCsvFile.getContents();

            if (common_lib.isEmpty(errorCsvFileContents)) {
                file.delete({
                    id: errorFileId
                });
            }
        }

        /**
         * SFTPリンク取得
         * @param {json} sftpInfo
         * @returns {Object} SFTPリンク
         */
        const connectSFTP = (sftpInfo) => {

            if (!common_lib.isEmpty(sftpInfo)) {
                let conSftp = sftp.createConnection({
                    url: sftpInfo.URL,
                    passwordGuid: sftpInfo.PASSWORDGUID,
                    hostKey: sftpInfo.HOSTKEY,
                    username: sftpInfo.USERNAME,
                    port: sftpInfo.PORT,
                    directory: sftpInfo.DIRECTORY,
                    timeout: TIMEOUT,
                    hostKeyType: HOSTKEYTYPE
                });
                return conSftp;
            }
        }

        /**
         * ファイル削除
         * @param {String|*} fieldId ファイル
         * @param {String} relFilePath ファイルパスは指定  'Images/myImageFile.jpg'
         * @returns {Boolean}
         */
        const delFile = (fieldId, relFilePath) => {

            if (fieldId) {
                record['delete']({
                    type: record.Type.FOLDER,
                    id: fieldId,
                });
                return true;

            } else if (relFilePath) {
                let fullFilePath = relFilePath;

                let fileObject = file.load({
                    id: fullFilePath
                });
                file.delete({
                    id: fileObject.id
                });

                return true;
            }
            return false;
        }

        /**
         * CSV作成
         * @param buffer {String} CSV内容
         * @param filename {String} CSV名前
         * @param folder_id {String} CSV保存フォルダID
         * @returns
         */
        const writeCsvFile = (buffer, filename, folderId) => {

            let fileObj = file.create({
                name: filename,
                fileType: file.Type.CSV,
                contents: buffer
            });
            fileObj.folder = folderId;
            fileObj.encoding = file.Encoding.UTF_8;

            let fileId = fileObj.save();

            return fileId;
        }

        return {
            executeTrusted: executeTrusted,
            executeSend: executeSend,
            wmsGetInputData: wmsGetInputData,
            csvAppendLine: csvAppendLine,
            fileEmptyToDelete: fileEmptyToDelete,
            connectSFTP: connectSFTP,
            delFile: delFile,
            writeCsvFile: writeCsvFile,
        };
    });