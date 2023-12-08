/**
 *  機能: WMS_在庫連携_プログラム
 *  Author: 宋金来
 *  Date : 2023/11/29
 *
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/https', 'N/record', 'N/runtime', 'N/search'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{runtime} runtime
     */
    (https, record, runtime,search) => {

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {
            //body JSON?成?象
            let dataJson = requestBody;
            log.audit("dataJson", dataJson);
            let res = {};
            let flag =true;
            if (flag){
                res = createRecord(dataJson, "inventoryadjustment");
            }else {
                res.success = false;
                res.error = "不能?建?整?!";
            }
            return JSON.stringify(res);
        }




        /**
         *
         * @param object {"body":{key:value,……},"sub":[{"sublistId":[{key:value,……},……],……}]}
         * @param type ?据?型id
         * @returns {{}}
         */
        const createRecord = (obj, type) => {
            //方法回参
            let res = {};
            //默?失?
            res.success = false;
            try {
                //?建表?
                let thisRecord = record.create({type: type, isDynamic: true});
                thisRecord.setValue({fieldId: "customform", value: "245"});//自定?表?
                thisRecord.setValue({fieldId: "subsidiary", value: "2"});//子公司
                thisRecord.setValue({fieldId: "account", value: "4"});//?整科目
                thisRecord.setValue({fieldId: "custbody_etonet_linked_completed", value: true});//ETONET連携済
                thisRecord.setValue({fieldId: "custbody_wms_inventory_link_flg", value: true});// WMS在庫連携
                //?取?据?数据
                var body = obj.body;
                //遍???
                for (let key in body) {
                    thisRecord.setValue({fieldId: key, value: body[key]});
                }
                let subArr = obj.sub;
                for (let item = 0; item < subArr.length; item++) {
                    let itemMessage = subArr[item];
                    let code =  itemMessage.product_number+ itemMessage.category_number+itemMessage.product_registration_date+ itemMessage.color+ itemMessage.size;
                    log.audit("code",code );

                    // let itemSearchObj = search.create({
                    //     type: "item",
                    //     filters:
                    //         [
                    //             ["custitem_category_number", "anyof", itemMessage.product_number],
                    //             "AND",
                    //             ["custitem_product_number", "is", itemMessage.category_number],
                    //             "AND",
                    //             ["custitem_product_registration_date", "on", itemMessage.product_registration_date],
                    //             "AND",
                    //             ["custitem_color_matrix", "anyof", itemMessage.color],
                    //             "AND",
                    //             ["custitem_size_matrix", "anyof", itemMessage.size]
                    //         ],
                    //     columns: []
                    // });

                    var itemSearchObj = search.create({
                        type: "item",
                        filters: [["name","is",code]],
                        columns: []
                    });
                    let count = itemSearchObj.runPaged().count;
                    log.audit("count", count);
                    if (count == 0) {
                        res.success = false;
                        res.error = 'message信息不符合!';
                        return res
                    }
                    let itemId = "";
                    itemSearchObj.run().each(function (res) {
                        itemId = res.id;
                    });
                    log.audit("itemId", itemId);
                    thisRecord.selectNewLine({sublistId: "inventory"});
                    //遍??行字段??
                    thisRecord.setCurrentSublistValue({sublistId: "inventory", fieldId: "item", value: itemId});
                    thisRecord.setCurrentSublistValue({sublistId: "inventory", fieldId: "location", value: 8});
                    thisRecord.setCurrentSublistValue({sublistId: "inventory", fieldId: "adjustqtyby", value: Number(itemMessage.adjustqtyby)});
                    //提交行数据
                    thisRecord.commitLine({sublistId: "inventory"});
                }
                //保存?据得到?据id
                let recordId = thisRecord.save({enableSourcing: true, ignoreMandatoryFields: true});
                res.success = true;
                res.recordId = recordId;
            } catch (e) {
                res.success = false;
                res.error = e.message;
            }
            //返回?建?据?果success = true?成功，包含recordId属性，success = false保存失?，包含error??信息属性
            return res;
        }

        return {
            post,
        }

    });
