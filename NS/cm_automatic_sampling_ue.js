/**
 * �@�\: CM_�A�C�e��ID�����̔�
 *  Author: �v����
 *  Date : 2023/11/09
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', '../LIBRARY/common_lib.js'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search, utils) => {
        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            let newRecord = scriptContext.newRecord;
            let type = scriptContext.type;
            let categoryNum = newRecord.getValue({fieldId: "custitem_category_number"});//�ޔ�
            let categoryNumText ="";
            if (!utils.isEmpty(categoryNum)){
            let  categoryNumObj = search.lookupFields({type:"customrecord_like_number",id:categoryNum,columns:['name']});
                 categoryNumText = categoryNumObj['name'];
            }
             log.audit("categoryNumText", categoryNumText);
            let productNum = newRecord.getValue({fieldId: "custitem_product_number"});//�i��
            let dateCd = newRecord.getValue({fieldId: "custitem_product_login_date_cd"});//���i�o�^���R�[�h
            let color = newRecord.getValue({fieldId: "custitem_color_matrix"});//�J���[
            let size = newRecord.getValue({fieldId: "custitem_size_matrix"});//�T�C�Y
            let matrixp = newRecord.getValue({fieldId: "entryformquerystring"});
            //�}�g���b�N�X�i�ڂ̏ꍇ
            if (matrixp.indexOf('matrixp') >= 1) {
                if (type == "create") {
                    // �ޔ� �i�� ���݃`�F�b�N���s��
                    if (!utils.isEmpty(categoryNum) && !utils.isEmpty(productNum)) {
                        let inventoryitemSearchObj = search.create({
                            type: "inventoryitem",
                            filters: [
                                ["type", "anyof", "InvtPart"],
                                "AND",
                                ["matrix", "is", "T"],
                                "AND",
                                ["custitem_category_number", "anyof", categoryNum],
                                "AND",
                                ["custitem_product_number", "is", productNum],
                                "AND",
                                ["isinactive", "is", "F"]
                            ],
                            columns: []
                        });
                        let searchResultCount = inventoryitemSearchObj.runPaged().count;
                        if (searchResultCount > 0) {
                            throw '���͂��ꂽ�ޔԂƕi�Ԃ����݂��Ă��܂��B'
                        }
                    }
                    // �i�Ԃ����͂���Ă��Ȃ��ꍇ�͍̔Ԃ���
                    if (utils.isEmpty(productNum)) {
                        let inventoryitemSearchObj = search.create({
                            type: "inventoryitem",
                            filters: [
                                ["type", "anyof", "InvtPart"],
                                "AND",
                                ["matrix", "is", "T"],
                                "AND",
                                ["custitem_category_number", "anyof", categoryNum],
                                "AND",
                                ["isinactive", "is", "F"]
                            ],
                            columns: [search.createColumn({name: "custitem_product_number", summary: "MAX"})]
                        });
                        let searchResultCount = inventoryitemSearchObj.runPaged().count;
                        let num = "";
                        //���͂��ꂽ�ޔԂ��}�g���N�X�E�A�C�e���ɑ��݂��Ȃ��ꍇ�́A�i�ԂɁu001�v��ݒ肷��B
                        if (searchResultCount == 0) {
                            num = "001";
                        } else {
                            //���͂��ꂽ�ޔԂ��}�g���N�X�E�A�C�e���ɑ��݂���ꍇ�́A�ő�̗L���ȕi�ԁ{�P�Őݒ肷��B
                            inventoryitemSearchObj.run().each(function (res) {
                                num = Number(res.getValue({name: "custitem_product_number", summary: "MAX"})) + 1 + "";
                            })
                            if (num.length == 1) {
                                num = "0" + "0" + num;
                            }
                            if (num.length == 2) {
                                num = "0" + num;
                            }
                            //�ő�̕i�Ԃ�996�̏ꍇ��001����󂫔Ԃ�T���āA�󂫔Ԃ�����ꍇ�͕i�Ԃɐݒ肷��B
                            if (Number(num) >= 997) {
                                let inventoryitemSearchObj = search.create({
                                    type: "inventoryitem",
                                    filters: [
                                        ["type", "anyof", "InvtPart"],
                                        "AND",
                                        ["matrix", "is", "T"],
                                        "AND",
                                        ["custitem_category_number", "anyof", categoryNum],
                                        "AND",
                                        ["isinactive", "is", "F"]
                                    ],
                                    columns: [search.createColumn({
                                        name: "custitem_product_number",
                                        sort: search.Sort.ASC
                                    })]
                                });
                                let resultArr = utils.getAllResults(inventoryitemSearchObj);
                                let finalItemNum = "";
                                for (let row = 0; row < resultArr.length; row++) {
                                    if (row == 0) {
                                        continue;
                                    }
                                    let startNum = Number(resultArr[row].getValue('custitem_product_number'));
                                    let endNum = Number(resultArr[row - 1].getValue('custitem_product_number'));
                                    //���݂̋L�^�i�Ԃ��O�̋L�^�̕i�Ԃ��1���傫���ꍇ
                                    if (startNum - endNum > 1) {
                                        finalItemNum = endNum + 1 + "";
                                        if (finalItemNum.length == 1) finalItemNum = "0" + "0" + finalItemNum;
                                        if (finalItemNum.length == 2) finalItemNum = "0" + finalItemNum;
                                        break;
                                    }
                                }
                                if (utils.isEmpty(finalItemNum)) {
                                    throw "�Y���ޔԂ̋󂫕i�Ԃ�����܂���̂ŁA�̔Ԃł��܂���B";
                                } else {
                                    //���i�R�[�h�̐ݒ�
                                    newRecord.setValue({fieldId: "itemid", value: categoryNumText + finalItemNum + dateCd});
                                }
                            } else {
                                //���i�R�[�h�̐ݒ�
                                newRecord.setValue({fieldId: "itemid", value: categoryNumText + num + dateCd});
                                newRecord.setValue({fieldId: "custitem_product_number", value: num});
                            }
                        }
                    }
                } else if (type == 'delete') {
                    //�����폜
                    let code = categoryNum + productNum + dateCd;
                    let itemSearchObj = search.create({
                        type: "item",
                        filters:
                            [
                                ["name", "contains", code],
                                "AND",
                                ["isinactive", "is", "F"],
                                "AND",
                                ["matrix", "is", "F"]
                            ],
                        columns: []
                    });
                    let searchResultCount = itemSearchObj.runPaged().count;
                    //.�Y�����i�̗ޔԁA�i�ԁA���i�o�^�����A�C�e���̑��݃`�F�b�N���s��
                    if (searchResultCount >= 1) {
                        throw '�Y�����i�̎q�A�C�e�������݂��邽�߁A�폜�s�B'
                    }
                } else if (type == 'edit') {
                    let isinactive = newRecord.getValue({fieldId: "isinactive"});
                    if (!isinactive) {
                        return;
                    }
                    //���i������
                    let code = categoryNum + productNum + dateCd;
                    let itemSearchObj = search.create({
                        type: "item",
                        filters:
                            [
                                ["name", "contains", code],
                                "AND",
                                ["isinactive", "is", "F"],
                                "AND",
                                ["matrix", "is", "F"]
                            ],
                        columns: []
                    });
                    let searchResultCount = itemSearchObj.runPaged().count;
                    //.�Y�����i�̗ޔԁA�i�ԁA���i�o�^�����A�C�e���̑��݃`�F�b�N���s��
                    if (searchResultCount >= 1) {
                        throw '�Y�����i�̎q�A�C�e�������݂��邽�߁A�폜�s�B'
                    }
                }
            } else {
                if (type == "create") {
                    //���݃`�F�b�N���s��
                    let code = categoryNumText + productNum + dateCd;
                    let parentId = "";
                    let itemSearch = search.create({
                        type: "item",
                        filters:
                            [
                                ["name", "contains", code],
                                "AND",
                                ["isinactive", "is", "F"],
                                "AND",
                                ["matrix", "is", "T"]
                            ],
                        columns: []
                    });
                    let searchCount = itemSearch.runPaged().count;
                    //���͂��ꂽ�ޔԁA�i�ԁA���i�o�^�����}�g���N�X�A�C�e���ɑ��݂��Ȃ��ꍇ�̓G���[���b�Z�[�W��\��
                    if (searchCount == 0) {
                        throw '�Y�����i���}�g���N�X�A�C�e���ɑ��݂��܂���B'
                    }
                    itemSearch.run().each(function (res) {
                        parentId = res.id;
                    })
                    code = code + 0 + color + 0 + size;
                    let itemSearchObj = search.create({
                        type: "item",
                        filters:
                            [
                                ["name", "is", code],
                                "AND",
                                ["isinactive", "is", "F"],
                                "AND",
                                ["matrix", "is", "F"]
                            ],
                        columns: []
                    });
                    let searchResultCount = itemSearchObj.runPaged().count;
                    //���͂��ꂽ�ޔԁA�i�ԁA���i�o�^���A�J���[�A�T�C�Y���݌ɃA�C�e���ɑ��݂���ꍇ�̓G���[���b�Z�[�W��\������
                    if (searchResultCount >= 1) {
                        throw '�Y���A�C�e�����݌ɃA�C�e���A�C�e���ɓo�^�ς݂ł��B'
                    }
                    // �e�A�C�e�� �̐ݒ�
                    newRecord.setValue({fieldId: "parent", value: parentId});
                    //�A�C�e���R�[�h�̐ݒ�
                    newRecord.setValue({fieldId: "itemid", value: code});
                }
            }
        }

        return {
            beforeSubmit:beforeSubmit
        }

    });
