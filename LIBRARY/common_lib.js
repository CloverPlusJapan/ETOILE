/**
 * �@�\: �J���S�̋��ʂ̃��C�u�����֐����L�ڂ���
 * Author: ������
 * Date: 2023/10/26
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['/SuiteScripts/LIBRARY/common_server_lib.js', 'N/search', 'N/record', "N/ui/dialog", "N/format", 'N/error', 'N/email', 'N/runtime', 'N/query', "N/log", "N/sftp", "N/file"],

    function (common_server_lib, search, record, dialog, format, error, email, runtime, query, log, sftp, file) {

        /**
         * �}�X�^ / �g�����U�N�V�����擾
         * @param {Object|*} searchType �������
         * @param {Object|*} searchFilters ��������
         * @param {Object|*} searchColumns ��������
         * @returns {Object} resultList �������ʔz��
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
         * ����`�F�b�N
         * @param {String|*} date ���
         * @param {String|*} fh �t�H�[�}�b�g
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
         * �󔒃`�F�b�N
         * @param {Object|*} obj ������
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
         * �A�C�e���}�X�^�擾
         * @return {(Object)} �A�C�e������ID
         */
        const getItemAryValue = () => {

            let infoDic = [];
            let itemSearch = "item";
            let itemFilters = [];
            let searchColumns = [search.createColumn({
                name: "internalid",
                label: "����ID"
            })];
            let itemSearchResults = getSearchData(itemSearch, itemFilters, searchColumns);
            if (itemSearchResults && itemSearchResults.length > 0) {
                for (let itemSearchNum = 0; itemSearchNum < itemSearchResults.length; itemSearchNum++) {
                    let tmpResult = itemSearchResults[itemSearchNum];
                    // ����ID
                    infoDic.push(tmpResult.getValue({
                        name: "internalid",
                        label: "����ID"
                    }))
                }
            }
            return infoDic;
        }

        /**
         * SFTP�A�g���
         * @param id SFTP�A�g������ID
         */
        const getConnectInfo = (idName) => {

            let sftpInfo;

            if (!isEmpty(idName)) {

                //SFTP�A�g���
                var customrecord_sftp_infoSearchObj = search.create({
                    type: "customrecord_sftp_info",
                    filters:
                        [
                            ["custrecord_sftp_connectinfo", "is", idName]
                        ],
                    columns:
                        [search.createColumn({
                            name: "custrecord_sftp_connectinfo",
                            label: "�A�g�敪"
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
                            label: "SFTP-�_�E�����[�h-PATH"
                        }), search.createColumn({
                            name: "custrecord_sftp_down_file_name",
                            label: "SFTP-�_�E�����[�h-FILE-NAME"
                        }), search.createColumn({
                            name: "custrecord_sftp_down_done",
                            label: "SFTP-�_�E�����[�h-����"
                        }), search.createColumn({
                            name: "custrecord_sftp_down_to_ns",
                            label: "SFTP-�_�E�����[�h-NS"
                        }), search.createColumn({
                            name: "custrecord_sftp_down_ns_done",
                            label: "SFTP-�_�E�����[�h-NS-����"
                        }), search.createColumn({
                            name: "custrecord_ns_upload_sftp_path",
                            label: "NS-�A�b�v���[�h-SFTP-PATH"
                        }), search.createColumn({
                            name: "custrecord_ns_upload_sftp_file_name",
                            label: "NS-�A�b�v���[�h-SFTP-FILE-NAME"
                        })]

                });

                let searchResults = getAllResults(customrecord_sftp_infoSearchObj);

                if (searchResults && searchResults.length > 0) {
                    for (let sftpNum = 0; sftpNum < searchResults.length; sftpNum++) {
                        let tmpResult = searchResults[sftpNum];
                        sftpInfo = {
                            'CONNECTINFO': tmpResult.getValue({
                                name: "custrecord_sftp_connectinfo",
                                label: "�A�g�敪"
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
                                label: "SFTP-�_�E�����[�h-PATH"
                            }),
                            'SFTPDOWNFILENAME': tmpResult.getValue({
                                name: "custrecord_sftp_down_file_name",
                                label: "SFTP-�_�E�����[�h-FILE-NAME"
                            }),
                            'SFTPDOWNDONE': tmpResult.getValue({
                                name: "custrecord_sftp_down_done",
                                label: "SFTP-�_�E�����[�h-����"
                            }),
                            'DOWNTONS': tmpResult.getValue({
                                name: "custrecord_sftp_down_to_ns",
                                label: "SFTP-�_�E�����[�h-NS"
                            }),
                            'DOWNTONSDONE': tmpResult.getValue({
                                name: "custrecord_sftp_down_ns_done",
                                label: "SFTP-�_�E�����[�h-NS-����"
                            }),
                            'UPLOADSFTPPATH': tmpResult.getValue({
                                name: "custrecord_ns_upload_sftp_path",
                                label: "NS-�A�b�v���[�h-SFTP-PATH"
                            }),
                            'UPLOADSFTPFILENAME': tmpResult.getValue({
                                name: "custrecord_ns_upload_sftp_file_name",
                                label: "NS-�A�b�v���[�h-SFTP-FILE-NAME"
                            })
                        };
                    }
                }
            }

            return sftpInfo;
        }


        /**
         * ���[�����M
         * @param mailJson ���[�����e
         * @param mailSftpId�@���[���A�g������ID
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
         * JSON����l���擾
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
         * �������擾
         *
         * @param {date|*} year �N
         * @param {date|*} month ��
         * @param {holidayFlg|*} �c�Ɠ��t���O
         * @returns {date} ������
         */
        const getEndOfMonth = (year, month, holidayFlg) => {

            let date = new Date(year, month, 1);
            let lastDate = date.setDate(date.getDate() - 1);

            if (holidayFlg) {        //�c�Ɠ��̂ݎ擾����
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
         * �}�X�^ / �g�����U�N�V���� �f�[�^���݃`�F�b�N
         * @param {Object|*} searchType �������
         * @param {Object|*} searchFilters ��������
         * @returns {Boolean} boolean �������ʔz�񂪑��݂��邩
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
         * ���l�`�F�b�N
         * @param {String|*} data ������
         * @returns {Boolean}
         */
        const isNumber = (data) => {

            // ���l�`�F�b�N
            if (!isNaN(parseFloat(data)) && isFinite(data)) {
                return true;
            } else {
                return false;
            }

        }

        /**
         * �����񂩂���t�ɕϊ�
         *
         * @param {String|*} beforString �ϊ��O������
         * @param {String|*} changeType �ϊ��^�C�v
         * @param {String|*} textColumn P1�@���P
         * @param {String|*} textColumns P2�@���Q
         * @returns {Date} �ϊ��t�H�[�}�b�g(���t)
         */
        const strConvert = (beforString, changeType, textColumn, textColumns) => {

            //�@�ϊ��O�����񂪋󔒂̏ꍇ�́A�u�Ώە����񂪕s���v�ƃ��O���o�͂��A�󔒂�߂�B
            if (isEmpty(beforString)) {
                log.debug('�Ώە����񂪕s��');
                return null;
            }

            //�@�ϊ��^�C�v���u0�v�Ɓu1�v�ȊO�̏ꍇ�́A�u�ύX�^�C�v���s���v�ƃ��O���o�͂��A�󔒂�߂�B
            if (changeType != 0 && changeType != 1) {
                log.debug('�ύX�^�C�v���s��');
                return null;
            }

            // �ϊ��^�C�v���u0�v��P1���󔒂̏ꍇ�́A�u�ύX�O�t�H�[�}�b�g���s���v�ƃ��O���o�͂��A�󔒂�߂�B
            if (!isEmpty(changeType) && changeType == 0 && isEmpty(textColumn)) {
                log.debug('�ύX�O�t�H�[�}�b�g���s��');
                return null;
            }

            //�@�ϊ��^�C�v���u1�v��P1��1���ȊO�̏ꍇ�́A�u�����������s���v�ƃ��O���o�͂��A�󔒂�߂�B
            if (!isEmpty(changeType) && changeType == 1 && textColumn.length != 1) {
                log.debug('�����������s��');
                return null;
            }

            // �ϊ��^�C�v���u0�v��P2���󔒂̏ꍇ�́A�u�ύX��t�H�[�}�b�g���s���v�ƃ��O���o�͂��A�󔒂�߂�B
            if (!isEmpty(changeType) && changeType == 0 && isEmpty(textColumns)) {
                log.debug('�ύX��t�H�[�}�b�g���s��');
                return null;
            }

            // �ϊ��^�C�v���u1�v��P2���󔒖��͐��l�ł͂Ȃ��ꍇ�́A�u�������s���v�ƃ��O���o�͂��A�󔒂�߂�B
            if (!isEmpty(changeType) && changeType == 1 && isEmpty(textColumns) || typeof (textColumns) != 'number') {
                log.debug('�������s��');
                return null;
            }

            //�@�ϊ��^�C�v���u0�v�̏ꍇ��
            if (!isEmpty(changeType) && changeType == 0) {
                let date = new Date(dateString);
                // ���t�L��
                if (!isNaN(date.getTime())) {
                    return setDateToString(date, textColumns);
                }
            }

            //�@�ϊ��^�C�v���u1�v�̏ꍇ��
            if (!isEmpty(changeType) && changeType == 1) {
                return dateString.padStart(textColumns, textColumn);
            }

        }

        /**
         * �����擾
         * @returns {Date} ����
         */
        const getDueDate = () => {

            let now = new Date();
            let offSet = now.getTimezoneOffset();
            let offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);
            return now;

        }

        /**
         * �V�X�e�����t�Ǝ��Ԃ��t�H�[�}�b�g�Ŏ擾
         * returns{String} yyyymmddhhmmssms
         */
        const getFormatYmdHms = () => {

            // �V�X�e������
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
         * ����擾
         *
         * @param {date} date ���t
         * @param {number} days �o�ߓ���
         * @param {number} computing �v�Z���@
         * @param {Boolean} holidayFlg �c�Ɠ��t���O
         * @returns {date} �����̓���
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
         * �N��擾
         *
         * @param {date} date ���t
         * @param {number} days �o�ߓ���
         * @param {number} computing �v�Z���@
         * @param {Boolean} holidayFlg �c�Ɠ��t���O
         * @returns {date} �����̓���
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
         * �N�ԏj�����t�擾
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
                            label: "���t"
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
         * �j�����ǂ����𔻒f����
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
         * CSV�f�[�^��Array�ɕϊ�����
         * @param {String|*} strData CSV�f�[�^
         * @param {String} strDelimiter ��؂�L��
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
         * �ۑ������̌��ʂ��CSV�f�[�^�쐬
         *
         * @param searchId �ۑ���������ID
         * @param filename �t�@�C����
         * @param csvSaveFolder �t�H���_ID�̕ۑ�
         */
        const setCSVBySearch = (searchId, filename, csvSaveFolder) => {

            let csvStr = '';

            // ���R�[�h�ۑ�����
            let searchObj = search.load({
                id: searchId
            });

            // ���e�擾
            let searchResults = getAllResults(searchObj);

            // �ۑ��������e�����݂���ꍇ
            if (searchResults && searchResults.length > 0) {

                // �擾�ۑ����ʂ̗�
                let columns = searchObj.columns;

                // CSV�w�b�h�쐬
                for (let count = 0; count < columns.length; count++) {
                    if (count == columns.length - 1) {
                        csvStr += columns[count]['label'] + '\r\n';
                        break;
                    }
                    csvStr += columns[count]['label'] + ',';
                }

                // CSV���e�쐬
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

            // CSV�ۑ�
            common_server_lib.writeCsvFile(csvStr, filename, csvSaveFolder);
        }

        /**
         *���t���當����]��
         * @param date
         * @param format
         * @returns {String}
         *  ��:
         console.log(setDateToString(date, 'yyyy-MM-dd HH:mm:ss')); // 2023-11-16 08:25:05
         console.log(setDateToString(date, 'yyyy�NMM��dd�� HH:mm:ss')); // 2023�N11��16�� 08:25:05
         console.log(setDateToString(date, 'yyyy-MM-dd HH:mm:ss S')); // 2023-11-16 08:25:05 950
         console.log(setDateToString(date, 'yyyMM')); // 02311
         */
        const setDateToString = (date, format) => {

            const DATA_OBJECT = {
                'M+': date.getMonth() + 1, // ��
                'd+': date.getDate(), // ��
                'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //����
                'H+': date.getHours(), // ����
                'm+': date.getMinutes(), // ��
                's+': date.getSeconds(), // �b
                S: date.getMilliseconds(), // �~���b
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
         * CSV�f�[�^�쐬
         *
         * @param array
         * @returns {String} csv������
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
         * MR�G���[�����@����
         * @param {Object|*} summary summarize����Ăяo��
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
                log.error({title: 'getInputData�F', details: inputSummary.error});
                handleErrorAndSendNotification(e, 'getInputData', script_id);
            }

            handleErrorInStage('map', mapSummary, script_id);
            handleErrorInStage('reduce', reduceSummary, script_id);
        }

        /**
         * map��reduce�̃G���[����
         * @param {Object} stage MapOrReduce
         * @param {Object} summary Summary
         * @param {String} scriptid �X�N���v�gID
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
         * map��reduce�̃��[�����M����
         * @param {Object} e �G���[
         * @param {Object} stage MapOrReduce
         * @param {String} scriptid �X�N���v�gID
         */
        const handleErrorAndSendNotification = (e, stage, scriptid) => {

            // ���[�����M����
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
         * ���X�g���󔒂��ǂ�����Ԃ��֐�
         * @param {Array|*} list ���X�g
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
         * API�̎擾
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
                    search.createColumn({name: "custrecord_api_kbn", label: "API�敪"}),
                    search.createColumn({name: "custrecord_user_id", label: "���[�UID"}),
                    search.createColumn({name: "custrecord_key", label: "���ʃL�["})
                ]
            }).run().each(function (result) {
                userId = result.getValue("custrecord_user_id");
                key = result.getValue("custrecord_key");
            });
            return {
                "�A�N�Z�X�g�[�N��": SHA256(userId + systemDate + key),
                "���[�UID": userId,
                "���N�G�X�g����": systemDate
            }
        }

        /**
         *  ������ϊ�SHA 256
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
         * ���ʃZ�b�g�z��̎擾
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
         * �s�ԍ��擾
         * @param {String|*} internalid ����ID
         * @param {String|*} type ���
         * @return {(Object)} ���C���ԍ�
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
                // �A�C�e������ID���擾
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
         * Mail�A�g���擾
         * @param mailSftpId Mail�A�g������ID
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
                        search.createColumn({name: "custrecord_msgid_info", label: "���b�Z�[�WID"}),
                        search.createColumn({name: "custrecord_subject_info", label: "����"}),
                        search.createColumn({name: "custrecord_body_info", label: "���e"})
                    ]
            });

            let searchObj = getAllResults(customrecord_mail_infoSearchObj);
            if (searchObj && searchObj.length > 0) {
                mailSftpJson = {
                    'MSGID': searchObj[0].getValue({name: "custrecord_msgid_info", label: "���b�Z�[�WID"}),
                    'SUBJECT': searchObj[0].getValue({name: "custrecord_subject_info", label: "����"}),
                    'BODY': searchObj[0].getValue({name: "custrecord_body_info", label: "���e"}),
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