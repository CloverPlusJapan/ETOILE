/**
 *  機能: CM_アイテムID自動採番
 *  Author: 宋金来
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
            //create状態ではない
            if (mode != "create") {
                nlapiDisableField('custitem_category_number', 'T');//類番 灰を置く
                nlapiDisableField('custitem_product_number', 'T');//品番 灰を置く
                nlapiDisableField('custitem_product_registration_date', 'T');//商品登録日 灰を置く
                nlapiDisableField('itemid', 'T');
            } else {
                curRec.setValue({fieldId: "itemid", value: "***********"})
                let date = paramsDate(curRec.getValue({fieldId: "custitem_product_registration_date"}));// 商品登録日
                //日付五桁設定
                curRec.setValue({fieldId: "custitem_product_login_date_cd", value: date});//商品登録日コード
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
            // フィールド 類番 変更
            if (fieldId == 'custitem_category_number') {
                let categoryNum = currRec.getText({fieldId: "custitem_category_number"});// 類番
                if (!categoryNum) {
                    let itemName = currRec.getValue({fieldId: "itemid"});
                    currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,0,"***",3)})
                    return;
                } //空白 return
                // let containsLatinChars = !latinRegex.test(categoryNum);
                // //正規表現を満たさないエラーメッセージプロンプト
                // if (containsLatinChars) {
                //     alert('無効な値で、' + categoryNum + '    整数値のみを含むことができます。')
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
            // フィールド 品番 変更
            if (fieldId == "custitem_product_number") {
                let product_number = currRec.getValue({fieldId: "custitem_product_number"});//品番
                if (!product_number) {
                    let itemName = currRec.getValue({fieldId: "itemid"});
                    currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,3,"***",6)})
                    return;//空白 return
                }
                let containsLatinChars = !latinRegex.test(product_number);
                //正規表現を満たさないエラーメッセージプロンプト
                if (containsLatinChars) {
                    alert('無効な値で、' + product_number + '    整数値のみを含むことができます。')
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
            // フィールド 商品登録日 変更
            if (fieldId == 'custitem_product_registration_date') {
                let date = paramsDate(currRec.getValue({fieldId: "custitem_product_registration_date"}));// 商品登録日
                if (!date){
                    let itemName = currRec.getValue({fieldId: "itemid"});
                    currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,6,"*****",11)});
                    currRec.setValue({fieldId: "custitem_product_login_date_cd", value: date});//商品登録日コード
                    return;//空白 return
                }
                let itemName = currRec.getValue({fieldId: "itemid"});
                currRec.setValue({fieldId: "itemid", value:  stringReplacement(itemName,6,date,11)});
                //日付五桁設定
                currRec.setValue({fieldId: "custitem_product_login_date_cd", value: date});//商品登録日コード
            }
        }


        /**
         * 解析日オブジェクト
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
         * 指定文字置換
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
