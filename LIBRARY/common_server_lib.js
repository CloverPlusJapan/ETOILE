/**
 * �@�\: �J���S�̋��ʂ̃��C�u�����֐����L�ڂ���
 * Author: ������
 * Date: 2023/10/26
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['/SuiteScripts/LIBRARY/common_lib.js', 'N/search', 'N/record', "N/ui/dialog", "N/format", 'N/error', 'N/email', 'N/runtime', 'N/query', "N/log", "N/sftp", "N/file"],

    function (common_lib, search, record, dialog, format, error, email, runtime, query, log, sftp, file) {

        /**
         * SFTP�t�@�C����M
         *
         * @param connectinfoId SFTP�A�g������ID
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
         * SFTP�t�@�C�����M
         *
         * @param connectInfoId SFTP�A�g������ID
         * @param nsFile NS�t�@�C������ID
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
         * WMS-REDUCE�f�[�^�쐬
         * @param csvFileId {String} CSVID
         * @returns {Object}
         */
        const wmsGetInputData = (csvFileId) => {

            const INTERNALID = 1;  // ����ID

            let reduceAry = [];  // �n���ꂽ�l

            if (!common_lib.isEmpty(csvFileId)) {
                // �t�@�C�������[�h����
                let csvFile = file.load({
                    id: csvFileId,
                    encoding: file.Encoding.SHIFT_JIS,
                });

                // �t�@�C�����e���擾����
                let csvFileContents = csvFile.getContents();

                //�����L��
                let separator = ',';

                // CSV�f�[�^��Array�ɕϊ�����
                let csvFileToArray = common_lib.getCSVData(csvFileContents, separator);

                // CSV�f�[�^�����݂���ꍇ
                if (csvFileToArray.length > 0) {
                    let internalIdJson = {};  // �ڍ׃f�[�^

                    // CSV�f�[�^�`�F�b�N
                    for (let csvFile = 0; csvFile < csvFileToArray.length; csvFile++) {
                        // CSV�ڍ׃f�[�^
                        let csvLineData = csvFileToArray[csvFile];

                        // ����ID
                        let ifInternalId = csvLineData[INTERNALID];

                        // ����ID�ɂ��f�[�^�����A����ID�����݂���ꍇ
                        if (internalIdJson.hasOwnProperty(ifInternalId)) {

                            internalIdJson[ifInternalId].push(csvLineData);

                        } else { // ����ID�����݂Ȃ��ꍇ

                            let ary = [];
                            ary.push(csvLineData);
                            internalIdJson[ifInternalId] = ary;

                        }

                    }

                    // REDUCE�f�[�^�쐬
                    for (let key in internalIdJson) {

                        // INTERNALID:����ID  DATAARY:�ڍ׃f�[�^
                        reduceAry.push({'internalid': key, 'dataAry': internalIdJson[key]});

                    }
                }
            }
            return reduceAry
        }


        /**
         * CSV�܂��̓e�L�X�g�t�@�C���̖����Ƀ��C����}�����܂��B
         * @param internalId {String} CSVNo
         * @param data {Array} CSV�f�[�^
         * @param fileId {String} CSV�t�@�C��ID
         * @param flag {Boolean} ����n|�ُ�n
         * @param type {String} �z��|������|��̏�
         * @returns
         */
        const csvAppendLine = (internalId, data, fileId, flag, type, errorId) => {

            // �t�@�C�������[�h����
            let csvFile = file.load({
                id: fileId,
                encoding: file.Encoding.SHIFT_JIS,
            });

            // �t�@�C�����e���擾����
            let csvFileContents = csvFile.getContents();

            // CSV��������쐬����
            let csvStr = '';

            let typeValue;
            if (type == 'itemful') {
                typeValue = '�z��';
            } else if (type == 'po') {
                typeValue = '������';
            } else if (type == 'itemreceipt') {
                typeValue = '��̏�';
            }

            if (flag) {

                if (common_lib.isEmpty(csvFileContents)) {
                    csvStr = typeValue + "No.,CSV" + '\r\n';
                }

                // ����n���e�ǉ�
                for (let count = 0; count < data.length; count++) {

                    let newData = data[count];

                    csvStr += internalId + ',' + '"' + newData.join(',') + '"' + '\r\n';
                }

            } else {

                if (common_lib.isEmpty(csvFileContents)) {
                    csvStr += '��������,�G���[����,' + typeValue + 'No.,CSV' + '\r\n';
                }

                let errorValue;
                if (errorId == 'NUMBER_ISEMPTY') {
                    errorValue = typeValue + '���݃`�F�b�N�G���[';
                } else if (errorId == 'LINE_ISEMPTY') {
                    errorValue = '�s�ԍ����݃`�F�b�N�G���[';
                } else if (errorId == 'ITEM_ISEMPTY') {
                	errorValue = '�A�C�e�����݃`�F�b�N�G���[';
                }

                // �ُ�n���e�ǉ�
                for (let count = 0; count < data.length; count++) {
                    let newData = data[count];
                    csvStr += errorValue + ',�z��No.,' + internalId + ',' + '"' + newData.join(',') + '"' + '\r\n';
                }
            }

            csvFile.appendLine({
                value: csvStr
            });

            csvFile.save();

        }

        /**
         * WMS-�G���[���
         * @param saveFileId {String} ����n
         * @param errorFileId {String} �ُ�n
         * @param inputSummary {String} input�G���[
         * @param mapSummary {String} map�G���[
         * @param reduceSummary {String} reduce�G���[
         * @param summaryContext {String}
         */
        const fileEmptyToDelete = (saveFileId, errorFileId) => {

            // �t�@�C�������[�h����
            let saveCsvFile = file.load({
                id: saveFileId,
                encoding: file.Encoding.SHIFT_JIS,
            });

            // �t�@�C�����e���擾����
            let saveCsvFileContents = saveCsvFile.getContents();

            if (common_lib.isEmpty(saveCsvFileContents)) {
                file.delete({
                    id: saveFileId
                });
            }

            // �t�@�C�������[�h����
            let errorCsvFile = file.load({
                id: errorFileId,
                encoding: file.Encoding.SHIFT_JIS,
            });

            // �t�@�C�����e���擾����
            let errorCsvFileContents = errorCsvFile.getContents();

            if (common_lib.isEmpty(errorCsvFileContents)) {
                file.delete({
                    id: errorFileId
                });
            }
        }

        /**
         * SFTP�����N�擾
         * @param {json} sftpInfo
         * @returns {Object} SFTP�����N
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
         * �t�@�C���폜
         * @param {String|*} fieldId �t�@�C��
         * @param {String} relFilePath �t�@�C���p�X�͎w��  'Images/myImageFile.jpg'
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
         * CSV�쐬
         * @param buffer {String} CSV���e
         * @param filename {String} CSV���O
         * @param folder_id {String} CSV�ۑ��t�H���_ID
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