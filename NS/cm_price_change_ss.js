/**
 * �@�\: CM_�A�C�e�����i�����ύX
 * Author: �v����
 * Date : 2023/11/03
 *
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/record', '../LIBRARY/constant_lib.js', '../LIBRARY/common_lib.js'],

    (search, record, lib, utils) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            let dateJson = {}; //Json
            let caseDate = search.createColumn({
                name: "formulatext",
                formula: "   CASE WHEN to_char({custrecord_etonet_start_date},'YYYYMMDD') = to_char({today},'YYYYMMDD')  THEN 1 END || CASE WHEN to_char({custrecord_etonet_end_date},'YYYYMMDD') = TO_CHAR({today}-1,'YYYYMMDD')  THEN 0 END"
            });//  �J�n���A�I�����̋敪
            // �\�񉿊i�ύX����
            search.create({
                type: "customrecord_change_of_reservation_price",
                filters:
                    [
                        [["custrecord_etonet_start_date", "on", "today"], "OR", ["custrecord_etonet_end_date", "on", "yesterday"]],
                        "AND",
                        ["custrecord_etonet_status", "anyof", "3"]
                    ],
                columns:
                    [
                        search.createColumn({name: "custrecord_etonet_item"}),
                        search.createColumn({name: "type", join: "CUSTRECORD_ETONET_ITEM"}),
                        search.createColumn({name: "custrecord_etonet_vendor_price", label: "�d�����i"}),
                        search.createColumn({name: "custrecord_etonet_wholesale_price", label: "�����i"}),
                        search.createColumn({name: "custrecord_etonet_retail_price", label: "�������i"}),
                        search.createColumn({name: "custrecord_etonet_approver_date", label: "���F����"}),
                        search.createColumn({name: "custrecord_old_vendor_price", label: "���d�����i"}),
                        search.createColumn({name: "custrecord_old_wholesale_price", label: "�������i"}),
                        search.createColumn({name: "custrecord_old_retail_price", label: "���������i"}),
                        caseDate
                    ]
            }).run().each(function (res) {
                dateJson.endDateArr = dateJson.endDateArr || [];
                dateJson.startDateArr = dateJson.startDateArr || [];
                let kbn = res.getValue(caseDate);
                // today �J�n���͍����Ɠ����ŁA�X�V����K�v������f�[�^
                if (kbn == 1) {
                    let option = {
                        id: res.id, //���R�[�h����ID
                        itemType: res.getValue({name: "type", join: "CUSTRECORD_ETONET_ITEM"}), //�i�ڃ^�C�v
                        itemId: res.getValue({name: 'custrecord_etonet_item'}), //�A�C�e��
                        vendorPrice: res.getValue('custrecord_etonet_vendor_price'),//�d�����i
                        wholesalePrice: res.getValue('custrecord_etonet_wholesale_price'),//�����i
                        retailPrice: res.getValue('custrecord_etonet_retail_price'),//�������i
                    };
                    dateJson.startDateArr.push(option);
                } else {
                    //yesterday  �I�����͍���̃f�[�^�ɓ������A�f�[�^�̍X�V���K�v�ł�
                    let option = {
                        itemType: res.getValue({name: "type", join: "CUSTRECORD_ETONET_ITEM"}),//�i�ڃ^�C�v
                        itemId: res.getValue({name: 'custrecord_etonet_item'}),//�A�C�e��
                        vendorPrice: res.getValue('custrecord_old_vendor_price'),//���d�����i
                        wholesalePrice: res.getValue('custrecord_old_wholesale_price'),//�������i
                        retailPrice: res.getValue('custrecord_old_retail_price'),//���������i
                    };
                    dateJson.endDateArr.push(option);
                }
                return true;
            })
            if (utils.isEmpty(dateJson)) {
                return;
            }
            //�I�����̍X�V���Ɏ��s����
            endDateExecute(dateJson.endDateArr);
            //���s�J�n���̍X�V
            startDateExecute(dateJson.startDateArr);
        }

        /**
         *  �i�ڂ̍X�V�̎��s
         * @param dateArr �z��̍X�V
         */
        function endDateExecute(dateArr) {
            for (let count = 0; count < dateArr.length; count++) {
                let itemArr = dateArr[count];
                let itemType = itemArr.itemType;
                let itemId = itemArr.itemId;
                try {
                    let ltemRec = record.load({type: lib.ITEM_TYPE[itemType], id: itemId, isDynamic: true});
                    ltemRec.setValue({
                        fieldId: "custitem_wholesale_price",
                        value: itemArr.wholesalePrice
                    });//�����i
                    ltemRec.setValue({
                        fieldId: "cost",
                        value: itemArr.vendorPrice
                    });//�d�����i
                    ltemRec.setValue({
                        fieldId: "custitem_retail_price",
                        value: itemArr.retailPrice
                    });//�������i
                    ltemRec.save({ignoreMandatoryFields: true});
                } catch (e) {
                    log.audit("error", e);
                }
            }
        }

        /**
         *  �i�ڂ̍X�V�̎��s
         * @param dateArr �z��̍X�V
         */
        function startDateExecute(dateArr) {
            for (let count = 0; count < dateArr.length; count++) {
                let itemArr = dateArr[count];
                let itemType = itemArr.itemType;
                let itemId = itemArr.itemId;
                try {
                    let ltemRec = record.load({type: lib.ITEM_TYPE[itemType], id: itemId, isDynamic: true});
                    let wholesalePrice = ltemRec.getValue({fieldId: "custitem_wholesale_price"})
                    let cost = ltemRec.getValue({fieldId: "cost"})
                    let retailPrice = ltemRec.getValue({fieldId: "custitem_retail_price"})
                    record.submitFields({
                        type: "customrecord_change_of_reservation_price",
                        id: itemArr.id,
                        values: {
                            custrecord_old_vendor_price: cost, //���d�����i
                            custrecord_old_wholesale_price: wholesalePrice,//�������i
                            custrecord_old_retail_price: retailPrice//���������i
                        }
                    })
                    ltemRec.setValue({fieldId: "custitem_wholesale_price", value: itemArr.wholesalePrice});//�����i
                    ltemRec.setValue({fieldId: "cost", value: itemArr.vendorPrice});//�d�����i
                    ltemRec.setValue({fieldId: "custitem_retail_price", value: itemArr.retailPrice});//�������i
                    ltemRec.save({ignoreMandatoryFields: true});
                } catch (e) {
                    log.audit("error", e);
                }
            }
        }


        return {execute}

    });
