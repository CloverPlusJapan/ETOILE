/**
 * ETONET_�\��E�o�וۗ��A�g
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @Version 1.0
 * @CreatedBy Mariya Sawada
 * @CreatedDate 2023/11/22
 */

define([
    "../LIBRARY/constant_lib.js",
    "../LIBRARY/common_lib.js",
    "./etonet_lib.js",
    "N/record",
    "N/search",
    "N/task",
    "N/format"
], function (
    constLib,
    common,
    etonetLib,
    record,
    search,
    task,
    format
) {
    /** �t�B�[���hID */
    // TODO:item:~���K�v���v����
    const FIELD_ID = {
        /** ����ID */
        INTERNAL_ID: 'internalid',
        /** �A�C�e�� */
        ITEM: 'item',
        /** ���� */
        QUANTITY: 'quantity',
        /** �ޔ� */
        CATEGORY_NUMBER: 'category_number',
        /** �i�� */
        PRODUCT_NUMBER: 'product_number',
        /** �J���[ */
        COLOR: 'color',
        /** �T�C�Y */
        SIZE: 'size',
        /** �ޕi�ԓo�^�� */
        REGISTRATION_DATE: 'product_registration_date',
        /** ���b�g�ԍ��t���A�C�e�� */
        LOT_NUMBER_ITEM: '',
        /** �ꏊ */
        LOCATION: 'location',
        /** ����i�A�C�e���F����j */
        DEPARTMENT: 'department',
        /** ETONET������ */
        ETONET_ALLOCATION_ALLOWED: 'custrecord_etonet_allocation_allowed',
        /** �����i�ꏊ�𖳌��ɂ���j */
        IS_INACTIV: 'isinactive',
        /** �L������ */
        EFFECTIVE_DATE: '',
        /** �A�C�e���F��� */
        ITEM_TYPE: '',
        /** �A�C�e���F�V���A��/���b�g�ԍ� */
        ITEM_SERIAL_LOT_NO: 'issueinventorynumber',
        /** ETONET�ԍ� */
        ETONET_NO: 'etonet_so_number',
        /** �O��ID */
        EXTERNAL_ID: 'externalid',
        /** �A�C�e���F�ŋ��R�[�h */
        TAX_CD: 'taxcode',
        /** �A�C�e���F���i���� */
        PRICE: 'price',
        /** �A�C�e���F���z */
        AMOUNT: 'amount',
        /** �[�ŃX�P�W���[�� */
        TAX_SCHEDULE: 'taxschedule', 
        /** �m�ۂ��m�F�ς� */
        // TODO:�v�t�B�[���hID����
        SECURE_CONFIRMED: '', 
        /** �m�ۍς� */
        SECURE_QUANTITY: 'quantitycommitted', 
        /** �A�C�e���FETONET��No */
        ETONET_ORDER_NUMBER: 'custcol_etonet_order_number', 
        /** �A�C�e���F�󒍓� */
        OEDER_DATE: 'custcol_order_date', 
        /** �A�C�e���F���ݏ�� */
        CURRENT_STATUS: 'custcol_current_status', 
        
    }

    /** ���ݏ�� */
    const CURRENT_STATUS = {
        /** �����҂� */
        WAITING_ALLOCATION: '0',
        /** �����ς� */
        ASSIGNED: '1',
        /** �����ς� */
        OEDERED: '2',
        /** ��� */
        CANCEL: '3',
        /** �����؂� */
        EXPIRED: '4',
    }

    /** �\��ԍ�1 */
    const RESERVE_NUMBER_1 = {
        /** �\�� */
        RESERVE: 'R',
        /** �o�וۗ� */
        SHIPPING_HOLD: 'T',
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
    }

    /** �G���[CSV�w�b�_�[ */
    const ERROR_CSV_HEADER = ["��������", "�G���[����", "�\��ԍ�", "CSV"]

    // TODO:���[����subject�Abody�̓J�X�^�����R�[�h����̎擾�ɗv�C��
    /** �G���[���[����� */
    const ERROR_MAIL_INFO = {
        SUBJECT: "�yNetSuite�zETONET�\��E�o�וۗ��A�g�����G���[",
        BODY: "ETONET�A�g�̗\��E�o�וۗ��A�g�����ɂāA�G���[���������܂����B\n�ڍׂ͓Y�t�t�@�C�������m�F���������B"
    }

    function getInputData() {
        log.debug("getInputData�J�n")
        try {
            let result = [];// �߂�l
            // 1.CSV�t�@�C���̃_�E�����[�h
            // 1-1.CSV�t�@�C���̃_�E�����[�h
            common.executeTrusted(); // TODO:���̂�����ύX���邩���H�@NS��̖������t�H���_�Ɋi�[
            // 1-2.�Ώۂ�CSV�t�@�C���̑��݃`�F�b�N
            // �������t�H���_���w�肷��
            const untreatedFolderId = etonetLib.FOLDER.UNTREATED.RESERVE;

            // �t�H���_���̃t�@�C��������
            const targetFileSearchType = search.type.FOLDER;
            const targetFileSearchFilters = [
                search.createFilter({ name: FIELD_ID.INTERNAL_ID, operator: search.Operator.IS, values: untreatedFolderId})
            ];
            const targetFileSearchColums = [
                search.createColumn({ name: file.internalid })// �t�@�C���F����ID
            ];
            const targetFileSearch = common.getSearchData(targetFileSearchType, targetFileSearchFilters, targetFileSearchColums);
            
            const fileObjList = [];
            // �t�H���_���̃t�@�C�����擾
            for (let targetFile of targetFileSearch) {
                let fileId = targetFile.getValue({ name: file.internalid });
                // �t�@�C�������[�h����
                let fileObj = file.load(fileId);
                fileObjList.push(fileObj);
            }

            // 2.ETONET����CSV�t�@�C���ړ�
            // TODO:���ʊ֐��쐬�҂��icommon.executeTrusted���Ŏ��s�H�j

            // 3.�t�@�C�����̎擾
            for (let fileObj of fileObjList) {
                let createEtonetNumberList = [];// �V�K�쐬�pETONET�ԍ����X�g
                let updateEtonetNumberList = [];// �X�V�pETONET�ԍ����X�g
                // �t�@�C�������擾
                const fileContent = fileObj.getContents();
                // ���s�ŕ���
                const csvRows = fileContent.split('\n');

                // �f�[�^�s�̏���(1�s�ڂ͍��ڃw�b�_�[�̂��ߑΏۊO)
                for (let rowNumber = 1; rowNumber < csvRows.length; rowNumber++) {
                    let rowData = csvRows[rowNumber].split(',');

                    // �\��ԍ�1~�\��ԍ��}�Ԃ��擾
                    let reservationNumber1 = rowData[etonetLib.RESERVE_INDEX.RESERVATION_NUMBER_1];
                    let reservationNumber2 = rowData[etonetLib.RESERVE_INDEX.RESERVATION_NUMBER_2];
                    let reservationNumber3 = rowData[etonetLib.RESERVE_INDEX.RESERVATION_NUMBER_3];
                    let reservationSubNumber = rowData[etonetLib.RESERVE_INDEX.RESERVATION_SUB_NUMBER];
                    // ���ݏ�Ԃ��擾
                    let currentStatus = rowData[etonetLib.RESERVE_INDEX.CURRENT_STATUS];
                    // ���������擾
                    let provisionedQuantity = rowData[etonetLib.RESERVE_INDEX.PROVISIONED_QUANTITY];
                    // ETONET�ԍ����擾����
                    let etonetNo = reservationNumber1 + "-" + reservationNumber2 + "-" + reservationNumber3 + "-" + reservationSubNumber;
                    // 3-1.�V�K�쐬�pETONET�ԍ��擾
                    if ((reservationNumber1 === "R" && currentStatus === CURRENT_STATUS.WAITING_ALLOCATION && provisionedQuantity === "0") || (reservationNumber1 === "T" && currentStatus === CURRENT_STATUS.ASSIGNED)) {
                        if (!createEtonetNumberList.includes(etonetNo)) {
                            createEtonetNumberList.push(etonetNo);
                        }
                    } else if (!updateEtonetNumberList.includes(etonetNo)) {
                        // 3-2.�X�V�pETONET�ԍ��擾
                        updateEtonetNumberList.push(etonetNo);
                    }
                    
                }
                // 4.�`�F�b�N�p���擾
                // 4-1.�ڋq�}�X�^�擾
                const customerSearchType = search.Type.CUSTOMER;
                const customerSearchFilters = [];
                const customerSearchColums = [];
                const customerSearch = common.getSearchData(customerSearchType, customerSearchFilters, customerSearchColums);

                // 4-2.�A�C�e���}�X�^�擾
                const itemSearchType = search.Type.ITEM;
                const itemSearchFilters = [];
                const itemSearchColums = [
                    search.createColumn({ name: FIELD_ID.CATEGORY_NUMBER }),
                    search.createColumn({ name: FIELD_ID.PRODUCT_NUMBER }),
                    search.createColumn({ name: FIELD_ID.COLOR }),
                    search.createColumn({ name: FIELD_ID.SIZE }),
                    search.createColumn({ name: FIELD_ID.REGISTRATION_DATE }),
                    search.createColumn({ name: FIELD_ID.LOT_NUMBER_ITEM }),
                    search.createColumn({ name: FIELD_ID.LOCATION }),
                    search.createColumn({ name: FIELD_ID.DEPARTMENT }),
                    search.createColumn({ name: FIELD_ID.AMOUNT }),// TODO:����i�̃t�B�[���hID�v����
                    search.createColumn({ name: FIELD_ID.TAX_SCHEDULE }),
                ];
                const itemSearch = common.getSearchData(itemSearchType, itemSearchFilters, itemSearchColums);

                // 4-3.�ꏊ�}�X�^�擾
                const locationSearchType = search.Type.LOCATION;
                const locationSearchFilters = [
                    [FIELD_ID.ETONET_ALLOCATION_ALLOWED,"is","T"], // �uETONET�����t���O�v���I��
                    "AND",
                    [FIELD_ID.IS_INACTIV,"is","F"] //�u�ꏊ�𖳌��ɂ���v���I�t
                ];
                const locationSearchColums = [];
                const locationSearch = common.getSearchData(locationSearchType, locationSearchFilters, locationSearchColums);

                // 4-4.�݌ɏڍ׃}�X�^�擾
                // �������̓��t���擾
                const today = new Date();
                // ����4-3�̏ꏊ���擾
                const locationList = locationSearch.id;
                const inventoryDetailSearchType = search.Type.INVENTORY_DETAIL;
                const inventoryDetailSearchFilters = [
                    [FIELD_ID.LOT_NUMBER_ITEM,"is","T"], // �u�A�C�e���F���b�g�ԍ��t���A�C�e���v��true
                    "AND",
                    [FIELD_ID.EFFECTIVE_DATE,"greaterthanorequalto", today], //�u�L�������v���������ȍ~
                    "AND",
                    [FIELD_ID.ITEM_TYPE,"is","�݌ɃA�C�e��"], //�u�A�C�e���F��ށv���݌ɃA�C�e��
                    "AND",
                    [FIELD_ID.LOCATION,"anyof", locationList] //�u�ꏊ�v������4-3�Ŏ擾�����ꏊ
                ];
                const inventoryDetailSearchColums = [
                    search.createColumn({ name: FIELD_ID.ITEM }),
                    search.createColumn({ name: FIELD_ID.QUANTITY }),
                    search.createColumn({ name: FIELD_ID.ITEM_SERIAL_LOT_NO }),
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
                    ["type","anyof","SalesOrd"], // ��ނ�������
                    "AND",
                    [FIELD_ID.ETONET_NO,"isnotempty"], //�uETONET�ԍ��v��null�ł͂Ȃ�
                    "AND",
                    [FIELD_ID.EXTERNAL_ID,"isnotempty"], //�u�O��ID�v��null�ł͂Ȃ�
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
                    let rowData = csvRows[rowNumber].split(',');

                    // 5.���̓`�F�b�N
                    errorDetail = etonetLib.validationCheck(etonetLib.RESERVE_INFO,rowData);

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
                    const membershipNumberIndex = etonetLib.RESERVE_INDEX.MEMBERSHIP_NUMBER;
                    // �}�X�^�̃��X�g�����������ă`�F�b�N
                    let customerCheck = customerSearch.some(function(item) {
                        return item.id === rowData[membershipNumberIndex];
                    })
                    if (!customerCheck) {
                        errorDetail.errorResult = ERROR_RESULT.CUSTOMER_MASTER_ERROR;
                        errorDetail.errorContent = "����ԍ�";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }
            
                    // 6-2.�A�C�e���}�X�^���݃`�F�b�N
                    const categoryNumberIndex = etonetLib.RESERVE_INDEX.CATEGORY_NUMBER;
                    const productNumberIndex = etonetLib.RESERVE_INDEX.PRODUCT_NUMBER;
                    const colorIndex = etonetLib.RESERVE_INDEX.COLOR;
                    const sizeIndex = etonetLib.RESERVE_INDEX.SIZE;
                    const registrationDateIndex = etonetLib.RESERVE_INDEX.PRODUCT_REGISTRATION_DATE;
                    // �`�F�b�N�Ώۂ̃A�C�e�����擾
                    let checkItem = rowData[categoryNumberIndex] + rowData[productNumberIndex] + rowData[colorIndex] + rowData[sizeIndex] + rowData[registrationDateIndex];
                    let itemCheck = itemSearch.some(function(item) {
                        return item.id === checkItem;
                    })
                    if (!itemCheck) {
                        errorDetail.errorResult = ERROR_RESULT.ITEM_MASTER_ERROR;
                        // TODO:�G���[���ڂ��u�ޕi�ԓo�^���v�ˁu���i�o�^���v�ɂ��������Ȃ���
                        errorDetail.errorContent = "�ޔԁA�i�ԁA�J���[�A�T�C�Y�A���i�o�^��";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        itemInternalId = itemSearch.id;
                        amount = itemSearch.getValue({ name: FIELD_ID.AMOUNT });// TODO:amount�Ŗ��Ȃ����m�F
                        taxCdInternalId = itemSearch.getValue({ name: FIELD_ID.TAX_SCHEDULE });
                        lotNoCheck = itemSearch.getValue({ name: FIELD_ID.LOT_NUMBER_ITEM });
                        itemDept = itemSearch.getValue({ name: FIELD_ID.DEPARTMENT });
                        resultObj.itemInternalId = itemInternalId;
                        resultObj.amount = amount;
                        resultObj.taxCdInternalId = taxCdInternalId;
                        resultObj.lotNoCheck = lotNoCheck;
                        resultObj.itemDept = itemDept;
                    }

                    // 6-3.�ꏊ�}�X�^���݃`�F�b�N
                    // �}�X�^�̃��X�g�����������ă`�F�b�N
                    let locationCheck = locationSearch.some(function(item) {
                        return item.id === itemSearch.getValue({ name: FIELD_ID.LOCATION });
                    })
                    if (!locationCheck) {
                        errorDetail.errorResult = ERROR_RESULT.LOCATION_MASTER_ERROR;
                        errorDetail.errorContent = "�ޔԁA�i�ԁA�J���[�A�T�C�Y�A���i�o�^��";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        locationInternalID = locationSearch.id;
                        resultObj.locationInternalID = locationInternalID; 
                    }

                    // 6-4.�݌ɏڍ׃}�X�^���݃`�F�b�N
                    // �u���b�g�ԍ��L���v��true�̎��̂ݎ��{
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
                        // ���������擾
                        let provisionedQuantity = rowData[etonetLib.RESERVE_INDEX.PROVISIONED_QUANTITY];
                        // �}�X�^�́u���ʁv�̍��v���������̏ꍇ�A�`�F�b�N�G���[
                        if (quantityTotal < provisionedQuantity) {
                            inventoryDetailCheck = false;
                        }

                        if (!inventoryDetailCheck) {
                            errorDetail.errorResult = ERROR_RESULT.INVENTORY_DETAIL_MASTER_ERROR;
                            errorDetail.errorContent = "�ޔԁA�i�ԁA�J���[�A�T�C�Y�A���i�o�^��";
                            resultObj.errorResult = errorDetail.errorResult;
                            resultObj.errorContent = errorDetail.errorContent;
                            resultObj.csv = csvRows[rowNumber];
                            result.push(resultObj);
                            continue;
                            
                        }else{
                            const inventoryDetailList = [];
                            const inventoryDetailObj = {};
                            for (const result of subjectList) {
                                const resultQuantity = result.getValue({ name: FIELD_ID.QUANTITY });
                                if (resultQuantity < provisionedQuantity) {

                                    inventoryDetailObj.lotNumber = result.getValue({ name: FIELD_ID.ITEM_SERIAL_LOT_NO });
                                    inventoryDetailObj.quantity = resultQuantity;
                                    inventoryDetailList.push(inventoryDetailObj);

                                    provisionedQuantity = provisionedQuantity - resultQuantity;
                                }else{
                                    inventoryDetailObj.lotNumber = result.getValue({ name: FIELD_ID.ITEM_SERIAL_LOT_NO });
                                    inventoryDetailObj.quantity = provisionedQuantity;
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
                        // �A�C�e���}�X�^����擾�����[�ŃX�P�W���[�����擾
                        const taxCode = resultObj.taxCdInternalId;
                        // �}�X�^�ɑ��݂����ꍇ�Atrue��Ԃ�
                        return item.id === taxCode;
                    })
                    if (!taxCdCheck) {
                        errorDetail.errorResult = ERROR_RESULT.TAX_CD_MASTER_ERROR;
                        errorDetail.errorContent = "�ޔԁA�i�ԁA�J���[�A�T�C�Y�A���i�o�^��";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }

                    // 6-6.�]�ƈ��}�X�^���݃`�F�b�N
                    const employeeIndex = etonetLib.RESERVE_INDEX.OPERATION_PROXY;
                    // �}�X�^�̃��X�g�����������ă`�F�b�N
                    let employeeCheck = employeeSearch.some(function(item) {
                        return item.id === rowData[employeeIndex];
                    })
                    if (!employeeCheck) {
                        errorDetail.errorResult = ERROR_RESULT.EMPLOYEE_MASTER_ERROR;
                        errorDetail.errorContent = "�����s��";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }

                    // 7.���������݃`�F�b�N

                    // �}�X�^��ETONET�ԍ����擾���A���X�g�Ɋi�[����
                    const salesOrderEtonetNoList = [];
                    const salesOrderIdList = [];
                    for (const salesOrderData of salesOrderSearch) {
                        let etonetNumber = salesOrderData.getValue({ name: FIELD_ID.ETONET_NO });
                        salesOrderIdList.push(salesOrderData.id);
                        salesOrderEtonetNoList.push(etonetNumber);
                    }

                    // 7-1.�\��ԍ�1��"R"(�\��)�����ݏ�Ԃ������҂�("0")����������"0"�A�܂��͗\��ԍ�1��"T"(�o�וۗ�)�����ݏ�Ԃ������ς�("1")�̏ꍇ
                    let salesOrderCheck;
                    if ((reservationNumber1 === "R" && currentStatus === CURRENT_STATUS.WAITING_ALLOCATION && provisionedQuantity === "0") || (reservationNumber1 === "T" && currentStatus === CURRENT_STATUS.ASSIGNED)) {
                        // �}�X�^�̃��X�g�����������ă`�F�b�N
                        const createCheckLists = {};
                        createCheckLists.masterList = salesOrderEtonetNoList;
                        createCheckLists.subjectList = createEtonetNumberList;
                        createCheckLists.matchCheck = false;
                        salesOrderCheck = checkList(createCheckLists);
                    }else{
                        // 7-2.��L�ȊO�̏ꍇ
                        // �}�X�^�̃��X�g�����������ă`�F�b�N
                        const updateCheckLists = {};
                        updateCheckLists.masterList = salesOrderEtonetNoList;
                        updateCheckLists.subjectList = updateEtonetNumberList;
                        updateCheckLists.matchCheck = true;
                        salesOrderCheck = checkList(updateCheckLists);
                    }
                    if (!salesOrderCheck) {
                        errorDetail.errorResult = ERROR_RESULT.SALES_ORDER_EXIST_ERROR;
                        errorDetail.errorContent = "ETONET�ԍ�";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        const getInternalIdConditions = {};
                        getInternalIdConditions.subjectEtonetNo = etonetNo;
                        getInternalIdConditions.etonetNoList = salesOrderEtonetNoList;
                        getInternalIdConditions.internalIdList = salesOrderIdList;
                        // �X�V�Ώۂ̒���������ID��ǉ�
                        resultObj.salesOrderId = getMatchInternalId(getInternalIdConditions);
                        // ETONET�ԍ���ǉ�
                        resultObj.etonetNo = etonetNo;
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
        const value = JSON.parse(context.value);
        log.debug("map�J�n")
        for (let contextRow = 0; value && contextRow < value.length; contextRow++) {
            // ETONET�ԍ����擾
            let keyEtonetNo = value.etonetNo;
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
            let value = JSON.parse(context.value);
            // 1.�������ʊm�F
            if (context.errorResult !== ERROR_RESULT.SUCCESS) {
                // �߂�l��ݒ肵�ď������I��
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }

            // 2.CSV���擾
            const reserveDataObjList = []; // CSV���i�[�p���X�g
            for (let contextLine = 1; contextLine < value.length; contextLine++) {
                // �l���擾
                const contextValue = value[contextLine];
                // csv�����擾
                const contextCsv = contextValue.csv.split(',');
                // CSV���i�[�p�I�u�W�F�N�g
                const reserveData = {};
                // �ݒ�ςݍ��ڃ��X�g
                const setFeildIdList = [];

                // �O��ID��ݒ�
                reserveData[FIELD_ID.EXTERNAL_ID] = contextValue.etonetNo;
                setFeildIdList.push(FIELD_ID.EXTERNAL_ID);
                // ETONET�ԍ���ݒ�
                reserveData[FIELD_ID.ETONET_NO] = contextValue.etonetNo;
                setFeildIdList.push(FIELD_ID.ETONET_NO);
                // �A�C�e���F�A�C�e����ݒ�
                reserveData[FIELD_ID.ITEM] = contextValue.itemInternalId;
                setFeildIdList.push(FIELD_ID.ITEM +':'+ FIELD_ID.ITEM);
                // �A�C�e���F�ŋ��R�[�h��ݒ�
                reserveData[FIELD_ID.TAX_CD] = contextValue.taxCdInternalId;
                setFeildIdList.push(FIELD_ID.ITEM +':'+ FIELD_ID.TAX_CD);
                // �A�C�e���F�����ݒ�
                reserveData[FIELD_ID.DEPARTMENT] = contextValue.itemDept;
                setFeildIdList.push(FIELD_ID.ITEM +':'+ FIELD_ID.DEPARTMENT);
                // �A�C�e���F�ꏊ��ݒ�
                reserveData[FIELD_ID.LOCATION] = contextValue.locationInternalID;
                setFeildIdList.push(FIELD_ID.ITEM +':'+ FIELD_ID.LOCATION);

                for (let dataRow = 0; dataRow < contextCsv.length; dataRow++) {
                    // �t�B�[���hID���擾
                    const fieldId = etonetLib.findReserveByIndex(dataRow).fieldId;
                    // �t�B�[���hID�����݂��A�ݒ�ς݂̃t�B�[���hID�ȊO�̏ꍇ�A�I�u�W�F�N�g�Ƀf�[�^��ݒ�
                    if(fieldId && setFeildIdList.indexOf(fieldId) < 0){
                        reserveData[fieldId] = contextCsv[dataRow];
                    }
                }

                // �\��ԍ�1��ݒ�
                reserveData.reserveNumber1 = contextCsv[etonetLib.RESERVE_INDEX.RESERVATION_NUMBER_1];
                // ��������ݒ�
                reserveData.provisionedQuantity = contextCsv[etonetLib.RESERVE_INDEX.PROVISIONED_QUANTITY];
                // �\�񐔂�ݒ�
                reserveData.reserveQuantity = contextCsv[etonetLib.RESERVE_INDEX.RESERVE_QUANTITY];
                // �݌ɏڍ�
                if (contextValue.inventoryDetailList) {
                    reserveData.inventoryDetailList = contextValue.inventoryDetailList;
                }

                // �����̒����������݂���ꍇ�A�������̓���ID���擾
                if (contextValue.salesOrderId) {
                    reserveData.salesOrderId = contextValue.salesOrderId;
                }

                reserveDataObjList.push(reserveData);
            }

            // 3.�������̍쐬�E�X�V
            for (let dataLine = 1; dataLine < reserveDataObjList.length; dataLine++) {
                // �\��ԍ�1���擾
                const reserveNumber1 = reserveDataObjList[dataLine].reservationNumber1;
                // ���ݏ�Ԃ��擾
                const currentStatusFieldId = etonetLib.findReserveByIndex(etonetLib.RESERVE_INDEX.CURRENT_STATUS).fieldid;
                const currentStatus = reserveDataObjList[dataLine][currentStatusFieldId];
                // ���������擾
                const provisionedQuantity = reserveDataObjList[dataLine].provisionedQuantity;
                
                // 3-1.�\�񁕊����҂�����������0�A�܂��͏o�וۗ��������ς݂̏ꍇ
                if ((reserveNumber1 === RESERVE_NUMBER_1.RESERVE && currentStatus === CURRENT_STATUS.WAITING_ALLOCATION && provisionedQuantity === "0") || (reserveNumber1 === RESERVE_NUMBER_1.SHIPPING_HOLD && currentStatus === CURRENT_STATUS.ASSIGNED)) {
                    // ���������R�[�h��V�K�쐬
                    const salesOrder = record.create({
                        type: record.Type.SALES_ORDER,
                        isDynamic: true
                    });

                    // �u���������ڂ̈ꗗ���X�g
                    const replaceFieldList = [];

                    // ETONET�ԍ���ݒ�
                    salesOrder.setValue({
                        fieldID: FIELD_ID.ETONET_NO,
                        value: reserveDataObjList[dataLine][FIELD_ID.ETONET_NO]
                    })
                    replaceFieldList.push(FIELD_ID.ETONET_NO);

                    // �O��ID��ݒ�
                    salesOrder.setValue({
                        fieldID: FIELD_ID.EXTERNAL_ID,
                        value: reserveDataObjList[dataLine][FIELD_ID.EXTERNAL_ID]
                    })
                    replaceFieldList.push(FIELD_ID.EXTERNAL_ID);
                
                    // ���׍s��ǉ�
                    salesOrder.selectNewLine({ sublistId: 'item' });

                    // �A�C�e����ݒ�
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.ITEM,
                        value: reserveDataObjList[dataLine][FIELD_ID.ITEM]
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.ITEM);

                    // �ꏊ��ݒ�
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.LOCATION,
                        value: reserveDataObjList[dataLine][FIELD_ID.LOCATION]
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.LOCATION);

                    // �ŋ��R�[�h��ݒ�
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.TAX_CD,
                        value: reserveDataObjList[dataLine][FIELD_ID.TAX_CD]
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.TAX_CD);

                    // ���ʂ�ݒ�i�\�񐔂̒l��ݒ�j
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.QUANTITY,
                        value: reserveDataObjList[dataLine].reserveQuantity
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.QUANTITY);

                    // �����ݒ�
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.DEPARTMENT,
                        value: reserveDataObjList[dataLine][FIELD_ID.DEPARTMENT]
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.DEPARTMENT);

                    // �o�וۗ��������ς݂̏ꍇ
                    if (reserveNumber1 === RESERVE_NUMBER_1.SHIPPING_HOLD && currentStatus === CURRENT_STATUS.ASSIGNED) {
                        // �m�ۂ��m�F�ς݂�ݒ�
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.SECURE_CONFIRMED,
                            value: true
                        })
                    }
                    for (let reserveLine = 0; reserveLine < etonetLib.RESERVE_INFO.length; reserveLine++) {
                        if (etonetLib.RESERVE_INFO[reserveLine].fieldid !== null) {
                            // �ݒ肷��t�B�[���hID���擾
                            let currentFieldId = etonetLib.RESERVE_INFO[reserveLine].fieldid;
                            // �ݒ�ςݍ��ڈȊO�̏ꍇ
                            if (replaceFieldList.indexOf(currentFieldId) < 0) {
                                if (currentFieldId.indexOf("item:") === 0) {
                                    // ���׍s��I������
                                    salesOrder.selectLine({
                                        sublistId: 'item',
                                        line: 0
                                    });
                                    // ���׍s�ɒl��ݒ肷��
                                    salesOrder.setCurrentSublistValue({
                                        sublistId: 'item',
                                        // �t�B�[���hID���uitem:~�v�Ŏn�܂��Ă��邽�߁A5�����ڈȍ~��ݒ�
                                        fieldID: currentFieldId.slice(5),
                                        value: reserveDataObjList[dataLine][currentFieldId]
                                    })
                                }else{
                                    salesOrder.setValue({
                                        fieldID: currentFieldId,
                                        value: reserveDataObjList[dataLine][currentFieldId]
                                    })

                                }
                            }
    
                            // �݌ɏڍׂ����鎞�A�݌ɏڍׂ�ݒ�
                            if (reserveDataObjList[dataLine].inventoryDetailList) {
    
                                // �݌ɏڍ׃T�u���R�[�h�̍쐬
                                const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                });
    
                                // �݌ɏڍׂ̃��C����ݒ�
                                reserveDataObjList[dataLine].inventoryDetailList.forEach(function (detail) {
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
                        }
                    }

                    // ��������ۑ�
                    salesOrder.save();

                // 3-2.�\�񁕊����҂�����������0�ȊO�̏ꍇ
                } else if (reserveNumber1 === RESERVE_NUMBER_1.RESERVE && currentStatus === CURRENT_STATUS.WAITING_ALLOCATION && provisionedQuantity !== "0") {
                    // �X�V�Ώۂ̒������̓���ID���擾
                    const salesOrderId = reserveDataObjList[dataLine].salesOrderId;
                    // ���������R�[�h��ǂݍ���
                    const salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId,
                        isDynamic: true
                    });

                    // �ݒ�ςݍ��ڂ̃��X�g
                    const setItemsList = [];

                    // ETONET�ԍ���ݒ�
                    salesOrder.setValue({
                        fieldID: FIELD_ID.ETONET_NO,
                        value: reserveDataObjList[dataLine][FIELD_ID.ETONET_NO]
                    })
                    setItemsList.push(FIELD_ID.ETONET_NO);

                    // �O��ID��ݒ�
                    salesOrder.setValue({
                        fieldID: FIELD_ID.EXTERNAL_ID,
                        value: reserveDataObjList[dataLine][FIELD_ID.EXTERNAL_ID]
                    })
                    setItemsList.push(FIELD_ID.EXTERNAL_ID);

                    for (let reserveLine = 0; reserveLine < etonetLib.RESERVE_INFO.length; reserveLine++) {
                        // �ݒ肷��t�B�[���hID���擾
                        let currentFieldId = etonetLib.RESERVE_INFO[reserveLine].fieldid;
                        // �A�C�e�����C�����ڃ`�F�b�N
                        const itemFieldIdChk = currentFieldId.indexOf("item:");
                        // �ݒ�ςݍ��ڏd���`�F�b�N
                        const fieldIdDuplicationChk = setItemsList.indexOf(currentFieldId);
                        // �t�B�[���hID�����݂��違�A�C�e�����C���̃t�B�[���hID�ł͂Ȃ����ݒ�ςݍ��ڂł͂Ȃ��ꍇ
                        if (currentFieldId !== null && itemFieldIdChk < 0 && fieldIdDuplicationChk < 0) {
                            // �{�f�B�����̒l��ݒ肷��
                            salesOrder.setValue({
                                fieldID: etonetLib.RESERVE_INFO[reserveLine].fieldid,
                                value: reserveDataObjList[dataLine][currentFieldId]
                            })
                        }
                    }

                    // ���ׂ�1�s�ڂ�I������
                    salesOrder.selectLine({
                        sublistId: 'item',
                        line: 0
                    });

                    // ���ʂ�ݒ�i��������ݒ�j
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.QUANTITY,
                        value: reserveDataObjList[dataLine].provisionedQuantity
                    })

                    // �m�ۍς݂�ݒ�i��������ݒ�j
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.SECURE_QUANTITY,
                        value: reserveDataObjList[dataLine].provisionedQuantity
                    })

                    // �m�ۂ��m�F�ς݂�ݒ�
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.SECURE_CONFIRMED,
                        value: true
                    })

                    // �݌ɏڍׂ����鎞�A�݌ɏڍׂ�ݒ�
                    if (reserveDataObjList[dataLine].inventoryDetailList) {

                        // �݌ɏڍ׃T�u���R�[�h�̍쐬
                        const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                        });

                        // �݌ɏڍׂ̃��C����ݒ�
                        reserveDataObjList[dataLine].inventoryDetailList.forEach(function (detail) {
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


                    // ���ׂ̍s�����擾����
                    const detailLineCount = salesOrder.getLineCount({
                        sublistId: 'item'
                    });

                    if (detailLineCount >= 2) {
                        // ���ׂ�2�s�ڂ�I������
                        salesOrder.selectLine({
                            sublistId: 'item',
                            line: 1
                        });
                    }else{
                        // ���ׂ�2�s�ڂ��쐬����
                        salesOrder.selectNewLine({ sublistId: 'item' });
                    }

                    // �u���������ڂ̈ꗗ���X�g
                    const replaceFieldList = [];

                    // ���ʂ�ݒ�
                    const subQuantity = reserveDataObjList[dataLine].reserveQuantity - reserveDataObjList[dataLine].provisionedQuantity;
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.QUANTITY,
                        value: subQuantity
                    })
                    replaceFieldList.push(FIELD_ID.QUANTITY);
                    
                    for (let reserveLine = 0; reserveLine < etonetLib.RESERVE_INFO.length; reserveLine++) {
                        if (etonetLib.RESERVE_INFO[reserveLine].fieldid !== null) {
                            // �ݒ肷��t�B�[���hID���擾
                            let currentFieldId = etonetLib.RESERVE_INFO[reserveLine].fieldid;
                            // �ݒ�ςݍ��ڈȊO���t�B�[���hID���A�C�e�����C���̂��̂̏ꍇ
                            if (replaceFieldList.indexOf(currentFieldId) < 0 && currentFieldId.indexOf("item:") === 0) {
                                // ���׍s�ɒl��ݒ肷��
                                salesOrder.setCurrentSublistValue({
                                    sublistId: 'item',
                                    // �t�B�[���hID���uitem:~�v�Ŏn�܂��Ă��邽�߁A5�����ڈȍ~��ݒ�
                                    fieldID: currentFieldId.slice(5),
                                    value: reserveDataObjList[dataLine][currentFieldId]
                                })
                            }
                        }
                    }

                    // �݌ɏڍׂ����鎞�A�݌ɏڍׂ�ݒ�
                    if (reserveDataObjList[dataLine].inventoryDetailList) {

                        // �݌ɏڍ׃T�u���R�[�h�̍쐬
                        const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                        });

                        // �݌ɏڍׂ̃��C����ݒ�
                        reserveDataObjList[dataLine].inventoryDetailList.forEach(function (detail) {
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

                    // �A�C�e���T�u���X�g�Ō��ݑI������Ă��郉�C�����m��
                    salesOrder.commitLine({
                        sublistId: 'item'
                    });


                    // ��������ۑ�
                    salesOrder.save();

                // 3-3.�\�񁕊����ς݂̏ꍇ
                } else if (reserveNumber1 === RESERVE_NUMBER_1.RESERVE && currentStatus === CURRENT_STATUS.ASSIGNED) {
                    // �X�V�Ώۂ̒������̓���ID���擾
                    const salesOrderId = reserveDataObjList[dataLine].salesOrderId;
                    // ���������R�[�h��ǂݍ���
                    const salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId,
                        isDynamic: true
                    });

                    // ���ׂ�1�s�ڂ�I������
                    salesOrder.selectLine({
                        sublistId: 'item',
                        line: 0
                    });

                    // ���ʂ�ݒ�i��������ݒ�j
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.QUANTITY,
                        value: reserveDataObjList[dataLine].provisionedQuantity
                    })

                    // �m�ۍς݂�ݒ�i��������ݒ�j
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.SECURE_QUANTITY,
                        value: reserveDataObjList[dataLine].provisionedQuantity
                    })

                    // �m�ۂ��m�F�ς݂�ݒ�
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.SECURE_CONFIRMED,
                        value: true
                    })

                    // �݌ɏڍׂ����鎞�A�݌ɏڍׂ�ݒ�
                    if (reserveDataObjList[dataLine].inventoryDetailList) {

                        // �݌ɏڍ׃T�u���R�[�h�̍쐬
                        const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                        });

                        // �݌ɏڍׂ̃��C����ݒ�
                        reserveDataObjList[dataLine].inventoryDetailList.forEach(function (detail) {
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

                    // ���ׂ̍s�����擾
                    const detailLineCount = salesOrder.getLineCount({
                        sublistId: 'item'
                    });
                    // ���׍s��2�s�ȏ㑶�݂���ꍇ
                    if (detailLineCount >= 2) {
                        for (let detailLine = detailLineCount-1; detailLine >= 1; detailLine--) {
                            // 2�s�ڈȍ~�̖��ׂ��폜
                            salesOrder.removeLine({
                                sublistId: 'item',
                                line: detailLine
                            });
                        }
                    }

                    // ��������ۑ�
                    salesOrder.save();

                // 3-4.��L�ȊO�̏ꍇ
                } else {
                    // �X�V�Ώۂ̒������̓���ID���擾
                    const salesOrderId = reserveDataObjList[dataLine].salesOrderId;
                    // ���������R�[�h��ǂݍ���
                    const salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId,
                        isDynamic: true
                    });

                    // �X�V���Ȃ��l��ݒ�
                    const replaceFieldList = [];

                    // ETONET�ԍ���ݒ�
                    salesOrder.setValue({
                        fieldID: FIELD_ID.ETONET_NO,
                        value: reserveDataObjList[dataLine][FIELD_ID.ETONET_NO]
                    })
                    replaceFieldList.push(FIELD_ID.ETONET_NO);

                    // �O��ID��ݒ�
                    salesOrder.setValue({
                        fieldID: FIELD_ID.EXTERNAL_ID,
                        value: reserveDataObjList[dataLine][FIELD_ID.EXTERNAL_ID]
                    })
                    replaceFieldList.push(FIELD_ID.EXTERNAL_ID);

                    // ���ׂ̍s�����擾
                    const detailLineCount = salesOrder.getLineCount({
                        sublistId: 'item'
                    });
                    for (let detailLine = 0; detailLine < detailLineCount; detailLine++) {
                        // ���ׂ̍s��I������
                        salesOrder.selectLine({
                            sublistId: 'item',
                            line: detailLine
                        });
                        
                        // �������I����true�ɂ���
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.SECURE_CONFIRMED,
                            value: true
                        })
                        replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.SECURE_CONFIRMED);
        
                        // �A�C�e����ݒ�
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.ITEM,
                            value: reserveDataObjList[dataLine][FIELD_ID.ITEM]
                        })
                        replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.ITEM);

                        // �ꏊ��ݒ�
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.LOCATION,
                            value: reserveDataObjList[dataLine][FIELD_ID.LOCATION]
                        })
                        replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.LOCATION);

                        // �ŋ��R�[�h��ݒ�
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.TAX_CD,
                            value: reserveDataObjList[dataLine][FIELD_ID.TAX_CD]
                        })
                        replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.TAX_CD);

                        // �A�C�e���T�u���X�g�Ō��ݑI������Ă��郉�C�����m��
                        salesOrder.commitLine({
                            sublistId: 'item'
                        });
                    }

                    for (let reserveLine = 0; reserveLine < etonetLib.RESERVE_INFO.length; reserveLine++) {
                        if (etonetLib.RESERVE_INFO[reserveLine].fieldid !== null) {
                            // �ݒ肷��t�B�[���hID���擾
                            let currentFieldId = etonetLib.RESERVE_INFO[reserveLine].fieldid;
                            // �ݒ�ςݍ��ڈȊO���t�B�[���hID���A�C�e�����C���̂��̂̏ꍇ��
                            if (replaceFieldList.indexOf(currentFieldId) < 0 && currentFieldId.indexOf("item:") === 0) {
                                // ���ׂ̍s��I������
                                salesOrder.selectLine({
                                    sublistId: 'item',
                                    line: 0
                                });
                                // ���׍s�ɒl��ݒ肷��
                                salesOrder.setCurrentSublistValue({
                                    sublistId: 'item',
                                    // �t�B�[���hID���uitem:~�v�Ŏn�܂��Ă��邽�߁A5�����ڈȍ~��ݒ�
                                    fieldID: currentFieldId.slice(5),
                                    value: reserveDataObjList[dataLine][currentFieldId]
                                })
                                if (detailLineCount === 2){
                                    // ���ׂ̍s��I������
                                    salesOrder.selectLine({
                                        sublistId: 'item',
                                        line: 1
                                    });
                                    // ���׍s�ɒl��ݒ肷��
                                    salesOrder.setCurrentSublistValue({
                                        sublistId: 'item',
                                        // �t�B�[���hID���uitem:~�v�Ŏn�܂��Ă��邽�߁A5�����ڈȍ~��ݒ�
                                        fieldID: currentFieldId.slice(5),
                                        value: reserveDataObjList[dataLine][currentFieldId]
                                    })
                                }
                            }else{
                                salesOrder.setValue({
                                    fieldID: currentFieldId,
                                    value: reserveDataObjList[dataLine][currentFieldId]
                                })
                            }
                        }
                    }

                    // ��������ۑ�
                    salesOrder.save();

                }
            }

            // 5.�߂�l��ݒ�
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
        let summaryValue = JSON.parse(summary.value);
        // 1.�G���[�L���̊m�F
        let errorFlg = false; // �G���[�L���t���O
        // �������ʂ����[�v����
        summaryValue.output.iterator().each(function (key, value) {
            if (value.errorResult) {
                errorFlg = true;
                return false;
            }
            return true;
        });

        // 2.���s�t�@�C���̈ړ�
        // TODO:���ʊ֐��̍쐬�҂�

        // 3.�G���[�t�@�C���̍쐬
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
            summaryValue.output.iterator().each(function (key, value) {
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

        // 4.�\��E�o�וۗ��A�g���ʃ��[�����M
        // ���[�����M��̃A�h���X�擾
        let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
        // TODO:���[����subject�Abody�̓J�X�^�����R�[�h(customrecord_error_mail_info)����̎擾�ɗv�C��
        let mailSubject = ERROR_MAIL_INFO.SUBJECT;
        let mailBody = ERROR_MAIL_INFO.BODY;

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
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }

    /**
     * ����Ώۃ��X�g�̒l�ƃ}�X�^���X�g���̒l���r����`�F�b�N
     * @param {*} params 
     * @param {List*} params.subjectList ����Ώۃ��X�g
     * @param {List*} params.masterList �}�X�^���X�g
     * @param {Boolean*} params.matchCheck ��v�`�F�b�N
     * @return {Boolean}
     */
    function checkList(params) {
        for (let masterListLine; masterListLine < params.masterList.length; masterListLine++) {
            if (params.matchCheck && !params.subjectList.includes(params.masterList[masterListLine])) {
                // �}�X�^�ɂȂ��l���ݒ肳��Ă�����false��Ԃ�
                return false;
            }
            if (!params.matchCheck && params.subjectList.includes(params.masterList[masterListLine])) {
                // �}�X�^�ɑ��݂���l���ݒ肳��Ă�����false��Ԃ�
                return false;
            }
        }
        return true;
    }

    /**
     * ����Ώۂƈ�v����ETONET�ԍ������������̓���ID���擾����
     * @param {*} params 
     * @param {String*} params.subjectEtonetNo ����Ώۂ�ETONET�ԍ�
     * @param {List*} params.etonetNoList ETONET�ԍ����X�g
     * @param {List*} params.internalIdList ����ID���X�g
     * @return {String} �������̓���ID
     */
    function getMatchInternalId(params) {
        for (let etonetNoListLine; etonetNoListLine < params.etonetNoList.length; etonetNoListLine++) {
            if (params.subjectEtonetNo === params.etonetNoList[etonetNoListLine]) {
                return internalIdList[etonetNoListLine];
            }
        }
        return null;
    }
})