/**
 *  �@�\: CM_�A�C�e�����i�����ύX
 *  Author: �v����
 *  Date : 2023/11/02
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/search', '../LIBRARY/common_lib.js'],

    (runtime, search,utils) => {

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            let currRecord = scriptContext.newRecord;
            let form = scriptContext.form;
            let status = currRecord.getValue({fieldId: "custrecord_etonet_status"});// �X�e�[�^�X
            // �X�e�[�^�X �Ȃ� �\���� 	���F�ς� �۔F  �ҏW�{�^�����B��
            if (status == '2' || status == "3" || status == "4") hiddenButton(form);
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            let currRecord = scriptContext.newRecord;
            let type = scriptContext.type
            if (type == "delete") return;
            let item = currRecord.getValue({fieldId: "custrecord_etonet_item"});// �A�C�e��
            let startDate = currRecord.getValue({fieldId: "custrecord_etonet_start_date"});// �J�n��
            let endDate = currRecord.getValue({fieldId: "custrecord_etonet_end_date"});// �I����
            let changeType = currRecord.getValue({fieldId: "custrecord_etonet_price_change_type"});// ���i�ύX���
            if (startDate && endDate) {
                //���t�t�`�F�b�N
                if (paramsDate(startDate) > paramsDate(endDate)) {
                    throw "���i���f�@�J�n���E���i���f�@�I�������s���ł��̂ŁA���������͂�������"
                }
            }
            let dateS = search.createColumn({
                name: "formulatext",
                formula: "to_char({custrecord_etonet_start_date},'YYYYMMDD')"
            })
            let dateE = search.createColumn({
                name: "formulatext",
                formula: "to_char({custrecord_etonet_end_date},'YYYYMMDD')"
            })
            let filtersArr = [["custrecord_etonet_item", "anyof", item]]
            if (type != "create") {
                filtersArr.push("AND", ["internalid", "noneof", currRecord.id])
            }
            let priceSearchObj = search.create({
                type: "customrecord_change_of_reservation_price",
                filters: filtersArr,
                columns: [dateS, dateE, search.createColumn({name: "custrecord_etonet_price_change_type"})]
            });
            if (priceSearchObj.runPaged().count == 0) return;
            priceSearchObj.run().each(function (res) {
                let dateA = Number(res.getValue(dateS));
                let dateB = Number(res.getValue(dateE));
                let changeTypeA = res.getValue("custrecord_etonet_price_change_type");
                //���݂̋L�^�̉��i�ω��̎�ʂ̓Z�[�� ������search�ł� �Z�[��
                if (changeType == "1" && changeTypeA == "1") {
                    if (paramsDate(startDate) <= dateB && paramsDate(endDate) >= dateA) {
                        throw "�����̃Z�[�����ԂƏd�����Ă��܂��B�Z�[�����Ԃ��C�����Ă��������B"
                    }
                    //���݂̋L�^�� �Z�[�� ������search�ł� �P�v
                } else if (changeType == "1" && changeTypeA == "2") {
                    if (paramsDate(startDate) <= dateA && paramsDate(endDate) >= dateA) {
                        throw "�����̃Z�[�����ԂƏd�����Ă��܂��B�Z�[�����Ԃ��C�����Ă��������B"
                    }
                    //���݂̋L�^�� �P�v ����search�ł�  �Z�[��
                } else if (changeType == "2" && changeTypeA == "1") {
                    if (paramsDate(startDate) >= dateA && paramsDate(startDate) <= dateB) {
                        throw "�����̃Z�[�����ԂƏd�����Ă��܂��B�Z�[�����Ԃ��C�����Ă��������B"
                    }
                    //���݂̋L�^��  �P�v ����search�ł�  �P�v
                } else if (changeType == "2" && changeTypeA == "2") {
                    if (paramsDate(startDate) == dateA) {
                        throw "�����̃Z�[�����ԂƏd�����Ă��܂��B�Z�[�����Ԃ��C�����Ă��������B"
                    }
                }
                return true;
            })
        }

        /**
         *�ҏW�{�^�����B��
         * @param form
         */
        function hiddenButton(form) {
            let edit = form.getButton("edit");
            edit.isHidden = true;
        }

        /**
         * ���t�I�u�W�F�N�g�̕ϊ�
         * @param date
         * @returns {string|*}
         */
        function paramsDate(date) {
            return Number( utils.setDateToString(date,"yyyyMMdd"));
        }

        return {
            beforeLoad,
            beforeSubmit,
        }
    }
);
