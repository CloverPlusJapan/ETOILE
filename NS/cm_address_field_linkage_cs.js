/**
 * 機能: AdvPDF_ピッキングリスト（移動伝票）
 * Author: 宋金来
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
            // 顧客名 フィールド変更イベント
            if (fieldId == "custbody_customer_name"){
                let  customerId = currRec.getValue({fieldId:"custbody_customer_name"}); //顧客名
                let field = currRec.getField({fieldId:"custpage_ship_address_list"}); //配送先選択
                //空のドロップダウン選択
                field.removeSelectOption({value: null});
                // デフォルトの空
                field.insertSelectOption({value: "", text: ""});
                // フィールド値のNULLの設定 配送先ご住所
                currRec.setValue({fieldId:"custbody_address",value:""});
                //フィールドが空の終了コードプロセス
                if (!customerId)  return;
                //顧客住所の取得
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
            // 配送先選択 フィールド変更イベント
            if (fieldId == "custpage_ship_address_list"){
                let  customerId = currRec.getValue({fieldId:"custbody_customer_name"});//顧客名
                let  addressId = currRec.getValue({fieldId:"custpage_ship_address_list"}); //配送先選択
                // 配送先選択 フィールドが空です
                if (!addressId) {
                    // フィールド値のNULLの設定 配送先ご住所
                    currRec.setValue({fieldId:"custbody_address",value:""});
                    //フィールドが空の終了コードプロセス
                    return;
                }
                //顧客住所の取得
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
