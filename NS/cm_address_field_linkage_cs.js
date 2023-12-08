/**
 * �@�\: AdvPDF_�s�b�L���O���X�g�i�ړ��`�[�j
 * Author: �v����
 * Date : 2023/11/13
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],

    function (search) {
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
            // �ڋq�� �t�B�[���h�ύX�C�x���g
            if (fieldId == "custbody_customer_name"){
                let  customerId = currRec.getValue({fieldId:"custbody_customer_name"}); //�ڋq��
                let field = currRec.getField({fieldId:"custpage_ship_address_list"}); //�z����I��
                //��̃h���b�v�_�E���I��
                field.removeSelectOption({value: null});
                // �f�t�H���g�̋�
                field.insertSelectOption({value: "", text: ""});
                // �t�B�[���h�l��NULL�̐ݒ� �z���悲�Z��
                currRec.setValue({fieldId:"custbody_address",value:""});
                //�t�B�[���h����̏I���R�[�h�v���Z�X
                if (!customerId)  return;
                //�ڋq�Z���̎擾
                let customerSearchObj = search.create({
                    type: "customer",
                    filters: [["internalid","anyof",customerId]],
                    columns:
                        [
                            search.createColumn({name: "addressinternalid"}),
                            search.createColumn({name: "addresslabel"}),
                            search.createColumn({name: "address"})
                        ]
                });
                customerSearchObj.run().each(function(result){
                    field.insertSelectOption({
                        value: result.getValue('addressinternalid'),
                        text: result.getValue('addresslabel')
                    });
                    return true;
                });
            }
            // �z����I�� �t�B�[���h�ύX�C�x���g
            if (fieldId == "custpage_ship_address_list"){
                let  customerId = currRec.getValue({fieldId:"custbody_customer_name"});//�ڋq��
                let  addressId = currRec.getValue({fieldId:"custpage_ship_address_list"}); //�z����I��
                // �z����I�� �t�B�[���h����ł�
                if (!addressId) {
                    // �t�B�[���h�l��NULL�̐ݒ� �z���悲�Z��
                    currRec.setValue({fieldId:"custbody_address",value:""});
                    //�t�B�[���h����̏I���R�[�h�v���Z�X
                    return;
                }
                //�ڋq�Z���̎擾
                let customerSearchObj = search.create({
                    type: "customer",
                    filters: [["internalid","anyof",customerId]],
                    columns:
                        [
                            search.createColumn({name: "addressinternalid"}),
                            search.createColumn({name: "addresslabel"}),
                            search.createColumn({name: "address"})
                        ]
                });
                customerSearchObj.run().each(function(result){
                    if (result.getValue('addressinternalid') == addressId ){
                        currRec.setValue({fieldId:"custbody_address",value:result.getValue('address')})
                    }
                    return true;
                });
            }
        }

        return {
            fieldChanged: fieldChanged,
        };

    });
