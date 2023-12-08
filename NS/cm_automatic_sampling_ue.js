/**
 * 機能: CM_アイテムID自動採番
 *  Author: 宋金来
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
            let categoryNum = newRecord.getValue({fieldId: "custitem_category_number"});//類番
            let categoryNumText ="";
            if (!utils.isEmpty(categoryNum)){
            let  categoryNumObj = search.lookupFields({type:"customrecord_like_number",id:categoryNum,columns:['name']});
                 categoryNumText = categoryNumObj['name'];
            }
             log.audit("categoryNumText", categoryNumText);
            let productNum = newRecord.getValue({fieldId: "custitem_product_number"});//品番
            let dateCd = newRecord.getValue({fieldId: "custitem_product_login_date_cd"});//商品登録日コード
            let color = newRecord.getValue({fieldId: "custitem_color_matrix"});//カラー
            let size = newRecord.getValue({fieldId: "custitem_size_matrix"});//サイズ
            let matrixp = newRecord.getValue({fieldId: "entryformquerystring"});
            //マトリックス品目の場合
            if (matrixp.indexOf('matrixp') >= 1) {
                if (type == "create") {
                    // 類番 品番 存在チェックを行う
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
                            throw '入力された類番と品番が存在しています。'
                        }
                    }
                    // 品番が入力されていない場合は採番する
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
                        //入力された類番がマトリクス・アイテムに存在しない場合は、品番に「001」を設定する。
                        if (searchResultCount == 0) {
                            num = "001";
                        } else {
                            //入力された類番がマトリクス・アイテムに存在する場合は、最大の有効な品番＋１で設定する。
                            inventoryitemSearchObj.run().each(function (res) {
                                num = Number(res.getValue({name: "custitem_product_number", summary: "MAX"})) + 1 + "";
                            })
                            if (num.length == 1) {
                                num = "0" + "0" + num;
                            }
                            if (num.length == 2) {
                                num = "0" + num;
                            }
                            //最大の品番が996の場合は001から空き番を探して、空き番がある場合は品番に設定する。
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
                                    //現在の記録品番が前の記録の品番より1より大きい場合
                                    if (startNum - endNum > 1) {
                                        finalItemNum = endNum + 1 + "";
                                        if (finalItemNum.length == 1) finalItemNum = "0" + "0" + finalItemNum;
                                        if (finalItemNum.length == 2) finalItemNum = "0" + finalItemNum;
                                        break;
                                    }
                                }
                                if (utils.isEmpty(finalItemNum)) {
                                    throw "該当類番の空き品番がありませんので、採番できません。";
                                } else {
                                    //商品コードの設定
                                    newRecord.setValue({fieldId: "itemid", value: categoryNumText + finalItemNum + dateCd});
                                }
                            } else {
                                //商品コードの設定
                                newRecord.setValue({fieldId: "itemid", value: categoryNumText + num + dateCd});
                                newRecord.setValue({fieldId: "custitem_product_number", value: num});
                            }
                        }
                    }
                } else if (type == 'delete') {
                    //物理削除
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
                    //.該当商品の類番、品番、商品登録日よりアイテムの存在チェックを行う
                    if (searchResultCount >= 1) {
                        throw '該当商品の子アイテムが存在するため、削除不可。'
                    }
                } else if (type == 'edit') {
                    let isinactive = newRecord.getValue({fieldId: "isinactive"});
                    if (!isinactive) {
                        return;
                    }
                    //商品無効化
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
                    //.該当商品の類番、品番、商品登録日よりアイテムの存在チェックを行う
                    if (searchResultCount >= 1) {
                        throw '該当商品の子アイテムが存在するため、削除不可。'
                    }
                }
            } else {
                if (type == "create") {
                    //存在チェックを行う
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
                    //入力された類番、品番、商品登録日がマトリクスアイテムに存在しない場合はエラーメッセージを表示
                    if (searchCount == 0) {
                        throw '該当商品がマトリクスアイテムに存在しません。'
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
                    //入力された類番、品番、商品登録日、カラー、サイズが在庫アイテムに存在する場合はエラーメッセージを表示する
                    if (searchResultCount >= 1) {
                        throw '該当アイテムが在庫アイテムアイテムに登録済みです。'
                    }
                    // 親アイテム の設定
                    newRecord.setValue({fieldId: "parent", value: parentId});
                    //アイテムコードの設定
                    newRecord.setValue({fieldId: "itemid", value: code});
                }
            }
        }

        return {
            beforeSubmit:beforeSubmit
        }

    });
