/**
 *  �@�\: WMS_�݌ɘA�g_�v���O����
 *  Author: �v����
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
            //body JSON?��?��
            let dataJson = requestBody;
            log.audit("dataJson", dataJson);
            let res = {};
            let flag =true;
            if (flag){
                res = createRecord(dataJson, "inventoryadjustment");
            }else {
                res.success = false;
                res.error = "�s�\?��?��?!";
            }
            return JSON.stringify(res);
        }




        /**
         *
         * @param object {"body":{key:value,�c�c},"sub":[{"sublistId":[{key:value,�c�c},�c�c],�c�c}]}
         * @param type ?��?�^id
         * @returns {{}}
         */
        const createRecord = (obj, type) => {
            //���@��Q
            let res = {};
            //��?��?
            res.success = false;
            try {
                //?���\?
                let thisRecord = record.create({type: type, isDynamic: true});
                thisRecord.setValue({fieldId: "customform", value: "245"});//����?�\?
                thisRecord.setValue({fieldId: "subsidiary", value: "2"});//�q���i
                thisRecord.setValue({fieldId: "account", value: "4"});//?���Ȗ�
                thisRecord.setValue({fieldId: "custbody_etonet_linked_completed", value: true});//ETONET�A�g��
                thisRecord.setValue({fieldId: "custbody_wms_inventory_link_flg", value: true});// WMS�݌ɘA�g
                //?��?��?����
                var body = obj.body;
                //��???
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
                        res.error = 'message�M���s����!';
                        return res
                    }
                    let itemId = "";
                    itemSearchObj.run().each(function (res) {
                        itemId = res.id;
                    });
                    log.audit("itemId", itemId);
                    thisRecord.selectNewLine({sublistId: "inventory"});
                    //��??�s���i??
                    thisRecord.setCurrentSublistValue({sublistId: "inventory", fieldId: "item", value: itemId});
                    thisRecord.setCurrentSublistValue({sublistId: "inventory", fieldId: "location", value: 8});
                    thisRecord.setCurrentSublistValue({sublistId: "inventory", fieldId: "adjustqtyby", value: Number(itemMessage.adjustqtyby)});
                    //����s����
                    thisRecord.commitLine({sublistId: "inventory"});
                }
                //�ۑ�?������?��id
                let recordId = thisRecord.save({enableSourcing: true, ignoreMandatoryFields: true});
                res.success = true;
                res.recordId = recordId;
            } catch (e) {
                res.success = false;
                res.error = e.message;
            }
            //�ԉ�?��?��?��success = true?�����C���recordId�����Csuccess = false�ۑ���?�C���error??�M������
            return res;
        }

        return {
            post,
        }

    });
