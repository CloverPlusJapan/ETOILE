/**
 * �@�\: WMS_�o�ɘA�g_�v���O����
 * Author: CPC_�v
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

            // �p�����[�^�擾
            let script = runtime.getCurrentScript();

            // CSV�t�@�C��
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

            const INTERNALID = 0;  // ����ID
            const SHNC = 1;  // �A�C�e��
            const HTTDNPGYON = 2;  // �s�ԍ�
            const NYKKKTH = 3;  // �o�Ɋm���
            const WMSNYKKKTN = 4;  // WMS�d�؏��ԍ�
            const NYKS = 5;  // �v�Z��

            let appendType = 'itemful';

            // �p�����[�^�擾
            let script = runtime.getCurrentScript();

            // CSV�쐬����ID ����n
            let saveFileId = script.getParameter({name: "custscript_itemship_update_save_fileid"});

            // CSV�쐬����ID �ُ�n
            let errorFileId = script.getParameter({name: "custscript_itemship_update_error_fileid"});

            // �R���e�L�X�g�擾
            let mapContextJson = JSON.parse(mapContext.value);

            // �z��No
            let itemfulfillmentNo = mapContextJson['internalid'];

            // �z��No�f�[�^
            let valueAry = mapContextJson['dataAry'];

            // ��������
            let filters = [
                ['type', 'anyof', 'itemfulfillment'],
                'AND',
                ['mainline', 'is', 'F'],
                'AND',
                ['taxline', 'is', 'F'],
                'AND',
                ['internalid', 'anyof', itemfulfillmentNo],
            ]

            // �z���`�[���݃`�F�b�N
            if (!common_lib.dataExists('itemfulfillment', filters)) {

                common_server_lib.csvAppendLine(itemfulfillmentNo, valueAry, errorFileId, false, appendType, 'NUMBER_ISEMPTY');

            } else {

                // �ۑ��t���O
                let saveFlag = true;

                // �A�C�e���擾
                let itemAry = common_lib.getItemAryValue();

                // �s�ԍ��擾
                let lineAry = common_lib.getLineValue(itemfulfillmentNo, appendType);

                // �z���擾
                let itemfulRecord = record.load({
                    type: 'itemfulfillment',
                    id: itemfulfillmentNo,
                });

                // ���׃f�[�^�쐬
                for (let lineNum = 0; lineNum < valueAry.length; lineNum++) {

                    // �A�C�e�����݃`�F�b�N
                    if (itemAry.indexOf(value[SHNC]) == -1) {

                        saveFlag = false;
                        common_server_lib.csvAppendLine(itemfulfillmentNo, valueAry, errorFileId, false, appendType, 'ITEM_ISEMPTY');
                        break;
                    }

                    // �s�ԍ����݃`�F�b�N
                    if (lineAry.indexOf(value[HTTDNPGYON]) == -1) {

                        saveFlag = false;
                        common_server_lib.csvAppendLine(itemfulfillmentNo, valueAry, errorFileId, false, appendType, 'LINE_ISEMPTY');
                        break;
                    }

                    // �ڍ׃f�[�^
                    let value = valueAry[lineNum];

                    // �o�Ɋm���
                    itemfulRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_departure_date',
                        line: value[HTTDNPGYON],
                        value: value[NYKKKTH],
                        ignoreFieldChange: true
                    });

                    // �A�C�e��
                    itemfulRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: value[HTTDNPGYON],
                        value: value[SHNC],
                        ignoreFieldChange: true
                    });

                    // WMS�d�؏��ԍ�
                    itemfulRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_wms_partition_num',
                        line: value[HTTDNPGYON],
                        value: value[WMSNYKKKTN],
                        ignoreFieldChange: true
                    });

                    // �v�Z��
                    itemfulRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_calculation_day',
                        line: value[HTTDNPGYON],
                        value: value[NYKS],
                        ignoreFieldChange: true
                    });

                }

                // �z���쐬
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

            // �p�����[�^�擾
            let script = runtime.getCurrentScript();

            // CSV�쐬����ID ����n
            let saveFileId = script.getParameter({name: "custscript_itemship_update_save_fileid"});

            // CSV�쐬����ID �ُ�n
            let errorFileId = script.getParameter({name: "custscript_itemship_update_error_fileid"});

            // �X�N���v�gID
            let script_id = script.id;

            // ��M��
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