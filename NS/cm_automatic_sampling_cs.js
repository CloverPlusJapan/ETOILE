/**
 *  �@�\: CM_�A�C�e��ID�����̔�
 *  Author: �v����
 *  Date : 2023/11/09
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],
    function () {
        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            let curRec = scriptContext.currentRecord;
            let mode = scriptContext.mode
            //create��Ԃł͂Ȃ�
            if (mode != "create") {
                nlapiDisableField('custitem_category_number', 'T');//�ޔ� �D��u��
                nlapiDisableField('custitem_product_number', 'T');//�i�� �D��u��
                nlapiDisableField('custitem_product_registration_date', 'T');//���i�o�^�� �D��u��
                nlapiDisableField('itemid', 'T');
            } else {
                curRec.setValue({fieldId: "itemid", value: "***********"})
                let date = paramsDate(curRec.getValue({fieldId: "custitem_product_registration_date"}));// ���i�o�^��
                //���t�܌��ݒ�
                curRec.setValue({fieldId: "custitem_product_login_date_cd", value: date});//���i�o�^���R�[�h
                nlapiDisableField('itemid', 'T');
            }
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            let currRec = scriptContext.currentRecord;
            let fieldId = scriptContext.fieldId;
            let latinRegex = /^[0-9]*[0-9][0-9]*$/;
            // �t�B�[���h �ޔ� �ύX
            if (fieldId == 'custitem_category_number') {
                let categoryNum = currRec.getText({fieldId: "custitem_category_number"});// �ޔ�
                if (!categoryNum) {
                    let itemName = currRec.getValue({fieldId: "itemid"});
                    currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,0,"***",3)})
                    return;
                } //�� return
                // let containsLatinChars = !latinRegex.test(categoryNum);
                // //���K�\���𖞂����Ȃ��G���[���b�Z�[�W�v�����v�g
                // if (containsLatinChars) {
                //     alert('�����Ȓl�ŁA' + categoryNum + '    �����l�݂̂��܂ނ��Ƃ��ł��܂��B')
                //     currRec.setValue({fieldId: "custitem_category_number", value: "", ignoreFieldChange: true});
                //     return;
                // }
                // let itemCode ="";
                // if (categoryNum.length == 1) {
                //     itemCode = "0" + "0" + categoryNum;
                //     currRec.setValue({
                //         fieldId: "custitem_category_number",
                //         value: itemCode,
                //         ignoreFieldChange: true
                //     });
                // } else if (categoryNum.length == 2) {
                //     itemCode = 0 + categoryNum;
                //     currRec.setValue({
                //         fieldId: "custitem_category_number",
                //         value: itemCode,
                //         ignoreFieldChange: true
                //     });
                // }else {
                //     itemCode =  categoryNum;
                // }
                let itemName = currRec.getValue({fieldId: "itemid"});
                currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,0,categoryNum,3)})
            }
            // �t�B�[���h �i�� �ύX
            if (fieldId == "custitem_product_number") {
                let product_number = currRec.getValue({fieldId: "custitem_product_number"});//�i��
                if (!product_number) {
                    let itemName = currRec.getValue({fieldId: "itemid"});
                    currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,3,"***",6)})
                    return;//�� return
                }
                let containsLatinChars = !latinRegex.test(product_number);
                //���K�\���𖞂����Ȃ��G���[���b�Z�[�W�v�����v�g
                if (containsLatinChars) {
                    alert('�����Ȓl�ŁA' + product_number + '    �����l�݂̂��܂ނ��Ƃ��ł��܂��B')
                    currRec.setValue({fieldId: "custitem_product_number", value: "", ignoreFieldChange: true});
                    return;
                }
                let itemCode = "";
                if (product_number.length == 1) {
                    itemCode = "0" + "0" + product_number;
                    currRec.setValue({
                        fieldId: "custitem_product_number",
                        value: itemCode,
                        ignoreFieldChange: true
                    });
                } else if (product_number.length == 2) {
                    itemCode = 0 + product_number;
                    currRec.setValue({
                        fieldId: "custitem_product_number",
                        value: itemCode,
                        ignoreFieldChange: true
                    });
                }else {
                    itemCode = product_number;
                }
                let itemName = currRec.getValue({fieldId: "itemid"});
                currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,3,itemCode,6)})
            }
            // �t�B�[���h ���i�o�^�� �ύX
            if (fieldId == 'custitem_product_registration_date') {
                let date = paramsDate(currRec.getValue({fieldId: "custitem_product_registration_date"}));// ���i�o�^��
                if (!date){
                    let itemName = currRec.getValue({fieldId: "itemid"});
                    currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,6,"*****",11)});
                    currRec.setValue({fieldId: "custitem_product_login_date_cd", value: date});//���i�o�^���R�[�h
                    return;//�� return
                }
                let itemName = currRec.getValue({fieldId: "itemid"});
                currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,6,date,11)});
                //���t�܌��ݒ�
                currRec.setValue({fieldId: "custitem_product_login_date_cd", value: date});//���i�o�^���R�[�h
            }
        }


        /**
         * ��͓��I�u�W�F�N�g
         * @param boolean
         * @param date
         * @returns {string|*}
         */
        function paramsDate(date) {
            if (typeof (date) == 'string') return date;
            let YYYY = date.getFullYear() + "";
            YYYY = YYYY.substring(1, 4);
            let MM = (date.getMonth() + 1)
            MM = MM < 10 ? "0" + MM : MM;
            return YYYY + MM
        }

        /**
         * �w�蕶���u��
         * @param str
         * @param index
         * @param replaceStr
         * @param endIndex
         * @returns {string}
         */
        function stringReplacement(str,index,replaceStr,endIndex){
            let result = str.substr(0, index) + replaceStr + str.substr(endIndex);
            return result;
        }


        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
        };

    });
