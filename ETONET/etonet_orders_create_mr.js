/**
 * ETONET_�󒍘A�g
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @Version 1.0
 * @CreatedBy Mariya Sawada
 * @CreatedDate 2023/11/06
 */

define([
    "../LIBRARY/constant_lib.js",
    "../LIBRARY/common_lib.js",
    "./etonet_lib.js",
    "N/record",
    "N/search",
    "N/task",
    "N/file",
    "N/format"
], function (
    constLib,
    common,
    etonetLib,
    record,
    search,
    task,
    file,
    format
) {
    /** �t�B�[���hID */
    const FIELD_ID = {
        /** �A�C�e���F(Filter�p) */
        ITEM_FEILD: 'item.',
        /** ����ID */
        INTERNAL_ID: 'internalid',
        /** �A�C�e�� */
        ITEM: 'item',
        /** �A�C�e���F�ꏊ */
        ITEM_LOCATION: 'location',
        /** ���� */
        QUANTITY: 'quantity',
        /** �ޔ� */
        CATEGORY_NUMBER: 'custitem_category_number',
        /** �i�� */
        PRODUCT_NUMBER: 'custitem_product_number',
        /** �J���[ */
        COLOR: 'custitem_color',
        /** �T�C�Y */
        SIZE: 'custitem_size',
        /** �ޕi�ԓo�^�� */
        REGISTRATION_DATE: 'custitem_product_registration_date',
        /** ���b�g�ԍ��t���A�C�e�� */
        LOT_NUMBER_ITEM: 'islotitem',
        /** �ꏊ */
        LOCATION: 'location',
        /** ���� */
        DEPARTMENT: 'department',
        /** ETONET������ */
        ETONET_ALLOCATION_ALLOWED: 'custrecord_etonet_allocation_allowed',
        /** �����i�ꏊ�𖳌��ɂ���j */
        IS_INACTIV: 'isinactive',
        /** �L������ */
        EFFECTIVE_DATE: 'expirationdate',
        /** �A�C�e���F��� */
        ITEM_TYPE: 'type',
        /** �A�C�e���F�V���A��/���b�g�ԍ� */
        ITEM_SERIAL_LOT_NO: 'serialnumber',
        /** ETONET�ԍ� */
        ETONET_NO: 'custbody_etonet_so_number',
        /** �O��ID */
        EXTERNAL_ID: 'externalid',
        /** �A�C�e���F�ŋ��R�[�h */
        TAX_CD: 'taxcode',
        /** �A�C�e���F���i���� */
        PRICE: 'price',
        /** �A�C�e���F���z */
        AMOUNT: 'amount',
        // TODO:����́udept�v�udepartment�v�������݂�����̂��v�m�F
        /** �A�C�e���F���� */
        DEPT: 'dept', 
        /** ETONET�`�[��� */
        TRAN_TYPE: 'custbody_etonet_tran_type',
        /** �A�C�e��ID */
        ITEM_ID: 'itemid',
    }

    /** �f�B�X�J�E���g�p�A�C�e�� */
    // TODO:NS�ɓo�^���ꎟ��ǋL
    const DISCOUNT_ITEM = {
        /** ���q�l���i�ύX */
        COSTOMER_PRICE: '',
        /** �Z�[���l�� */
        SALE_DISCOUNT: '649',
        /** ���i�ύX */
        PRICE_CHANGE: '',
        /** �N�[�|���l�� */
        COUPON_DISCOUNT: '',
        /** �����T�[�r�X */
        POSTAGE_SERVICE: '666',
        /** ����萔���T�[�r�X */
        COD_CHARGE_SERVICE: '',
    }

    /** �z���֘A�A�C�e�� */
    // TODO:NS�ɓo�^���ꎟ��ǋL
    const DELIVERY_ITEM = {
        /** ���� */
        POSTAGE: '645',
        /** ����萔�� */
        COD_CHARGE: '',
    }

    /** ���� */
    const DEPT = {
        /** �c�Ɩ{�� */
        SALES_DIVISION: '3',
        /** ���W�X�e�B�N�X�� */
        LOGISTICS: '23',
    }

    /** �ŋ��R�[�h */
    const TAX_CD = {
        /** �y���ŗ�8�� */
        EIGHT_PER: '11',
        /** 10% */
        TEN_PER: '10',
        /** ��ې� */
        NO_TAX: '9',
    }

    /** �K�p����ŃR�[�h */
    const APPLY_TAX_CD = {
        /** �y���ŗ�8�� */
        EIGHT_PER: '02',
        /** 10% */
        TEN_PER: '03',
        /** ��ې� */
        NO_TAX: '05',
    }

    /** �f�[�^�敪 */
    const DATA_PARTITION = {
        /** �w�b�_�[ */
        HEADER: '1',
        /** ���� */
        DETAIL: '2',
        /** ���[������ */
        MAIL: '3',
        /** ����Ŗ��� */
        TAX: '4',
    }

    /** ETONET�`�[��� */
    const SALES_TYPE = {
        ORDER: '1' // ��
    }

    /** �������� */
    const ERROR_RESULT = {
        /** ���� */
        SUCCESS: '����',
        /** �ڋq�}�X�^�G���[ */
        CUSTOMER_MASTER_ERROR: '�ڋq�}�X�^���݃`�F�b�N�G���[',
        /** �A�C�e���}�X�^�G���[ */
        ITEM_MASTER_ERROR: '�A�C�e���}�X�^���݃`�F�b�N�G���[',
        /** �ꏊ�}�X�^�G���[ */
        LOCATION_MASTER_ERROR: '�ꏊ�}�X�^���݃`�F�b�N�G���[',
        /** �݌ɏڍ׃}�X�^�G���[ */
        INVENTORY_DETAIL_MASTER_ERROR: '�݌ɏڍ׃}�X�^���݃`�F�b�N�G���[',
        /** �ŋ��R�[�h�}�X�^�G���[ */
        TAX_CD_MASTER_ERROR: '�ŋ��R�[�h���݃`�F�b�N�G���[',
        /** �]�ƈ��}�X�^�G���[ */
        EMPLOYEE_MASTER_ERROR: '�]�ƈ����݃`�F�b�N�G���[',
        /** ���������݃G���[ */
        SALES_ORDER_EXIST_ERROR: '���������݃`�F�b�N�G���[',
        /** �w�b�_�L���`�F�b�N�G���[ */
        HEADER_EXIST_ERROR: '�w�b�_�L���`�F�b�N�G���[',
        /** ���חL���`�F�b�N�G���[ */
        DETAIL_EXIST_ERROR: '���חL���`�F�b�N�G���[',
        /** ���[�����חL���`�F�b�N�G���[ */
        MAIL_EXIST_ERROR: '���[�����חL���`�F�b�N�G���[',
        /** ����Ŗ��חL���`�F�b�N�G���[ */
        TAX_EXIST_ERROR: '����Ŗ��חL���`�F�b�N�G���[',
        /** ���v�z�s��v�G���[ */
        SUBTOTAL_ERROR: '���v�z�s��v�G���[',
        /** �ŋ����v�s��v�G���[ */
        CONSUMPTION_TAX_ERROR: '�ŋ����v�s��v�G���[',
    }

    /** �G���[CSV�w�b�_�[ */
    const ERROR_CSV_HEADER = ["��������", "�G���[����", "��No.", "CSV"]

    /** ���b�Z�[�WID */
    const MESSAGE_ID = {
        ORDERS_CREATE_MR: 'ETONET_OEDERS_CREATE_MR_ERROR'
    }

    function getInputData() {
        log.debug("getInputData�J�n")
        try {
            let result = [];// �߂�l
            // 1.CSV�t�@�C���̃_�E�����[�h
            // 1-1.CSV�t�@�C���̃_�E�����[�h
            // common.executeTrusted(constLib.COOPRATION_CATEGORY.ETONET_ORDER); // TODO:�����͉��@NS��̖������t�H���_�Ɋi�[
            // 1-2.�Ώۂ�CSV�t�@�C���̑��݃`�F�b�N
            // �������t�H���_���w�肷��
            const untreatedFolderId = etonetLib.FOLDER.UNTREATED.ORDER;

            // �t�H���_���̃t�@�C��������
            const targetFileSearchType = search.Type.FOLDER;
            const targetFileSearchFilters = [
                search.createFilter({ name: FIELD_ID.INTERNAL_ID, operator: search.Operator.IS, values: untreatedFolderId})
            ];
            const targetFileSearchColums = [
                search.createColumn({ name: 'internalid', join: 'file' })// �t�@�C���F����ID
            ];
            const targetFileSearch = common.getSearchData(targetFileSearchType, targetFileSearchFilters, targetFileSearchColums);
            
            const fileObjList = [];
            // �t�H���_���̃t�@�C�����擾
            for (let targetFile of targetFileSearch) {
                let fileId = targetFile.getValue({ name: 'internalid', join: 'file' });
                log.debug("fileId",fileId)
                // �t�@�C�������[�h����
                let fileObj = file.load(fileId);
                log.debug("fileObj",fileObj)
                fileObjList.push(fileObj);
            }


            // 2.ETONET����CSV�t�@�C���ړ�
            // TODO:���ʊ֐��쐬�҂���common.executeTrusted()���ŏ���

            // 3.�t�@�C�����̎擾
            let orderNumberList = [];// ETONET�ԍ����X�g
            for (let fileObj of fileObjList) {
                // �t�@�C�������擾
                const fileContent = fileObj.getContents();
                log.debug("fileContent",fileContent)

                // ���s�ŕ���
                // const csvRows = fileContent.split('\n');
                //��
                const csvRows = common.getCSVData(fileContent);
                log.debug("csvRows",csvRows)
                // �u�f�[�^�敪�v�̗�C���f�b�N�X���擾
                const dataPartitionIndex = etonetLib.HEADER_INDEX.DATA_PARTITION;
                // �uETONET�ԍ��v�̗�C���f�b�N�X���擾
                const etonetNoIndex = etonetLib.HEADER_INDEX.ETONET_NUMBER;
                // �f�[�^�s�̏����i1�s�ڂƍŏI�s�́uST�v�ƁuEND�v����������Ă��Ȃ����ߑΏۊO�j
                for (let rowNumber = 1; rowNumber < (csvRows.length - 1); rowNumber++) {
                    // let rowData = csvRows[rowNumber].split(',');
                    // ��
                    let rowData = csvRows[rowNumber];

                    log.debug("rowData",rowData)

                    let dataPartition = rowData[dataPartitionIndex]; // �f�[�^�敪���擾
                    log.debug("dataPartition",dataPartition)
                    let etonetNo = rowData[etonetNoIndex]; // ETONET�ԍ����擾
                    log.debug("etonetNo",etonetNo)
                    // 3-1.ETONET�ԍ��擾
                    if (dataPartition === DATA_PARTITION.HEADER && !orderNumberList.includes(etonetNo)) {
                        orderNumberList.push(etonetNo);
                    }
                }
                log.debug("orderNumberList",orderNumberList)
            
                // 4.�`�F�b�N�p���擾
                // 4-1.�ڋq�}�X�^�擾
                const customerSearchType = search.Type.CUSTOMER;
                const customerSearchFilters = [];
                const customerSearchColums = [];
                const customerSearch = common.getSearchData(customerSearchType, customerSearchFilters, customerSearchColums);
                log.debug("customerSearch",customerSearch)

                // 4-2.�A�C�e���}�X�^�擾
                const itemSearchType = search.Type.ITEM;
                const itemSearchFilters = [];
                const itemSearchColums = [
                    search.createColumn({ name: FIELD_ID.ITEM_ID }),
                    search.createColumn({ name: FIELD_ID.CATEGORY_NUMBER }),
                    search.createColumn({ name: FIELD_ID.PRODUCT_NUMBER }),
                    search.createColumn({ name: FIELD_ID.COLOR }),
                    search.createColumn({ name: FIELD_ID.SIZE }),
                    search.createColumn({ name: FIELD_ID.REGISTRATION_DATE }),
                    search.createColumn({ name: FIELD_ID.LOT_NUMBER_ITEM }),
                    search.createColumn({ name: FIELD_ID.LOCATION }),
                    search.createColumn({ name: FIELD_ID.DEPARTMENT }),
                ];
                const itemSearch = common.getSearchData(itemSearchType, itemSearchFilters, itemSearchColums);
                log.debug("itemSearch",itemSearch)

                // 4-3.�ꏊ�}�X�^�擾
                const locationSearchType = search.Type.LOCATION;
                const locationSearchFilters = [
                    [FIELD_ID.ETONET_ALLOCATION_ALLOWED,"is","T"], // �uETONET�����t���O�v���I��
                    "AND",
                    [FIELD_ID.IS_INACTIV,"is","F"] //�u�ꏊ�𖳌��ɂ���v���I�t
                ];
                const locationSearchColums = [];
                const locationSearch = common.getSearchData(locationSearchType, locationSearchFilters, locationSearchColums);
                log.debug("locationSearch",locationSearch)

                // 4-4.�݌ɏڍ׃}�X�^�擾
                // ����4-3�̏ꏊ���擾
                const locationList = [];
                for (let locationResult of locationSearch) {
                    locationList.push(locationResult.id);
                }
                log.debug("locationList",locationList)

                const inventoryDetailSearchType = search.Type.INVENTORY_DETAIL;
                const inventoryDetailSearchFilters = [
                    [(FIELD_ID.ITEM_FEILD + FIELD_ID.LOT_NUMBER_ITEM),"is","T"], // �u�A�C�e���F���b�g�ԍ��t���A�C�e���v��true
                    "AND",
                    [FIELD_ID.EFFECTIVE_DATE,"greaterthanorequalto", "today"], //�u�L�������v���������ȍ~
                    "AND",
                    [(FIELD_ID.ITEM_FEILD + FIELD_ID.ITEM_TYPE),"is","InvtPart"], //�u�A�C�e���F��ށv���݌ɃA�C�e��
                    "AND",
                    [FIELD_ID.LOCATION,"anyof", locationList] //�u�ꏊ�v������4-3�Ŏ擾�����ꏊ
                ];
                const inventoryDetailSearchColums = [
                    search.createColumn({ name: FIELD_ID.ITEM }),
                    search.createColumn({ name: FIELD_ID.QUANTITY }),
                    search.createColumn({ name: FIELD_ID.ITEM_SERIAL_LOT_NO, join: FIELD_ID.ITEM }),
                    search.createColumn({ name: FIELD_ID.LOCATION }),
                    search.createColumn({
                        name: FIELD_ID.ITEM,
                        sort: search.Sort.ASC
                    }),
                    search.createColumn({
                        name: FIELD_ID.EFFECTIVE_DATE,
                        sort: search.Sort.ASC
                    }),
                ];
                log.debug("inventoryDetailSearchType",inventoryDetailSearchType)
                log.debug("inventoryDetailSearchFilters",inventoryDetailSearchFilters)
                log.debug("inventoryDetailSearchColums",inventoryDetailSearchColums)
                const inventoryDetailSearch = common.getSearchData(inventoryDetailSearchType, inventoryDetailSearchFilters, inventoryDetailSearchColums);

                // 4-5.�ŋ��R�[�h�}�X�^�擾
                const taxCdSearchType = "salestaxitem";
                const taxCdSearchFilters = [
                    [FIELD_ID.IS_INACTIV,"is","F"] //�u�����v���I�t
                ];
                const taxCdSearchColums = [];
                const taxCdSearch = common.getSearchData(taxCdSearchType, taxCdSearchFilters, taxCdSearchColums);

                // 4-6.�]�ƈ��}�X�^�擾
                const employeeSearchType = search.Type.EMPLOYEE;
                const employeeSearchFilters = [];
                const employeeSearchColums = [];
                const employeeSearch = common.getSearchData(employeeSearchType, employeeSearchFilters, employeeSearchColums);

                // 4-7.���������擾
                const salesOrderSearchType = search.Type.TRANSACTION;
                const salesOrderSearchFilters = [
                    ["type","is","SalesOrd"], // ��ނ�������
                    "AND",
                    [FIELD_ID.ETONET_NO,"isnotempty",""], //�uETONET�ԍ��v��null�ł͂Ȃ�
                    "AND",
                    [FIELD_ID.EXTERNAL_ID,"isnotempty",""] //�u�O��ID�v��null�ł͂Ȃ�
                ];
                const salesOrderSearchColums = [
                    search.createColumn({ name: FIELD_ID.ETONET_NO })
                ];
                const salesOrderSearch = common.getSearchData(salesOrderSearchType, salesOrderSearchFilters, salesOrderSearchColums);

                // �G���[���i�[�p
                let errorDetail = {
                    errorResult: "����",// �G���[��������
                    errorContent: ""// �G���[����
                };
                let itemInternalId = ""; // �A�C�e������ID
                let lotNoCheck = false; // ���b�g�ԍ��L��
                let locationInternalID =  ""; // �ꏊ����ID
                let taxCdInternalId = ""; // �ŋ��R�[�h����ID

                // �e�s�ɑ΂��ă`�F�b�N���J�n
                for (let rowNumber = 1; rowNumber < csvRows.length; rowNumber++) {
                    let resultObj = {};
                    // let rowData = csvRows[rowNumber].split(',');
                    // ��
                    let rowData = csvRows[rowNumber];

                    // 5.���̓`�F�b�N
                    let dataPartition = rowData[dataPartitionIndex]; // �f�[�^�敪���擾

                    if (dataPartition === DATA_PARTITION.HEADER) {
                        // �w�b�_�[���`�F�b�N
                        errorDetail = etonetLib.validationCheck(etonetLib.HEADER_INFO,rowData);
                    }else if (dataPartition === DATA_PARTITION.DETAIL) {
                        // ���ׂ��`�F�b�N
                        errorDetail = etonetLib.validationCheck(etonetLib.DETAIL_INFO,rowData);
                    }else if (dataPartition === DATA_PARTITION.MAIL) {
                        // ���[�����`�F�b�N
                        errorDetail = etonetLib.validationCheck(etonetLib.MAIL_INFO,rowData);
                    }else{
                        // ����ł��`�F�b�N
                        errorDetail = etonetLib.validationCheck(etonetLib.TAX_INFO,rowData);
                    }

                    // ���̓`�F�b�N�G���[���A���ʂ�߂�l�Ɋi�[���ȍ~�̃`�F�b�N�͍s�킸���̃��[�v��
                    if (errorDetail.errorResult !== ERROR_RESULT.SUCCESS) {
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }

                    // 6.�}�X�^�`�F�b�N
                    // 6-1.�ڋq�}�X�^���݃`�F�b�N
                    const userIdIndex = etonetLib.HEADER_INDEX.USER_ID;
                    // �}�X�^�̃��X�g�����������ă`�F�b�N
                    let customerCheck = customerSearch.some(function(item) {
                        return item.id === rowData[userIdIndex];
                    })
                    if (dataPartition === DATA_PARTITION.HEADER && !customerCheck) {
                        errorDetail.errorResult = ERROR_RESULT.CUSTOMER_MASTER_ERROR;
                        errorDetail.errorContent = "���[�UID";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }
            
                    // 6-2.�A�C�e���}�X�^���݃`�F�b�N
                    const categoryNumberIndex = etonetLib.DETAIL_INDEX.CATEGORY_NUMBER;
                    const productNumberIndex = etonetLib.DETAIL_INDEX.PRODUCT_NUMBER;
                    const colorIndex = etonetLib.DETAIL_INDEX.COLOR;
                    const sizeIndex = etonetLib.DETAIL_INDEX.SIZE;
                    const registrationDateIndex = etonetLib.DETAIL_INDEX.COMMODITY_ID_REGIST_DATE;
                    // �Ώۂ̃A�C�e���̃C���f�b�N�X
                    let itemIndex;
                    // �`�F�b�N�Ώۂ̃A�C�e�����擾
                    let checkItem = rowData[categoryNumberIndex] + rowData[productNumberIndex] + rowData[registrationDateIndex].slice(1,6) + ' : ' + rowData[categoryNumberIndex] + rowData[productNumberIndex] + rowData[registrationDateIndex].slice(1,6) + rowData[colorIndex] + rowData[sizeIndex];
                    log.debug("checkItem",checkItem)
                    let itemCheck = itemSearch.some(function(item) {
                        return item.getValue({ name: FIELD_ID.ITEM_ID }) === checkItem;
                    })
                    log.debug("itemCheck",itemCheck)
                    if (dataPartition === DATA_PARTITION.DETAIL && !itemCheck) {
                        errorDetail.errorResult = ERROR_RESULT.ITEM_MASTER_ERROR;
                        errorDetail.errorContent = "�ޔԁA�i�ԁA�J���[�A�T�C�Y�A�ޕi�ԓo�^��";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        for (let itemSearchIndex = 0; itemSearchIndex < itemSearch.length; itemSearchIndex++) {
                            log.debug("itemSearch[itemSearchIndex]",itemSearch[itemSearchIndex])
                            if (itemSearch[itemSearchIndex].getValue({ name: FIELD_ID.ITEM_ID }) === checkItem){
                                itemIndex = itemSearchIndex;
                                log.debug("itemIndex",itemIndex)
                            }
                        }
                        log.debug("itemSearch[itemIndex]",itemSearch[itemIndex])
                        itemInternalId = itemSearch[itemIndex].id;
                        lotNoCheck = itemSearch[itemIndex].getValue({ name: FIELD_ID.LOT_NUMBER_ITEM });
                        itemDept = itemSearch[itemIndex].getValue({ name: FIELD_ID.DEPARTMENT });
                        resultObj.itemInternalId = itemInternalId;
                        resultObj.lotNoCheck = lotNoCheck;
                        resultObj.itemDept = itemDept;
                    }

                    // 6-3.�ꏊ�}�X�^���݃`�F�b�N
                    // �Ώۂ̏ꏊ�̃C���f�b�N�X
                    let locationIndex;
                    // �}�X�^�̃��X�g�����������ă`�F�b�N
                    log.debug("itemSearch[itemIndex].getValue({ name: FIELD_ID.LOCATION })",itemSearch[itemIndex].getValue({ name: FIELD_ID.LOCATION }))
                    let locationCheck = locationSearch.some(function(location) {
                        return location.id === itemSearch[itemIndex].getValue({ name: FIELD_ID.LOCATION });
                    })
                    log.debug("locationCheck",locationCheck)
                    if (dataPartition === DATA_PARTITION.DETAIL && !locationCheck) {
                        errorDetail.errorResult = ERROR_RESULT.LOCATION_MASTER_ERROR;
                        errorDetail.errorContent = "�ޔԁA�i�ԁA�J���[�A�T�C�Y�A�ޕi�ԓo�^��";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        for (let locationSearchIndex = 0; locationSearchIndex < locationSearch.length; locationSearchIndex++) {
                            if (locationSearch[locationSearchIndex].getValue({ name: FIELD_ID.ITEM_ID }) === checkItem){
                                locationIndex = locationSearchIndex;
                            }
                        }
                        locationInternalID = locationSearch[locationIndex].id;
                        resultObj.locationInternalID = locationInternalID; 
                    }

                    // 6-4.�݌ɏڍ׃}�X�^���݃`�F�b�N
                    // �u���b�g�ԍ��L���v��true�̎��̂ݎ��{
                    log.debug("lotNoCheck",lotNoCheck)
                    if (lotNoCheck) {
                        let inventoryDetailCheck = inventoryDetailSearch.some(function(inventoryDetail) {
                            return (
                                inventoryDetail.getValue({ name: FIELD_ID.ITEM }) === itemInternalId &&
                                inventoryDetail.getValue({ name: FIELD_ID.LOCATION }) === locationInternalID
                            )
                        });
                        // �}�X�^�́u���ʁv�̍��v���擾
                        let quantityTotal = 0;
                        const subjectList = [];// �Ώۂ̃}�X�^��񃊃X�g
                        for (const result of inventoryDetailSearch) {
                            if (
                                result.getValue({ name: FIELD_ID.ITEM }) === itemInternalId &&
                                result.getValue({ name: FIELD_ID.LOCATION }) === locationInternalID
                            ){
                                quantityTotal += result.getValue({ name: FIELD_ID.QUANTITY });
                                subjectList.push(result);
                            }
                        }
                        // �󒍖��ׂ́u���ʁv���擾
                        let detailQuantity = rowData[etonetLib.DETAIL_INDEX.QUANTITY];
                        // �}�X�^�́u���ʁv�̍��v���󒍖��ׂ́u���ʁv�̏ꍇ�A�`�F�b�N�G���[
                        if (quantityTotal < detailQuantity) {
                            inventoryDetailCheck = false;
                        }
                        if (dataPartition === DATA_PARTITION.DETAIL && !inventoryDetailCheck) {
                            errorDetail.errorResult = ERROR_RESULT.INVENTORY_DETAIL_MASTER_ERROR;
                            errorDetail.errorContent = "�ޔԁA�i�ԁA�J���[�A�T�C�Y�A�ޕi�ԓo�^��";
                            resultObj.errorResult = errorDetail.errorResult;
                            resultObj.errorContent = errorDetail.errorContent;
                            resultObj.csv = csvRows[rowNumber];
                            result.push(resultObj);
                            continue;
                            
                        }else{
                            const inventoryDetailList = [];
                            const inventoryDetailObj = {};
                            const quantityIndex = etonetLib.DETAIL_INDEX.QUANTITY;
                            let surplusQuantity = rowData[quantityIndex];
                            for (const result of subjectList) {
                                const resultQuantity = result.getValue({ name: FIELD_ID.QUANTITY });
                                if (resultQuantity < surplusQuantity) {

                                    inventoryDetailObj.lotNumber = result.getValue({ name: FIELD_ID.ITEM_SERIAL_LOT_NO });
                                    inventoryDetailObj.quantity = resultQuantity;
                                    inventoryDetailList.push(inventoryDetailObj);

                                    surplusQuantity = surplusQuantity - resultQuantity;
                                }else{
                                    inventoryDetailObj.lotNumber = result.getValue({ name: FIELD_ID.ITEM_SERIAL_LOT_NO });
                                    inventoryDetailObj.quantity = surplusQuantity;
                                    inventoryDetailList.push(inventoryDetailObj);
                                    break;
                                }
                            };

                            result.push(inventoryDetailList);
                        }
                    }

                    // 6-5.�ŋ��R�[�h�}�X�^���݃`�F�b�N
                    // �}�X�^�̃��X�g�����������ă`�F�b�N
                    let taxCdCheck = taxCdSearch.some(function(item) {
                        // TODO:����Ŗ��ׂ̓K�p����ŃR�[�h���`�F�b�N�������������H
                        // �󒍖��ׂ̓K�p����ŃR�[�h���擾
                        const detailTaxCodeKey = etonetLib.DETAIL_INDEX.TAX_CD;
                        const csvDetailTaxCode = rowData[detailTaxCodeKey];
                        // ����ID�Ɣ�r���邽�߂ɕϊ�
                        const detailTaxCode = etonetLib.CONVERSION_INFO.APPLIED_TAX_CD[csvDetailTaxCode];
                        // �}�X�^�ɑ��݂����ꍇ�Atrue��Ԃ�
                        return item.id === detailTaxCode;
                    })
                    if ([DATA_PARTITION.DETAIL, DATA_PARTITION.TAX].includes(dataPartition) && !taxCdCheck) {
                        errorDetail.errorResult = ERROR_RESULT.TAX_CD_MASTER_ERROR;
                        errorDetail.errorContent = "�K�p����ŃR�[�h";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        taxCdInternalId = taxCdSearch.id;
                        resultObj.taxCdInternalId = taxCdInternalId;
                    }

                    // 6-6.�]�ƈ��}�X�^���݃`�F�b�N
                    const employeeIndex = etonetLib.HEADER_INDEX.OPERATION_PROXY;
                    // �}�X�^�̃��X�g�����������ă`�F�b�N
                    let employeeCheck = employeeSearch.some(function(item) {
                        return item.id === rowData[employeeIndex];
                    })
                    if (dataPartition === DATA_PARTITION && !employeeCheck) {
                        errorDetail.errorResult = ERROR_RESULT.EMPLOYEE_MASTER_ERROR;
                        errorDetail.errorContent = "�����s��";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }

                    // 7.���������݃`�F�b�N
                    // �}�X�^�̃��X�g�����������ă`�F�b�N
                    let salesOrderCheck = salesOrderSearch.some(function(salesOrder) {
                        // �u�󒍓��v�̗�C���f�b�N�X���擾
                        const orderDateIndex = etonetLib.HEADER_INDEX.TRANDATE;
                        // ���ځuETONET�ԍ��v�Ɠ����`�ɂ���
                        const rowEtonetNo = rowData[etonetNoIndex] + "-" + rowData[orderDateIndex];

                        return salesOrder.getValue({ name: FIELD_ID.ETONET_NO }) === rowEtonetNo;
                    })
                    if (salesOrderCheck) {
                        errorDetail.errorResult = ERROR_RESULT.SALES_ORDER_EXIST_ERROR;
                        errorDetail.errorContent = "ETONET�ԍ�";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        // �u�󒍓�-ETONET�ԍ��v�ɉ��H�����O��ID��ǉ�
                        resultObj.externalId = rowEtonetNo;
                    }

                    // ����I�������������ʂ�csv����ݒ肵�߂�l�ɒǉ�
                    resultObj.errorResult = errorDetail.errorResult;
                    resultObj.errorContent = errorDetail.errorContent;
                    resultObj.csv = csvRows[rowNumber];
                    result.push(resultObj);

                }
            }

            // 8.�߂�l��ݒ�
            
            log.debug("getInputData��������", result)
            return result;
        }
        catch (e) {
            log.error("getInputData�G���[", e)
        }
    }

    function map(context) {
        let value = JSON.parse(context.value);
        log.debug("map�J�n")
        // �uETONET�ԍ��v�̗�C���f�b�N�X���擾
        const etonetNoIndex = etonetLib.HEADER_INDEX.ETONET_NUMBER;
        for (let contextRow = 0; value && contextRow < value.length; contextRow++) {
            let contextCsvData = value.csv.split(',');
            // ETONET�ԍ����擾
            let keyEtonetNo = contextCsvData[etonetNoIndex];
            let writeValue = value;

            // ETONET�ԍ��Ń}�b�s���O
            context.write({
                key: keyEtonetNo,
                value: writeValue
            });
        }
    }

    function reduce(context) {
        log.debug("reduce�J�n")
        try{

            // 1.�������ʊm�F
            if (context.errorResult !== ERROR_RESULT.SUCCESS) {
                // �߂�l��ݒ肵�ď������I��
                context.write({
                    key: context.key,
                    value: context.value
                });
                return;
            }

            // 2.�f�[�^�敪���Ƃɕ���
            const headerDataObjList = []; // �w�b�_���i�[�p���X�g
            const detailDataObjList = []; // ���׏��i�[�p���X�g
            const mailDataObjList = []; // ���[�����i�[�p���X�g
            const taxDataObjList = []; // ����ŏ��i�[�p���X�g
            const mailAddressList = [];// ���[���A�h���X
            for (let contextLine = 1; contextLine < context.value.length; contextLine++) {
                // �l���擾
                const contextValue = context.value[contextLine];
                // csv�����擾
                const contextCsv = contextValue.csv.split(',');
                // �u�f�[�^�敪�v�̗�C���f�b�N�X���擾
                const dataPartitionIndex = etonetLib.HEADER_INDEX.DATA_PARTITION;
                // �f�[�^�敪���擾
                let dataPartition = contextCsv[dataPartitionIndex];
                // 2-1.�󒍃w�b�_
                if (dataPartition === DATA_PARTITION.HEADER) {
                    const headerData = {};
                    let headerCsvData = contextCsv;
                    for (let dataRow = 0; dataRow < headerCsvData.length; dataRow++) {
                        // �t�B�[���hID���擾
                        const fieldId = etonetLib.findHeaderByIndex(dataRow).fieldId;
                        if(fieldId){
                            headerData[fieldId] = headerCsvData[dataRow];
                        }
                    }
                    headerData.externalId = contextValue.externalId;
                    // �uETONET�ԍ��v�̃t�B�[���hID���擾
                    const etonetNoFieldId = etonetLib.findHeaderByLabel("ETONET�ԍ�").fieldId;
                    // ETONET�ԍ��ɐݒ肵����
                    headerData[etonetNoFieldId] = contextValue.externalId;
                    headerDataObjList.push(headerData);
                }
                // 2-2.�󒍖���
                if (dataPartition === DATA_PARTITION.DETAIL) {
                    const detailData = {};
                    let detailCsvData = contextCsv;
                    for (let dataRow = 0; dataRow < detailCsvData.length; dataRow++) {
                        // �t�B�[���hID���擾
                        const fieldId = etonetLib.findDetailByIndex(dataRow).fieldId;
                        if(fieldId){
                            detailData[fieldId] = detailCsvData[dataRow];
                        }
                    }
                    detailData.item = contextValue.itemInternalId;
                    detailData.taxCd = contextValue.taxCdInternalId;
                    detailData.location = contextValue.locationInternalID;
                    detailData.department = contextValue.itemDept;
                    // �݌ɏڍ�
                    if (contextValue.inventoryDetailList) {
                        detailData.inventoryDetailList = contextValue.inventoryDetailList;
                    }

                    detailDataObjList.push(detailData);
                }
                // 2-3.�󒍃��[������
                if(dataPartition === DATA_PARTITION.MAIL){
                    // �u���[���A�h���X�v�̗�C���f�b�N�X���擾
                    const mailAddressIndex = etonetLib.MAIL_INDEX.MAIL_ADDRESS;
                    // ���[���A�h���X���擾
                    let mailAddress = contextCsv[mailAddressIndex];
                    // ���[���A�h���X���X�g�Ɋi�[
                    mailAddressList.push(mailAddress);
                }
                // 2-4.�󒍏���Ŗ���
                if (dataPartition === DATA_PARTITION.TAX) {
                    const taxData = {};
                    let taxCsvData = contextCsv;
                    for (let dataRow = 0; dataRow < taxCsvData.length; dataRow++) {
                        // �t�B�[���hID���擾
                        const fieldId = etonetLib.findDetailByIndex(dataRow).fieldId;
                        if(fieldId){
                            taxData[fieldId] = taxCsvData[dataRow];
                        }
                    }
                    taxDataObjList.push(taxData);
                }
            }
            // �󒍃��[�����׃I�u�W�F�N�g�Ƀ��[���A�h���X���i�[
            mailDataObjList.push(mailAddressList.join(","));

            // 3.�e�f�[�^�L���`�F�b�N
            let value = JSON.parse(context.value);
            // 3-1.�󒍃w�b�_
            if (headerDataObjList.length === 0) {
                value.errorResult = ERROR_RESULT.HEADER_EXIST_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }
            // 3-2.�󒍖���
            if (detailDataObjList.length === 0) {
                value.errorResult = ERROR_RESULT.DETAIL_EXIST_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }
            // 3-3.�󒍃��[��
            if (mailDataObjList.length === 0) {
                value.errorResult = ERROR_RESULT.MAIL_EXIST_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }
            // 3-4.�󒍏����
            if (taxDataObjList.length === 0) {
                value.errorResult = ERROR_RESULT.TAX_EXIST_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }

            // 4.�������쐬
            // ���������R�[�h��V�K�쐬
            const salesOrder = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true
            });
            // 4-1.�󒍃w�b�_���̓���
            // TODO:headerDataObjList�ɂ�1�s�����������Ă��Ȃ����߃��[�v�̕K�v�͂Ȃ��̂ł́H
            for (let headerObjectLine = 0; headerObjectLine < headerDataObjList.length; headerObjectLine++) {

                for (let headerLine = 0; headerLine < etonetLib.HEADER_INFO.length; headerLine++) {

                    // ETONET�ԍ���ݒ�
                    salesOrder.setValue({
                        fieldID: FIELD_ID.ETONET_NO,
                        value: headerDataObjList[headerObjectLine].externalId
                    })

                    // �O��ID��ݒ�
                    salesOrder.setValue({
                        fieldID: FIELD_ID.EXTERNAL_ID,
                        value: headerDataObjList[headerObjectLine].externalId
                    })

                    // ETONET�`�[��ނ�ݒ�
                    salesOrder.setValue({
                        fieldID: FIELD_ID.TRAN_TYPE,
                        value: SALES_TYPE.ORDER
                    })


                    if (etonetLib.HEADER_INFO[headerLine].fieldid !== null) {
                        salesOrder.setValue({
                            fieldID: etonetLib.HEADER_INFO[headerLine].fieldid,
                            value: headerDataObjList[headerObjectLine][headerLine]
                        })
                    }
                }
            }
            // 4-2.�󒍖��׏��̓���
            // �u���������ڂ̈ꗗ���X�g
            const replaceFieldList = [FIELD_ID.ITEM, FIELD_ID.LOCATION, FIELD_ID.TAX_CD];
            for (let detailObjectLine = 0; detailObjectLine < detailDataObjList.length; detailObjectLine++) {
                for (let detailLine = 0; detailLine < etonetLib.DETAIL_INFO.length; detailLine++) {
                    // ���׍s��ǉ�
                    salesOrder.selectNewLine({ sublistId: 'item' });

                    // �A�C�e����ݒ�
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.ITEM,
                        value: detailDataObjList[detailObjectLine].item
                    })

                    // �ꏊ��ݒ�
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.LOCATION,
                        value: detailDataObjList[detailObjectLine].location
                    })

                    // �ŋ��R�[�h��ݒ�
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.TAX_CD,
                        value: detailDataObjList[detailObjectLine].taxCdInternalId
                    })

                    if (etonetLib.DETAIL_INFO[detailLine].fieldid !== null) {
                        // ���ځu�A�C�e���v�u�ꏊ�v�u�ŋ��R�[�h�v�ȊO�̏ꍇ
                        if (replaceFieldList.indexOf(etonetLib.DETAIL_INFO[detailLine].fieldid) === -1) {
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: etonetLib.DETAIL_INFO[detailLine].fieldid,
                                value: detailDataObjList[detailObjectLine][detailLine]
                            })
                        }

                        // �݌ɏڍׂ����鎞�A�݌ɏڍׂ�ݒ�
                        if (detailDataObjList[detailObjectLine].inventoryDetailList) {

                            // �݌ɏڍ׃T�u���R�[�h�̍쐬
                            const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                                sublistId: 'item',
                                fieldId: 'inventorydetail',
                            });

                            // �݌ɏڍׂ̃��C����ݒ�
                            detailDataObjList[detailObjectLine].inventoryDetailList.forEach(function (detail) {
                                // �݌ɏڍ׃T�u���X�g�̃A�C�e�����C���I��
                                inventoryRecord.selectNewLine({
                                    sublistId: 'inventoryassignment',
                                });

                                //�݌ɏڍׂ̐���
                                inventoryRecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: detail.quantity
                                });

                                // �݌ɏڍׂ̃V���A��/���b�g�ԍ�
                                inventoryRecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'receiptinventorynumber',
                                    value: detail.lotNumber
                                });
                    
                                //�݌ɏڍ׃T�u���X�g�Ō��ݑI������Ă��郉�C�����m��
                                inventoryRecord.commitLine({
                                    sublistId: 'inventoryassignment'
                                });

                            })
                        }

                        // �A�C�e���T�u���X�g�Ō��ݑI������Ă��郉�C�����m��
                        salesOrder.commitLine({
                            sublistId: 'item'
                        });

                        // 4-2-1.�����ӗl���i�ύX�̓���
                        // �u�ڋq�ʉ��i�敪�v�̃C���f�b�N�X���擾����
                        const customerPriceClassIndex = etonetLib.DETAIL_INDEX.CUSTOMER_PRICE_TYPE;
                        
                        if (detailDataObjList[detailObjectLine][customerPriceClassIndex] === "3" || detailDataObjList[detailObjectLine][customerPriceClassIndex] === "4") {
                            // ���׍s��ǉ�
                            salesOrder.selectNewLine({ sublistId: 'item' });

                            // �A�C�e����ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.ITEM,
                                value: DISCOUNT_ITEM.COSTOMER_PRICE
                            })

                            // ���i������ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.PRICE,
                                value: "-1" // �J�X�^��
                            })

                            // ���z��ݒ�
                            // �u�ڋq�ʉ����i�v���擾����
                            const customerWholesalePriceIndex = etonetLib.DETAIL_INDEX.CUSTOMER_WHOLESALE_PRICE;
                            const customerWholesalePrice = detailDataObjList[detailObjectLine][customerWholesalePriceIndex]
                            // �u�}�X�^�����i�v���擾����
                            const masterWholesalePriceIndex = etonetLib.DETAIL_INDEX.MASTER_WHOLESALE_PRICE;
                            const masterWholesalePrice = detailDataObjList[detailObjectLine][masterWholesalePriceIndex]
                            // �u���ʁv���擾����
                            const quantityIndex = etonetLib.DETAIL_INDEX.QUANTITY;
                            const quantity = detailDataObjList[detailObjectLine][quantityIndex]
                            // �i�ڋq�ʉ����i-�}�X�^�����i�j*���ʂ��擾����
                            const customerTypePrice = (customerWholesalePrice-masterWholesalePrice)*quantity;
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.AMOUNT,
                                value: customerTypePrice
                            })

                            // �ŋ��R�[�h��ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.TAX_CD,
                                value: detailDataObjList[detailObjectLine].taxCdInternalId 
                            })

                            // �����ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.DEPT,
                                value: DEPT.SALES_DIVISION // �c�Ɩ{��
                            })

                            // �A�C�e���T�u���X�g�Ō��ݑI������Ă��郉�C�����m��
                            salesOrder.commitLine({
                                sublistId: 'item'
                            });

                        }

                        // 4-2-2.�Z�[���l���̓���
                        // �u�����敪�v�̃C���f�b�N�X���擾����
                        const discountCategoryIndex = etonetLib.DETAIL_INDEX.DISCOUNT_TYPE;
                        
                        if (detailDataObjList[detailObjectLine][discountCategoryIndex] === "3" 
                            || detailDataObjList[detailObjectLine][discountCategoryIndex] === "7"
                            || detailDataObjList[detailObjectLine][discountCategoryIndex] === "8"
                        ) {
                            // ���׍s��ǉ�
                            salesOrder.selectNewLine({ sublistId: 'item' });

                            // �A�C�e����ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.ITEM,
                                value: DISCOUNT_ITEM.SALE_DISCOUNT
                            })

                            // ���i������ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.PRICE,
                                value: "-1" // �J�X�^��
                            })

                            // ���z��ݒ�
                            // �u�̔������i�v���擾����
                            const saleWholesalePriceIndex = etonetLib.DETAIL_INDEX.SALES_WHOLESALE_PRICE;
                            const saleWholesalePrice = detailDataObjList[detailObjectLine][saleWholesalePriceIndex]
                            // �u�ڋq�ʉ����i�v���擾����
                            const customerWholesalePriceIndex = etonetLib.DETAIL_INDEX.CUSTOMER_WHOLESALE_PRICE;
                            const customerWholesalePrice = detailDataObjList[detailObjectLine][customerWholesalePriceIndex]
                            // �u���ʁv���擾����
                            const quantityIndex = etonetLib.DETAIL_INDEX.QUANTITY;
                            const quantity = detailDataObjList[detailObjectLine][quantityIndex]
                            // �i�̔������i-�ڋq�ʉ����i�j*���ʂ��擾����
                            const saleDiscount = (saleWholesalePrice - customerWholesalePrice)*quantity;
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.AMOUNT,
                                value: saleDiscount
                            })

                            // �ŋ��R�[�h��ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.TAX_CD,
                                value: detailDataObjList[detailObjectLine].taxCdInternalId 
                            })

                            // �����ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.DEPT,
                                value: detailDataObjList[detailObjectLine].department
                            })

                            // �A�C�e���T�u���X�g�Ō��ݑI������Ă��郉�C�����m��
                            salesOrder.commitLine({
                                sublistId: 'item'
                            });
                        }

                        // 4-2-3.���i�ύX�̓���
                        if (detailDataObjList[discountCategoryIndex] === "4") {
                            // ���׍s��ǉ�
                            salesOrder.selectNewLine({ sublistId: 'item' });

                            // �A�C�e����ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.ITEM,
                                value: DISCOUNT_ITEM.PRICE_CHANGE
                            })

                            // ���i������ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.PRICE,
                                value: "-1" // �J�X�^��
                            })

                            // ���z��ݒ�
                            // �u�̔������i�v���擾����
                            const saleWholesalePriceIndex = etonetLib.DETAIL_INDEX.SALES_WHOLESALE_PRICE;
                            const saleWholesalePrice = detailDataObjList[detailObjectLine][saleWholesalePriceIndex]
                            // �u�ڋq�ʉ����i�v���擾����
                            const customerWholesalePriceIndex = etonetLib.DETAIL_INDEX.CUSTOMER_WHOLESALE_PRICE;
                            const customerWholesalePrice = detailDataObjList[detailObjectLine][customerWholesalePriceIndex]
                            // �u���ʁv���擾����
                            const quantityIndex = etonetLib.DETAIL_INDEX.QUANTITY;
                            const quantity = detailDataObjList[detailObjectLine][quantityIndex]
                            // �i�̔������i-�ڋq�ʉ����i�j*���ʂ��擾����
                            const saleDiscount = (saleWholesalePrice - customerWholesalePrice)*quantity;
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.AMOUNT,
                                value: saleDiscount
                            })

                            // �ŋ��R�[�h��ݒ�
                            // �u�ŋ��R�[�h�v���擾����
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.TAX_CD,
                                value: detailDataObjList[detailObjectLine].taxCdInternalId 
                            })

                            // �����ݒ�
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.DEPT,
                                value: detailDataObjList[detailObjectLine].department
                            })

                            // �A�C�e���T�u���X�g�Ō��ݑI������Ă��郉�C�����m��
                            salesOrder.commitLine({
                                sublistId: 'item'
                            });
                            
                        }
                    }
                }
            }
            // 4-3.�󒍃��[�����̓���
            for (let mailLine = 0; mailLine < etonetLib.MAIL_INFO.length; mailLine++) {
                if (etonetLib.MAIL_INFO[mailLine].fieldid === "mail") {
                    salesOrder.setValue({
                        fieldID: etonetLib.MAIL_INFO[mailLine].fieldid,
                        value: mailDataObjList[0]// 1�����Ȃ�����0��ݒ�
                    })
                }
            }

            // 4-4.�󒍏���ŏ��̓���
            // �u�K�p����ŃR�[�h�v�̗�C���f�b�N�X���擾����
            const taxCdIndex = etonetLib.TAX_INDEX.APPLIED_TAX_CD;
            // �u����őΏۊz�v�̗�C���f�b�N�X���擾����
            const taxTargetIndex = etonetLib.TAX_INDEX.TAXABLE_AMOUNT;
            // �u����Ŋz�v�̗�C���f�b�N�X���擾����
            const taxPriceIndex = etonetLib.TAX_INDEX.TAX_AMOUNT;
            // �y���ŗ�8%�̏ꍇ
            if (taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.EIGHT_PER)) {
                const eight_per_tax_target = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.EIGHT_PER)?.[taxTargetIndex];
                const eight_per_tax_price = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.EIGHT_PER)?.[taxPriceIndex];

                salesOrder.setValue({
                    fieldID: "custbody_etonet_taxable_amount_8",// �ېőΏۊz(8%)
                    value: eight_per_tax_target
                })
                salesOrder.setValue({
                    fieldID: "custbody_etonet_tax_amount_8",// ����Ŋz(8%)
                    value: eight_per_tax_price
                })
            }
            // 10%�̏ꍇ
            if (taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.TEN_PER)) {
                const ten_per_tax_target = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.TEN_PER)?.[taxTargetIndex];
                const ten_per_tax_price = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.TEN_PER)?.[taxPriceIndex];

                salesOrder.setValue({
                    fieldID: "custbody_etonet_taxable_amount_10",// �ېőΏۊz(10%)
                    value: ten_per_tax_target
                })
                salesOrder.setValue({
                    fieldID: "custbody_etonet_tax_amount_10",// ����Ŋz(10%)
                    value: ten_per_tax_price
                })
            }
            // ��ېł̏ꍇ
            if (taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.NO_TAX)) {
                const no_tax_target = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.NO_TAX)?.[taxTargetIndex];

                salesOrder.setValue({
                    fieldID: "custbody_etonet_nontaxable_amount",// ��ېőΏۊz
                    value: no_tax_target
                })
            }

            // 4-5.���v�̓���
            // ���׍s��ǉ�
            salesOrder.selectNewLine({ sublistId: 'item' });

            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: 'item',
                value: 'subtotalitem' // ���v
            })

            // �A�C�e���T�u���X�g�Ō��ݑI������Ă��郉�C�����m��
            salesOrder.commitLine({
                sublistId: 'item'
            });

            // 4-6.�N�[�|���l���̓���
            // �uEC�T�C�g�l���z�v�̗�C���f�b�N�X���擾����
            const ecSiteDiscountIndex = etonetLib.HEADER_INDEX.EC_SITE_DISCOUNT;
            // �uEC�T�C�g�l���z�v���擾����
            const ecSiteDiscount = headerDataObjList[ecSiteDiscountIndex];

            // �uEC�T�C�g�l���z�v��0�̏ꍇ�A�ǉ�
            if (ecSiteDiscount > 0) {
                // 4-6-1.�ŋ��R�[�h���Ƃ̒l�����z�擾
                let noTaxTotal = 0; //��ېł̍��v�z
                let tenPerTotal = 0; // �ŗ�10���̍��v�z
                let eightPerTotal = 0; // �y���ŗ�8���̍��v�z
                let subtotalLine = 0; // �A�C�e�����u���v�v�̍s
                let lineCount = salesOrder.getLineCount({ sublistId: 'item' });
                for (let itemLine = 0; itemLine < lineCount; itemLine++) {
                    salesOrder.selectLine({
                        sublistId: 'item',
                        line: itemLine
                    });
                    // �ŋ��R�[�h���擾
                    let lineTaxCd = salesOrder.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.TAX_CD
                    });
                    // ���z���擾
                    let lineAmount = salesOrder.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.AMOUNT
                    });

                    // �ŋ��R�[�h���u��ېŁv�̏ꍇ
                    if (lineTaxCd === TAX_CD.NO_TAX) {
                        noTaxTotal += lineAmount;
                    }else if (lineTaxCd === TAX_CD.TEN_PER) {
                        // �ŋ��R�[�h���u10%�v�̏ꍇ
                        tenPerTotal += lineAmount;
                    }else if (lineTaxCd === TAX_CD.EIGHT_PER) {
                        // �ŋ��R�[�h���u�y���ŗ�8%�v�̏ꍇ
                        eightPerTotal += lineAmount;
                    }

                    // �A�C�e�����u���v�v�̍s���擾
                    let lineItem = salesOrder.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: 'item'
                    });
                    if (lineItem === 'subtotalitem') {
                        subtotalLine = itemLine;
                    }
                }

                // ���v�̗��I��
                salesOrder.selectLine({
                    sublistId: 'item',
                    line: subtotalLine
                });
                // ���v�̋��z���擾
                const subtotal = salesOrder.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldID: FIELD_ID.AMOUNT
                })

                // �N�[�|���l���z���擾
                // ��ېł̏ꍇ
                const noTaxCouponDiscount = noTaxTotal*ecSiteDiscount/subtotal;
                // �W���ŗ�10���̏ꍇ
                const tenPerCouponDiscount = tenPerTotal*ecSiteDiscount/subtotal;
                // �y���ŗ�8%�̏ꍇ
                const eightPerCouponDiscount = ecSiteDiscount-noTaxCouponDiscount-tenPerCouponDiscount;

                // �ŋ��R�[�h�ƃN�[�|���l���z�̃Z�b�g�����X�g�Ɋi�[
                const couponDiscountList = [];
                let couponDiscountObj = {};
                // ��ې�
                if (noTaxCouponDiscount) {
                    couponDiscountObj.taxCd = TAX_CD.NO_TAX;
                    couponDiscountObj.couponDiscount = noTaxCouponDiscount;
                    couponDiscountList.push(couponDiscountObj);
                }
                // �W���ŗ�10���̏ꍇ
                if (tenPerCouponDiscount) {
                    couponDiscountObj.taxCd = TAX_CD.TEN_PER;
                    couponDiscountObj.couponDiscount = tenPerCouponDiscount;
                    couponDiscountList.push(couponDiscountObj);
                }
                // �y���ŗ�8%�̏ꍇ
                if (eightPerCouponDiscount) {
                    couponDiscountObj.taxCd = TAX_CD.EIGHT_PER;
                    couponDiscountObj.couponDiscount = eightPerCouponDiscount;
                    couponDiscountList.push(couponDiscountObj);
                }

                // 4-6-2.�ŋ��R�[�h���Ƃ̃A�C�e���̐ݒ�
                couponDiscountList.forEach(function (couponDiscount) {
                    const couponDiscountInfo = {};
                    couponDiscountInfo.record = salesOrder;
                    couponDiscountInfo.item = DISCOUNT_ITEM.COUPON_DISCOUNT;// �N�[�|���l��
                    couponDiscountInfo.amount = couponDiscount.couponDiscount;
                    couponDiscountInfo.taxCd = couponDiscount.taxCd;
                    couponDiscountInfo.dept = DEPT.SALES_DIVISION;
                    addItemLine(postageInfo);
                })
            }

            // 4-7.�����̓���
            // �u�������z�v�̗�C���f�b�N�X���擾����
            const postageAmountIndex = etonetLib.HEADER_INDEX.POSTAGE;
            // �u�������z�v���擾����
            const postageAmount = headerDataObjList[postageAmountIndex];

            // �u�������z�v��0�̏ꍇ�A���ׂɑ����̍s��ǉ�
            if (postageAmount > 0) {
                const postageInfo = {};
                postageInfo.record = salesOrder;
                postageInfo.item = DELIVERY_ITEM.POSTAGE;// ����
                postageInfo.amount = postageAmount;
                postageInfo.taxCd = TAX_CD.TEN_PER;
                postageInfo.dept = DEPT.LOGISTICS;
                addItemLine(postageInfo);
            }

            // 4-8.�����T�[�r�X�̓���
            // �u�������z�T�[�r�X�z�v�̗�C���f�b�N�X���擾����
            const postageAmountServiceIndex = etonetLib.HEADER_INDEX.POSTAGE_SERVICE;
            // �u�����T�[�r�X�z�v���擾����
            const postageAmountService = headerDataObjList[postageAmountServiceIndex];

            // �u�����T�[�r�X�z�v��0�̏ꍇ�A���ׂɑ����T�[�r�X�z�̍s��ǉ�
            if (postageAmountService > 0) {
                const postageServiceInfo = {};
                postageServiceInfo.record = salesOrder;
                postageServiceInfo.item = DISCOUNT_ITEM.POSTAGE_SERVICE;// �����T�[�r�X�z
                postageServiceInfo.amount = postageAmountService;
                postageServiceInfo.taxCd = TAX_CD.TEN_PER;
                postageServiceInfo.dept = DEPT.SALES_DIVISION;
                addItemLine(postageServiceInfo);
            }

            // 4-9.����萔���̓���
            // �u������萔���v�̗�C���f�b�N�X���擾����
            const CodChargeIndex = etonetLib.HEADER_INDEX.COD_CHARGE;
            // �u����萔���v���擾����
            const CodCharge = headerDataObjList[CodChargeIndex];

            // �u����萔���v��0�̏ꍇ�A���ׂɑ���萔���̍s��ǉ�
            if (CodCharge > 0) {
                const CodChargeInfo = {};
                CodChargeInfo.record = salesOrder;
                CodChargeInfo.item = DELIVERY_ITEM.COD_CHARGE;// ����萔��
                CodChargeInfo.amount = CodCharge;
                CodChargeInfo.taxCd = TAX_CD.TEN_PER;
                CodChargeInfo.dept = DEPT.LOGISTICS;
                addItemLine(CodChargeInfo);
            }

            // 4-10.����萔���T�[�r�X�̓���
            // �u����萔���T�[�r�X�z�v�̗�C���f�b�N�X���擾����
            const CodChargeServiceIndex = etonetLib.HEADER_INDEX.COD_CHARGE_SERVICE;
            // �u����萔���T�[�r�X�z�v���擾����
            const CodChargeService = headerDataObjList[CodChargeServiceIndex];

            // �u����萔���T�[�r�X�z�v��0�̏ꍇ�A���ׂɑ���萔���T�[�r�X�z�̍s��ǉ�
            if (CodChargeService > 0) {
                const CodChargeServiceInfo = {};
                CodChargeServiceInfo.record = salesOrder;
                CodChargeServiceInfo.item = DISCOUNT_ITEM.COD_CHARGE_SERVICE;// ����萔���T�[�r�X�z
                CodChargeServiceInfo.amount = CodChargeService;
                CodChargeServiceInfo.taxCd = TAX_CD.TEN_PER;
                CodChargeServiceInfo.dept = DEPT.LOGISTICS;
                addItemLine(CodChargeServiceInfo);
            }

            // 5.���z�̐������`�F�b�N
            // 5-1.���v�z�̐������`�F�b�N
            // NS�̏��v�z���擾
            const subtotalNs = salesOrder.getValue({
                fieldID: 'subtotal'
            });

            // �u���v�v�̗�C���f�b�N�X���擾����
            const subtotalCsvIndex = etonetLib.HEADER_INDEX.SUBTOTAL;
            // �u���v�v���擾����
            const subtotalCsv = headerDataObjList[subtotalCsvIndex];

            // �u���i�O�v�v�̗�C���f�b�N�X���擾����
            const extarnalTotalCsvIndex = etonetLib.HEADER_INDEX.EXTARNAL_TOTAL;
            // �u���i�O�v�v���擾����
            const extarnalTotalCsv = headerDataObjList[extarnalTotalCsvIndex];

            // NS�̏��v�z��CSV�̏��v+���i�O�v�̏ꍇ�A�G���[
            if (subtotalNs !== (subtotalCsv + extarnalTotalCsv)) {
                value.errorResult = ERROR_RESULT.SUBTOTAL_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }

            // 5-2.����Ŋz�̐������`�F�b�N
            // NS�̐ŋ����v���擾
            const consumptionTaxNs = salesOrder.getValue({
                fieldID: 'taxtotal'
            });

            // �u����Ŋz�v�̗�C���f�b�N�X���擾����
            const consumptionTaxIndex = etonetLib.HEADER_INDEX.TAX_AMOUNT;
            // �u����Ŋz�v���擾����
            const consumptionTax = headerDataObjList[consumptionTaxIndex];

            // NS�̐ŋ����v��CSV�̏���Ŋz���s��v�̏ꍇ�A�G���[
            if (consumptionTaxNs !== consumptionTax) {
                value.errorResult = ERROR_RESULT.CONSUMPTION_TAX_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }

            // ��������ۑ�
            salesOrder.save();

            // 7.�߂�l��ݒ�
            context.write({
                key: context.key,
                value: value
            });

        }
        catch (e) {
            log.error("�z��O�G���[", e.stack);
            let value = JSON.parse(context.value);
            value.errorResult = "��O�G���[";
            context.write({
                key: context.key,
                value: value
            });
        }
    }

    function summarize(summary) {
        log.debug("summarize�J�n")
        // 1.�G���[�L���̊m�F
        let errorFlg = false; // �G���[�L���t���O
        // �������ʂ����[�v����
        summary.output.iterator().each(function (key, value) {
            if (value.errorResult) {
                errorFlg = true;
                return false;
            }
            return true;
        });

        // 2.���s�t�@�C���̈ړ�
        // TODO:���ʊ֐��̍쐬�҂�

        // 3.�G���[�t�@�C���̍쐬
        const trandate = new Date();
        // �^�C���X�^���v���쐬(YYYYMMDDHHMISS)
        let timestamp = trandate.getFullYear() +
            ('0' + (trandate.getMonth() + 1)).slice(-2) +
            ('0' + trandate.getDate()).slice(-2) +
            ('0' + trandate.getHours()).slice(-2) +
            ('0' + trandate.getMinutes()).slice(-2) +
            ('0' + trandate.getSeconds()).slice(-2);

        let errorFile = file.create({
            name: constLib.ERROR_CSV_PREFIX + timestamp + ".csv",
            folder: constLib.CABINET.FOLDER.ETONET_ERROR_INFO_CSV,
            fileType: file.Type.CSV
        })

        // �w�b�_��񏑍�
        let errorCsvHeader = ERROR_CSV_HEADER.join(",");
        errorFile.appendLine({ value: errorCsvHeader });

        // 3-1.�G���[���̏�������
        let existError = false;
        if (errorFlg) {
            summary.output.iterator().each(function (key, value) {
                let tranResultList = JSON.parse(value);
                for (let i in tranResultList) {
                    existError = true;
                    let errorInfos = [];
                    errorInfos.push(tranResultList[i].errorResult)
                    errorInfos.push(tranResultList[i].errorContent)
                    errorInfos.push(key)
                    errorInfos.push(tranResultList[i].csv)
                    errorFile.appendLine({ value: errorInfos.join(",") });
                }
            });
        }

        // 3-2.�G���[�t�@�C���ۑ�
        if (existError) {
            errFileId = errorFile.save();
        }

        // 4.�󒍘A�g���ʃ��[�����M
        // ���[�����M��̃A�h���X�擾
        let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
        // ���[�������i�[
        const mailContent = {};
        mailContent.author = sendTo;
        mailContent.recipients = sendTo;
        mailContent.attachments.push(existError ? [errorFile] : null);

        // �G���[���[���𑗐M
        common.sendMail(mailContent, MESSAGE_ID.ORDERS_CREATE_MR);
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }

    /**
     * �A�C�e�����C���ɐV�K���׍s��ǉ�����
     * @param {*} params 
     * @param {Object*} params.record ���R�[�h
     * @param {String*} params.item �A�C�e��
     * @param {String*} params.amount ���z
     * @param {String*} params.taxCd �ŋ��R�[�h
     * @param {String*} params.dept ����
     * @return �Ȃ�
     */
        function addItemLine(params) {

            // ���׍s��ǉ�
            params.record.selectNewLine({ sublistId: 'item' });
            // �A�C�e����ݒ�
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.ITEM,
                value: params.item
            })

            // ���i������ݒ�
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.PRICE,
                value: "-1" // �J�X�^��
            })

            // ���z��ݒ�
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.AMOUNT,
                value: params.amount
            })

            // �ŋ��R�[�h��ݒ�
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.TAX_CD,
                value: params.taxCd
            })

            // �����ݒ�
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.DEPT,
                value: params.dept
            })

            // �A�C�e���T�u���X�g�Ō��ݑI������Ă��郉�C�����m��
            params.record.commitLine({
                sublistId: 'item'
            });
        }
    
})