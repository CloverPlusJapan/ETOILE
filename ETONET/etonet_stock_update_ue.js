/**
 * ETONET_�݌ɘA�g
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @Version 1.0
 * @CreatedBy Mariya Sawada
 * @CreatedDate 2023/10/30
 */

define([
    "../LIBRARY/constant_lib.js",
    "../LIBRARY/common_lib.js",
    "N/record",
    "N/search",
    'N/runtime',
    'N/file',
    'N/email',
    'N/https'
], function (
    constLib,
    common,
    record,
    search,
    runtime,
    file,
    email,
    https
) {
    /** �t�B�[���hID */
    const FIELD_ID = {
        /** ETONET������ */
        ETONET_ALLOCATION_ALLOWED: 'custrecord_etonet_allocation_allowed',
        /** ETONET�A�g�ς� */
        ETONET_LINKED_COMPLETED: 'custrecord_etonet_linked_completed',
        /** �ꏊ�𖳌��ɂ��� */
        IS_INACTIV: 'isinactive',
        /** �ړ��� */
        DESTINATION: 'location',
        /** �ړ��� */
        MOVINGSOURCE: 'location',
        /** �A�C�e�� */
        ITEM: 'item',
        /** �A�C�e���F�ꏊ */
        ITEM_LOCATION: 'location',
        /** �ޔ� */
        CATEGORY_NUMBER: 'custcol_category_number',
        /** �i�� */
        PRODUCT_NUMBER: 'custcol_product_number',
        /** �J���[ */
        COLOR: 'custcol_color',
        /** �T�C�Y */
        SIZE: 'custcol_size',
        /** �ޕi�ԓo�^�� */
        REGISTRATION_DATE: 'custcol_commodity_id_regist_date',
        /** ���� */
        QUANTITY: 'quantity',
        /** �������� */
        ADJUST_QUANTITY: 'adjustqtyby',
        /** WMS�݌ɘA�g */
        WMS_LINK_FLG: 'custbody_wms_inventory_link_flg',
        /** �X�e�[�^�X */
        STATUS: 'orderstatus',
    }

    /** �g�����U�N�V�����̎�� */
    const TRANSACTION = {
        /** ��̏� */
        ITEM_RECEIPT: "itemreceipt",
        /** �ړ��`�[ */
        INVENTORY_TRANSFER: "transferorder",
        /** �݌ɒ��� */
        INVENTORY_ADJUSTMENT: "inventoryadjustment"
    }

    /** �G���[CSV�ړ��� */
    const ERROR_FILE_NAME_PREFIX = "error_"

    /** �G���[CSV�w�b�_�[ */
    const ERROR_CSV_HEADER = ["��������", "�A�C�e��ID", "�݌ɐ�", "�݌ɕϓ���"]

    // TODO:�G���[���[���֌W�͋��ʊ֐�����v����
    /** API�ڑ��G���[���[����� */
    const CONNECT_ERROR_MAIL_INFO = {
        SUBJECT: "�yNetSuite�zETONET�݌ɘA�gAPI�ڑ��G���[",
        BODY: "ETONET�A�g�̍݌ɘA�g�����ɂāAAPI�ڑ��G���[���������܂����B"
    }

    /** ���̑��G���[���[����� */
    const ERROR_MAIL_INFO = {
        SUBJECT: "�yNetSuite�zETONET�݌ɘA�g�����G���[",
        BODY: "ETONET�A�g�̍݌ɘA�g�����ɂāA�A�C�e��ID:{itemId}��{errorInfo}���������܂����B\n�G���[�ڍׂ͓Y�t�t�@�C�������m�F���������B"
    }

    function beforeSubmit(context) {
        const currentRec = context.newRecord; // ���M���̃��R�[�h���擾

        // 1.�Ώۂ̏ꏊ�擾
        // �������쐬
        const searchLocationType = "location";
        const searchLocationFilters = [
            [FIELD_ID.ETONET_ALLOCATION_ALLOWED,"is","T"], // �uETONET�����t���O�v���I��
            "AND",
            [FIELD_ID.IS_INACTIV,"is","F"] //�u�ꏊ�𖳌��ɂ���v���I�t
        ];
        const searchLocationColumns = [];

        // �������ʂ��擾
        let locationSearchResultList = common.getSearchData(searchLocationType, searchLocationFilters, searchLocationColumns);
        log.debug("�Ώۏꏊ�ꗗ", locationSearchResultList)

        // 2.�Ώۂ̔���
        // �T�u���X�g�u�A�C�e���v�̍s���擾
        const inventoryLine = currentRec.getLineCount('inventory');
        // ���R�[�h�̎��
        const recType = currentRec.type;
        log.debug("���R�[�h�̎��", recType)

        let targetFlg = false;// �Ώ۔���p�t���O
        const invAdjItemList = [];// �݌ɒ����Ώۍs���i�[���X�g
        for (let locationResult of locationSearchResultList) {
            let location = locationResult.id;
            // 2-1.��̏�
            if (recType === TRANSACTION.ITEM_RECEIPT){
                const destination = currentRec.getValue(FIELD_ID.DESTINATION);
                // ���ځu�ړ���v���Ώۂ̏ꏊ�ł���ꍇ
                if (destination === location){
                    targetFlg = true;
                    break;
                }
            }
            // 2-2.�ړ��`�[
            if (recType === TRANSACTION.INVENTORY_TRANSFER){
                const status = currentRec.getValue(FIELD_ID.STATUS);
                log.debug("status",status)
                // �X�e�[�^�X���u���F�҂��v�̏ꍇ�A�������I��
                if (status === constLib.INV_TRAN_STATUS.PRE_APPROVE){
                    return;
                }
                const movingsource = currentRec.getValue(FIELD_ID.MOVINGSOURCE);
                log.debug("movingsource",movingsource)
                // ���ځu�ړ����v���Ώۂ̏ꏊ�ł���ꍇ
                if (movingsource === location){
                    log.debug("�t���O�ύXif�m�F",movingsource)
                    targetFlg = true;
                    break;
                }
            }
            // 2-3.�݌ɒ���
            if (recType === TRANSACTION.INVENTORY_ADJUSTMENT){
                const wmsFlg = currentRec.getValue(FIELD_ID.WMS_LINK_FLG);
                // ���ځuWMS�݌ɘA�g�v��true�̏ꍇ�A�������I��
                if (wmsFlg) {
                    return;
                }
                // ���ׂ̃��[�v
                for (let i = 0; i < inventoryLine; i++) {
                    let itemLocation = currentRec.getSublistValue({
                        sublistId: 'inventory',
                        line: i,
                        fieldId: FIELD_ID.ITEM_LOCATION
                    });
                    // ���ځu�A�C�e���F�ꏊ�v���Ώۂ̏ꏊ�ł���ꍇ
                    if (itemLocation === location){
                        targetFlg = true;
                        const invAdjDataOnj = {};
                        // ���ʂ��擾
                        invAdjDataOnj.quantityDiff = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.ADJUST_QUANTITY
                        });
                        log.debug("invAdjDataOnj.quantityDiff",invAdjDataOnj.quantityDiff)

                        // �ޔԂ��擾
                        const categoryNumber = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.CATEGORY_NUMBER
                        });
                        // �i�Ԃ��擾
                        const productNumber = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.PRODUCT_NUMBER
                        });
                        // �J���[���擾
                        const color = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.COLOR
                        });
                        // �T�C�Y���擾
                        const size = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.SIZE
                        });
                        // �ޕi�ԓo�^�����擾
                        let registrationDate = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.REGISTRATION_DATE
                        });
                        // TODO:�ޕi�ԓo�^���̕ϊ��ɖ��Ȃ����v�����ˍ��ڂ��Ȃ����ߌ��݊m�F�s��
                        log.debug("registrationDate",registrationDate)
                        registrationDate = common.setDateToString(registrationDate, 'yyyyMMdd');
                        
                        // �A�C�e�����擾
                        invAdjDataOnj.item = categoryNumber + productNumber + color + size + registrationDate;

                        invAdjItemList.push(invAdjDataOnj)
                    }
                }
            }
        }

        // �݌ɒ����Ώۍs���i�[���X�g�Ƀf�[�^��1���ȏ゠�鎞�A�Ώۃt���Otrue
        if (invAdjItemList.length > 0) {
            targetFlg = true;
        }
        log.debug("�Ώۃt���O", targetFlg)

        // �Ώۂ̏ꏊ�ł͂Ȃ��ꍇ�A�������I��
        if (!targetFlg) {
            return;
        }

        // 3.��ʂ̔���
        const targetDataList = [];
        // 3-1.�V�K�쐬�̏ꍇ
        if (recType === TRANSACTION.INVENTORY_ADJUSTMENT) {
            // �݌ɒ����̏ꍇ
            for (let invAdjItem of invAdjItemList) {
                targetDataList.push(invAdjItem);
            }
        }else{
            // ���ׂ̍s�����擾
            const detailLineCount = currentRec.getLineCount({
                sublistId: 'item'
            });
            // �A�C�e���Ɛ��ʂ��擾���A�Ώۃ��X�g�Ɋi�[
            for (let detailLine = 0; detailLine < detailLineCount; detailLine++){
                const targetData = {};
                // ���ʂ��擾
                const currentQuantity = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: detailLine,
                    fieldId: FIELD_ID.QUANTITY
                });
                if (recType === TRANSACTION.INVENTORY_TRANSFER) {
                    targetData.quantityDiff = -currentQuantity;
                }else{
                    targetData.quantityDiff = currentQuantity;
                }
                log.debug("targetData.quantityDiff",targetData.quantityDiff)

                // �ޔԂ��擾
                const categoryNumber = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.CATEGORY_NUMBER
                });
                // �i�Ԃ��擾
                const productNumber = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.PRODUCT_NUMBER
                });
                // �J���[���擾
                const color = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.COLOR
                });
                // �T�C�Y���擾
                const size = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.SIZE
                });
                // �ޕi�ԓo�^�����擾
                let registrationDate = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.REGISTRATION_DATE
                });
                // TODO:�����ڎ��̂��`�[�ɂȂ����߁A���݊m�F�s��
                log.debug("registrationDate",registrationDate)
                registrationDate = common.setDateToString(registrationDate, 'yyyyMMdd');
                
                // �A�C�e�����擾
                targetData.item = categoryNumber + productNumber + color + size + registrationDate;

                targetDataList.push(targetData);
            }
        }
        log.debug("�Ώۃf�[�^���X�g", targetDataList)
        // 4.�݌ɏ��̍��Z
        // ���Z��f�[�^�i�[�p���X�g
        const totalDataList = [];
        // �i�[�ς݃A�C�e�����X�g
        const storedItemList = [];

        for (let targetData of targetDataList) {
            // 4-1.�i�[�ς݃��X�g���Ɉ�v����u�A�C�e���v�����݂��Ȃ��ꍇ
            if (storedItemList.indexOf(targetData.item) <0) {
                totalDataList.push(targetData);
                storedItemList.push(targetData.item);
            }else{
                // 4-2.��L�ȊO�̏ꍇ�A��v����A�C�e���́u���ʁv�Ɏ擾�����u���ʁv�𑫂�
                storedItemList.forEach(item => {
                    if (item.item === targetData.item) {
                        item.quantityDiff += targetData.quantityDiff;
                    }
                })
            }
        }
        log.debug("���Z�ς݃��X�g", totalDataList)
        // 5.���N�G�X�g�{�f�B�쐬
        // 5-1.�F�؏��̎擾
        //const authentication = common.getAPIInfo(constLib.API_KBN['�݌ɘA�g']));// TODO:�擾���f�[�^������R�����g�A�E�g����
        const authentication = {
            user_id: "core_system001",
            request_datetime: "20231101235959001",
            token: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        }// TODO:���ʊ֐�������폜

        log.debug("�F�؏��", authentication)

        // 5-2.�݌ɏ��̎擾
        const inventoryDataList = [];

        for (let totalData of totalDataList) {
            const inventoryDataObj = {};
            inventoryDataObj.key = totalData.item + '01';
            inventoryDataObj.quantityDiff = totalData.quantityDiff;

            inventoryDataList.push(inventoryDataObj)
        }
        log.debug("�݌ɏ��", inventoryDataList);

        const requestBody = JSON.stringify({
            authentication: authentication,
            stocks: inventoryDataList,
        });
        log.debug("���N�G�X�g�{�f�B", requestBody);
        
        // TODO:����m�F�p��return
        return;

        // 6.ETONET�̍݌ɘA�gAPI�Ăяo��
        // �݌ɘA�g�w�b�_�[
        const stockUpdateHeader = {
        'Content-Type': 'application/json'
        }

        //����3�Ŏ擾�����f�[�^�����N�G�X�g�{�f�B�Ɋi�[���AETONET�̍݌ɘA�gAPI���Ăяo��
        const requestParams = {
            url: 'https://stg-etonet-admin.ek-enet-dev.com/api/v1/stocks/put-all',
            headers: stockUpdateHeader,
            body: JSON.stringify({
                authentication: authentication,// �F�؏��
                stocks: inventoryDataList,// �݌ɏ��
            })
        };

        //���N�G�X�g���M
        const response = https.post(requestParams);

        log.debug("response", response)

        // 6-1.�G���[����
        const httpStatus = response.code;
        if (httpStatus != constLib.HTTP_STATUS.SUCCESS) {
            let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
            let mailSubject = CONNECT_ERROR_MAIL_INFO.SUBJECT
            let mailBody = CONNECT_ERROR_MAIL_INFO.BODY

            // �G���[���[���𑗐M
            email.send({
                author: sendTo,
                subject: mailSubject,
                body: mailBody,
                recipients: sendTo,
                attachments: existError ? [errorFile] : null
            });
            return;
        }

        // 7.�f�[�^�ۑ�����
        //���^�[���R�[�h���擾����
        const returnCd = response.body.result.return_code;

        log.debug("���^�[���R�[�h", returnCd)

        if (httpStatus === constLib.HTTP_STATUS.SUCCESS && returnCd === '00'){
            // TODO:�A�g�ς݃t���O�͂Ȃ��Ȃ������ߕs�v�ŁA�ۑ������̂݁H
            // �����̏ꍇ�A�A�g�ς݃t���O��true�ɍX�V���f�[�^�ۑ�������
            currentRec.setVAlue({
                fieldId: FIELD_ID.ETONET_LINKED_COMPLETED,
                value: true
            });
            currentRec.save();
        }else{
            // ���s�̏ꍇ�A�f�[�^�ۑ��𒆎~
            return;
        }

        // 8.�G���[�t�@�C���̍쐬
        // ���ݎ������擾
        const date = new Date();
        let trandate = new Date(date.setTime(date.getTime() + 1000 * 60 * 60 * 9));
        // �^�C���X�^���v���쐬(YYYYMMDDHHMISS)
        let timestamp = trandate.getFullYear() +
            ('0' + (trandate.getMonth() + 1)).slice(-2) +
            ('0' + trandate.getDate()).slice(-2) +
            ('0' + trandate.getHours()).slice(-2) +
            ('0' + trandate.getMinutes()).slice(-2) +
            ('0' + trandate.getSeconds()).slice(-2);

        let errorFile = file.create({
            name: ERROR_FILE_NAME_PREFIX + timestamp + ".csv",
            folder: constLib.CABINET.FOLDER.ETONET_ERROR_INFO_CSV,
            fileType: file.Type.CSV
        })

        // �w�b�_��񏑍�
        let errorCsvHeader = ERROR_CSV_HEADER.join(",") 
        errorFile.appendLine({ value: errorCsvHeader });

        // 8-1.�G���[���̏�������
        let existError = false;
        let mailErrorItemId = "";
        let mailErrorInfo = "";
        if (returnCd != '00' && returnCd != null){
            let tranErrorInfo = constLib.ERROR_CODE_LIST[returnCd];
            let tranResultList = JSON.parse(response.body.stocks);
            for (let i in tranResultList) {
                existError = true;
                let errorInfos = [];
                let errorItem = tranResultList[i][key].substr(0,tranResultList[i][key].length-2);
                errorInfos.push(tranErrorInfo)// ��������
                errorInfos.push(errorItem)// �A�C�e��ID
                errorInfos.push(tranResultList[i][quantity])// �݌ɐ�
                errorInfos.push(tranResultList[i][quantityDiff])// �݌ɕϓ���
                errorFile.appendLine({ value: errorInfos.join(",") });
                mailErrorItemId = errorItem;
                mailErrorInfo = tranErrorInfo;
            }
        }else if(returnCd === null){
            let tranResultList = JSON.parse(response.body.stocks);
            for (let i in tranResultList) {
                existError = true;
                let errorInfos = [];
                let errorItem = tranResultList[i][key].substr(0,tranResultList[i][key].length-2);
                errorInfos.push('���X�|���X�G���[')// ��������
                errorInfos.push(tranResultList[i][key].substr(0,tranResultList[i][key].length-2))// �A�C�e��ID
                errorInfos.push("")// �݌ɐ�
                errorInfos.push("")// �݌ɕϓ���
                errorFile.appendLine({ value: errorInfos.join(",") });
                mailErrorItemId = errorItem;
                mailErrorInfo = tranErrorInfo;
            }
        }
        let errFileId = null;
        // 8-2.�G���[�t�@�C���ۑ�
        if (existError) {
            errFileId = errorFile.save();
            mailSubject = ERROR_MAIL_INFO.SUBJECT
            mailBody = ERROR_MAIL_INFO.BODY
        }

        // 9.�݌ɘA�g���ʃ��[�����M
        // TODO:�G���[���[���֌W�͋��ʊ֐��ŏ���
        // ���[�����M��̃A�h���X�擾
        let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
        let mailSubject = ERROR_MAIL_INFO.SUBJECT
        let mailBody = ERROR_MAIL_INFO.BODY.replace("{itemID}", mailErrorItemId).replace("{errorInfo}", mailErrorInfo);

        // �G���[���[���𑗐M
        email.send({
            author: sendTo,
            subject: mailSubject,
            body: mailBody,
            recipients: sendTo,
            attachments: existError ? [errorFile] : null
        });
        
    }
    return {
        beforeSubmit: beforeSubmit
    }
});