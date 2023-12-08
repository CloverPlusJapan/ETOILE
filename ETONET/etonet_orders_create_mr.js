/**
 * ETONET_受注連携
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
    /** フィールドID */
    const FIELD_ID = {
        /** アイテム：(Filter用) */
        ITEM_FEILD: 'item.',
        /** 内部ID */
        INTERNAL_ID: 'internalid',
        /** アイテム */
        ITEM: 'item',
        /** アイテム：場所 */
        ITEM_LOCATION: 'location',
        /** 数量 */
        QUANTITY: 'quantity',
        /** 類番 */
        CATEGORY_NUMBER: 'custitem_category_number',
        /** 品番 */
        PRODUCT_NUMBER: 'custitem_product_number',
        /** カラー */
        COLOR: 'custitem_color',
        /** サイズ */
        SIZE: 'custitem_size',
        /** 類品番登録日 */
        REGISTRATION_DATE: 'custitem_product_registration_date',
        /** ロット番号付きアイテム */
        LOT_NUMBER_ITEM: 'islotitem',
        /** 場所 */
        LOCATION: 'location',
        /** 部門 */
        DEPARTMENT: 'department',
        /** ETONET引当可 */
        ETONET_ALLOCATION_ALLOWED: 'custrecord_etonet_allocation_allowed',
        /** 無効（場所を無効にする） */
        IS_INACTIV: 'isinactive',
        /** 有効期限 */
        EFFECTIVE_DATE: 'expirationdate',
        /** アイテム：種類 */
        ITEM_TYPE: 'type',
        /** アイテム：シリアル/ロット番号 */
        ITEM_SERIAL_LOT_NO: 'serialnumber',
        /** ETONET番号 */
        ETONET_NO: 'custbody_etonet_so_number',
        /** 外部ID */
        EXTERNAL_ID: 'externalid',
        /** アイテム：税金コード */
        TAX_CD: 'taxcode',
        /** アイテム：価格水準 */
        PRICE: 'price',
        /** アイテム：金額 */
        AMOUNT: 'amount',
        // TODO:部門は「dept」「department」両方存在するものか要確認
        /** アイテム：部門 */
        DEPT: 'dept', 
        /** ETONET伝票種類 */
        TRAN_TYPE: 'custbody_etonet_tran_type',
        /** アイテムID */
        ITEM_ID: 'itemid',
    }

    /** ディスカウント用アイテム */
    // TODO:NSに登録され次第追記
    const DISCOUNT_ITEM = {
        /** お客様価格変更 */
        COSTOMER_PRICE: '',
        /** セール値引 */
        SALE_DISCOUNT: '649',
        /** 価格変更 */
        PRICE_CHANGE: '',
        /** クーポン値引 */
        COUPON_DISCOUNT: '',
        /** 送料サービス */
        POSTAGE_SERVICE: '666',
        /** 代引手数料サービス */
        COD_CHARGE_SERVICE: '',
    }

    /** 配送関連アイテム */
    // TODO:NSに登録され次第追記
    const DELIVERY_ITEM = {
        /** 送料 */
        POSTAGE: '645',
        /** 代引手数料 */
        COD_CHARGE: '',
    }

    /** 部門 */
    const DEPT = {
        /** 営業本部 */
        SALES_DIVISION: '3',
        /** ロジスティクス部 */
        LOGISTICS: '23',
    }

    /** 税金コード */
    const TAX_CD = {
        /** 軽減税率8％ */
        EIGHT_PER: '11',
        /** 10% */
        TEN_PER: '10',
        /** 非課税 */
        NO_TAX: '9',
    }

    /** 適用消費税コード */
    const APPLY_TAX_CD = {
        /** 軽減税率8％ */
        EIGHT_PER: '02',
        /** 10% */
        TEN_PER: '03',
        /** 非課税 */
        NO_TAX: '05',
    }

    /** データ区分 */
    const DATA_PARTITION = {
        /** ヘッダー */
        HEADER: '1',
        /** 明細 */
        DETAIL: '2',
        /** メール明細 */
        MAIL: '3',
        /** 消費税明細 */
        TAX: '4',
    }

    /** ETONET伝票種類 */
    const SALES_TYPE = {
        ORDER: '1' // 受注
    }

    /** 処理結果 */
    const ERROR_RESULT = {
        /** 正常 */
        SUCCESS: '正常',
        /** 顧客マスタエラー */
        CUSTOMER_MASTER_ERROR: '顧客マスタ存在チェックエラー',
        /** アイテムマスタエラー */
        ITEM_MASTER_ERROR: 'アイテムマスタ存在チェックエラー',
        /** 場所マスタエラー */
        LOCATION_MASTER_ERROR: '場所マスタ存在チェックエラー',
        /** 在庫詳細マスタエラー */
        INVENTORY_DETAIL_MASTER_ERROR: '在庫詳細マスタ存在チェックエラー',
        /** 税金コードマスタエラー */
        TAX_CD_MASTER_ERROR: '税金コード存在チェックエラー',
        /** 従業員マスタエラー */
        EMPLOYEE_MASTER_ERROR: '従業員存在チェックエラー',
        /** 注文書存在エラー */
        SALES_ORDER_EXIST_ERROR: '注文書存在チェックエラー',
        /** ヘッダ有無チェックエラー */
        HEADER_EXIST_ERROR: 'ヘッダ有無チェックエラー',
        /** 明細有無チェックエラー */
        DETAIL_EXIST_ERROR: '明細有無チェックエラー',
        /** メール明細有無チェックエラー */
        MAIL_EXIST_ERROR: 'メール明細有無チェックエラー',
        /** 消費税明細有無チェックエラー */
        TAX_EXIST_ERROR: '消費税明細有無チェックエラー',
        /** 小計額不一致エラー */
        SUBTOTAL_ERROR: '小計額不一致エラー',
        /** 税金合計不一致エラー */
        CONSUMPTION_TAX_ERROR: '税金合計不一致エラー',
    }

    /** エラーCSVヘッダー */
    const ERROR_CSV_HEADER = ["処理結果", "エラー項目", "受注No.", "CSV"]

    /** メッセージID */
    const MESSAGE_ID = {
        ORDERS_CREATE_MR: 'ETONET_OEDERS_CREATE_MR_ERROR'
    }

    function getInputData() {
        log.debug("getInputData開始")
        try {
            let result = [];// 戻り値
            // 1.CSVファイルのダウンロード
            // 1-1.CSVファイルのダウンロード
            // common.executeTrusted(constLib.COOPRATION_CATEGORY.ETONET_ORDER); // TODO:引数は仮　NS上の未処理フォルダに格納
            // 1-2.対象のCSVファイルの存在チェック
            // 未処理フォルダを指定する
            const untreatedFolderId = etonetLib.FOLDER.UNTREATED.ORDER;

            // フォルダ内のファイルを検索
            const targetFileSearchType = search.Type.FOLDER;
            const targetFileSearchFilters = [
                search.createFilter({ name: FIELD_ID.INTERNAL_ID, operator: search.Operator.IS, values: untreatedFolderId})
            ];
            const targetFileSearchColums = [
                search.createColumn({ name: 'internalid', join: 'file' })// ファイル：内部ID
            ];
            const targetFileSearch = common.getSearchData(targetFileSearchType, targetFileSearchFilters, targetFileSearchColums);
            
            const fileObjList = [];
            // フォルダ内のファイルを取得
            for (let targetFile of targetFileSearch) {
                let fileId = targetFile.getValue({ name: 'internalid', join: 'file' });
                log.debug("fileId",fileId)
                // ファイルをロードする
                let fileObj = file.load(fileId);
                log.debug("fileObj",fileObj)
                fileObjList.push(fileObj);
            }


            // 2.ETONET側のCSVファイル移動
            // TODO:共通関数作成待ち⇒common.executeTrusted()内で処理

            // 3.ファイル情報の取得
            let orderNumberList = [];// ETONET番号リスト
            for (let fileObj of fileObjList) {
                // ファイル情報を取得
                const fileContent = fileObj.getContents();
                log.debug("fileContent",fileContent)

                // 改行で分割
                // const csvRows = fileContent.split('\n');
                //★
                const csvRows = common.getCSVData(fileContent);
                log.debug("csvRows",csvRows)
                // 「データ区分」の列インデックスを取得
                const dataPartitionIndex = etonetLib.HEADER_INDEX.DATA_PARTITION;
                // 「ETONET番号」の列インデックスを取得
                const etonetNoIndex = etonetLib.HEADER_INDEX.ETONET_NUMBER;
                // データ行の処理（1行目と最終行は「ST」と「END」しか書かれていないため対象外）
                for (let rowNumber = 1; rowNumber < (csvRows.length - 1); rowNumber++) {
                    // let rowData = csvRows[rowNumber].split(',');
                    // ★
                    let rowData = csvRows[rowNumber];

                    log.debug("rowData",rowData)

                    let dataPartition = rowData[dataPartitionIndex]; // データ区分を取得
                    log.debug("dataPartition",dataPartition)
                    let etonetNo = rowData[etonetNoIndex]; // ETONET番号を取得
                    log.debug("etonetNo",etonetNo)
                    // 3-1.ETONET番号取得
                    if (dataPartition === DATA_PARTITION.HEADER && !orderNumberList.includes(etonetNo)) {
                        orderNumberList.push(etonetNo);
                    }
                }
                log.debug("orderNumberList",orderNumberList)
            
                // 4.チェック用情報取得
                // 4-1.顧客マスタ取得
                const customerSearchType = search.Type.CUSTOMER;
                const customerSearchFilters = [];
                const customerSearchColums = [];
                const customerSearch = common.getSearchData(customerSearchType, customerSearchFilters, customerSearchColums);
                log.debug("customerSearch",customerSearch)

                // 4-2.アイテムマスタ取得
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

                // 4-3.場所マスタ取得
                const locationSearchType = search.Type.LOCATION;
                const locationSearchFilters = [
                    [FIELD_ID.ETONET_ALLOCATION_ALLOWED,"is","T"], // 「ETONET引当可フラグ」がオン
                    "AND",
                    [FIELD_ID.IS_INACTIV,"is","F"] //「場所を無効にする」がオフ
                ];
                const locationSearchColums = [];
                const locationSearch = common.getSearchData(locationSearchType, locationSearchFilters, locationSearchColums);
                log.debug("locationSearch",locationSearch)

                // 4-4.在庫詳細マスタ取得
                // 項番4-3の場所を取得
                const locationList = [];
                for (let locationResult of locationSearch) {
                    locationList.push(locationResult.id);
                }
                log.debug("locationList",locationList)

                const inventoryDetailSearchType = search.Type.INVENTORY_DETAIL;
                const inventoryDetailSearchFilters = [
                    [(FIELD_ID.ITEM_FEILD + FIELD_ID.LOT_NUMBER_ITEM),"is","T"], // 「アイテム：ロット番号付きアイテム」がtrue
                    "AND",
                    [FIELD_ID.EFFECTIVE_DATE,"greaterthanorequalto", "today"], //「有効期限」が処理日以降
                    "AND",
                    [(FIELD_ID.ITEM_FEILD + FIELD_ID.ITEM_TYPE),"is","InvtPart"], //「アイテム：種類」が在庫アイテム
                    "AND",
                    [FIELD_ID.LOCATION,"anyof", locationList] //「場所」が項番4-3で取得した場所
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

                // 4-5.税金コードマスタ取得
                const taxCdSearchType = "salestaxitem";
                const taxCdSearchFilters = [
                    [FIELD_ID.IS_INACTIV,"is","F"] //「無効」がオフ
                ];
                const taxCdSearchColums = [];
                const taxCdSearch = common.getSearchData(taxCdSearchType, taxCdSearchFilters, taxCdSearchColums);

                // 4-6.従業員マスタ取得
                const employeeSearchType = search.Type.EMPLOYEE;
                const employeeSearchFilters = [];
                const employeeSearchColums = [];
                const employeeSearch = common.getSearchData(employeeSearchType, employeeSearchFilters, employeeSearchColums);

                // 4-7.注文書情報取得
                const salesOrderSearchType = search.Type.TRANSACTION;
                const salesOrderSearchFilters = [
                    ["type","is","SalesOrd"], // 種類が注文書
                    "AND",
                    [FIELD_ID.ETONET_NO,"isnotempty",""], //「ETONET番号」がnullではない
                    "AND",
                    [FIELD_ID.EXTERNAL_ID,"isnotempty",""] //「外部ID」がnullではない
                ];
                const salesOrderSearchColums = [
                    search.createColumn({ name: FIELD_ID.ETONET_NO })
                ];
                const salesOrderSearch = common.getSearchData(salesOrderSearchType, salesOrderSearchFilters, salesOrderSearchColums);

                // エラー情報格納用
                let errorDetail = {
                    errorResult: "正常",// エラー処理結果
                    errorContent: ""// エラー項目
                };
                let itemInternalId = ""; // アイテム内部ID
                let lotNoCheck = false; // ロット番号有無
                let locationInternalID =  ""; // 場所内部ID
                let taxCdInternalId = ""; // 税金コード内部ID

                // 各行に対してチェックを開始
                for (let rowNumber = 1; rowNumber < csvRows.length; rowNumber++) {
                    let resultObj = {};
                    // let rowData = csvRows[rowNumber].split(',');
                    // ★
                    let rowData = csvRows[rowNumber];

                    // 5.入力チェック
                    let dataPartition = rowData[dataPartitionIndex]; // データ区分を取得

                    if (dataPartition === DATA_PARTITION.HEADER) {
                        // ヘッダーをチェック
                        errorDetail = etonetLib.validationCheck(etonetLib.HEADER_INFO,rowData);
                    }else if (dataPartition === DATA_PARTITION.DETAIL) {
                        // 明細をチェック
                        errorDetail = etonetLib.validationCheck(etonetLib.DETAIL_INFO,rowData);
                    }else if (dataPartition === DATA_PARTITION.MAIL) {
                        // メールをチェック
                        errorDetail = etonetLib.validationCheck(etonetLib.MAIL_INFO,rowData);
                    }else{
                        // 消費税をチェック
                        errorDetail = etonetLib.validationCheck(etonetLib.TAX_INFO,rowData);
                    }

                    // 入力チェックエラー時、結果を戻り値に格納し以降のチェックは行わず次のループへ
                    if (errorDetail.errorResult !== ERROR_RESULT.SUCCESS) {
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }

                    // 6.マスタチェック
                    // 6-1.顧客マスタ存在チェック
                    const userIdIndex = etonetLib.HEADER_INDEX.USER_ID;
                    // マスタのリスト内を検索してチェック
                    let customerCheck = customerSearch.some(function(item) {
                        return item.id === rowData[userIdIndex];
                    })
                    if (dataPartition === DATA_PARTITION.HEADER && !customerCheck) {
                        errorDetail.errorResult = ERROR_RESULT.CUSTOMER_MASTER_ERROR;
                        errorDetail.errorContent = "ユーザID";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }
            
                    // 6-2.アイテムマスタ存在チェック
                    const categoryNumberIndex = etonetLib.DETAIL_INDEX.CATEGORY_NUMBER;
                    const productNumberIndex = etonetLib.DETAIL_INDEX.PRODUCT_NUMBER;
                    const colorIndex = etonetLib.DETAIL_INDEX.COLOR;
                    const sizeIndex = etonetLib.DETAIL_INDEX.SIZE;
                    const registrationDateIndex = etonetLib.DETAIL_INDEX.COMMODITY_ID_REGIST_DATE;
                    // 対象のアイテムのインデックス
                    let itemIndex;
                    // チェック対象のアイテムを取得
                    let checkItem = rowData[categoryNumberIndex] + rowData[productNumberIndex] + rowData[registrationDateIndex].slice(1,6) + ' : ' + rowData[categoryNumberIndex] + rowData[productNumberIndex] + rowData[registrationDateIndex].slice(1,6) + rowData[colorIndex] + rowData[sizeIndex];
                    log.debug("checkItem",checkItem)
                    let itemCheck = itemSearch.some(function(item) {
                        return item.getValue({ name: FIELD_ID.ITEM_ID }) === checkItem;
                    })
                    log.debug("itemCheck",itemCheck)
                    if (dataPartition === DATA_PARTITION.DETAIL && !itemCheck) {
                        errorDetail.errorResult = ERROR_RESULT.ITEM_MASTER_ERROR;
                        errorDetail.errorContent = "類番、品番、カラー、サイズ、類品番登録日";
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

                    // 6-3.場所マスタ存在チェック
                    // 対象の場所のインデックス
                    let locationIndex;
                    // マスタのリスト内を検索してチェック
                    log.debug("itemSearch[itemIndex].getValue({ name: FIELD_ID.LOCATION })",itemSearch[itemIndex].getValue({ name: FIELD_ID.LOCATION }))
                    let locationCheck = locationSearch.some(function(location) {
                        return location.id === itemSearch[itemIndex].getValue({ name: FIELD_ID.LOCATION });
                    })
                    log.debug("locationCheck",locationCheck)
                    if (dataPartition === DATA_PARTITION.DETAIL && !locationCheck) {
                        errorDetail.errorResult = ERROR_RESULT.LOCATION_MASTER_ERROR;
                        errorDetail.errorContent = "類番、品番、カラー、サイズ、類品番登録日";
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

                    // 6-4.在庫詳細マスタ存在チェック
                    // 「ロット番号有無」がtrueの時のみ実施
                    log.debug("lotNoCheck",lotNoCheck)
                    if (lotNoCheck) {
                        let inventoryDetailCheck = inventoryDetailSearch.some(function(inventoryDetail) {
                            return (
                                inventoryDetail.getValue({ name: FIELD_ID.ITEM }) === itemInternalId &&
                                inventoryDetail.getValue({ name: FIELD_ID.LOCATION }) === locationInternalID
                            )
                        });
                        // マスタの「数量」の合計を取得
                        let quantityTotal = 0;
                        const subjectList = [];// 対象のマスタ情報リスト
                        for (const result of inventoryDetailSearch) {
                            if (
                                result.getValue({ name: FIELD_ID.ITEM }) === itemInternalId &&
                                result.getValue({ name: FIELD_ID.LOCATION }) === locationInternalID
                            ){
                                quantityTotal += result.getValue({ name: FIELD_ID.QUANTITY });
                                subjectList.push(result);
                            }
                        }
                        // 受注明細の「数量」を取得
                        let detailQuantity = rowData[etonetLib.DETAIL_INDEX.QUANTITY];
                        // マスタの「数量」の合計＜受注明細の「数量」の場合、チェックエラー
                        if (quantityTotal < detailQuantity) {
                            inventoryDetailCheck = false;
                        }
                        if (dataPartition === DATA_PARTITION.DETAIL && !inventoryDetailCheck) {
                            errorDetail.errorResult = ERROR_RESULT.INVENTORY_DETAIL_MASTER_ERROR;
                            errorDetail.errorContent = "類番、品番、カラー、サイズ、類品番登録日";
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

                    // 6-5.税金コードマスタ存在チェック
                    // マスタのリスト内を検索してチェック
                    let taxCdCheck = taxCdSearch.some(function(item) {
                        // TODO:消費税明細の適用消費税コードもチェックした方がいい？
                        // 受注明細の適用消費税コードを取得
                        const detailTaxCodeKey = etonetLib.DETAIL_INDEX.TAX_CD;
                        const csvDetailTaxCode = rowData[detailTaxCodeKey];
                        // 内部IDと比較するために変換
                        const detailTaxCode = etonetLib.CONVERSION_INFO.APPLIED_TAX_CD[csvDetailTaxCode];
                        // マスタに存在した場合、trueを返す
                        return item.id === detailTaxCode;
                    })
                    if ([DATA_PARTITION.DETAIL, DATA_PARTITION.TAX].includes(dataPartition) && !taxCdCheck) {
                        errorDetail.errorResult = ERROR_RESULT.TAX_CD_MASTER_ERROR;
                        errorDetail.errorContent = "適用消費税コード";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        taxCdInternalId = taxCdSearch.id;
                        resultObj.taxCdInternalId = taxCdInternalId;
                    }

                    // 6-6.従業員マスタ存在チェック
                    const employeeIndex = etonetLib.HEADER_INDEX.OPERATION_PROXY;
                    // マスタのリスト内を検索してチェック
                    let employeeCheck = employeeSearch.some(function(item) {
                        return item.id === rowData[employeeIndex];
                    })
                    if (dataPartition === DATA_PARTITION && !employeeCheck) {
                        errorDetail.errorResult = ERROR_RESULT.EMPLOYEE_MASTER_ERROR;
                        errorDetail.errorContent = "操作代行者";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }

                    // 7.注文書存在チェック
                    // マスタのリスト内を検索してチェック
                    let salesOrderCheck = salesOrderSearch.some(function(salesOrder) {
                        // 「受注日」の列インデックスを取得
                        const orderDateIndex = etonetLib.HEADER_INDEX.TRANDATE;
                        // 項目「ETONET番号」と同じ形にする
                        const rowEtonetNo = rowData[etonetNoIndex] + "-" + rowData[orderDateIndex];

                        return salesOrder.getValue({ name: FIELD_ID.ETONET_NO }) === rowEtonetNo;
                    })
                    if (salesOrderCheck) {
                        errorDetail.errorResult = ERROR_RESULT.SALES_ORDER_EXIST_ERROR;
                        errorDetail.errorContent = "ETONET番号";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        // 「受注日-ETONET番号」に加工した外部IDを追加
                        resultObj.externalId = rowEtonetNo;
                    }

                    // 正常終了した処理結果とcsv情報を設定し戻り値に追加
                    resultObj.errorResult = errorDetail.errorResult;
                    resultObj.errorContent = errorDetail.errorContent;
                    resultObj.csv = csvRows[rowNumber];
                    result.push(resultObj);

                }
            }

            // 8.戻り値を設定
            
            log.debug("getInputData処理結果", result)
            return result;
        }
        catch (e) {
            log.error("getInputDataエラー", e)
        }
    }

    function map(context) {
        let value = JSON.parse(context.value);
        log.debug("map開始")
        // 「ETONET番号」の列インデックスを取得
        const etonetNoIndex = etonetLib.HEADER_INDEX.ETONET_NUMBER;
        for (let contextRow = 0; value && contextRow < value.length; contextRow++) {
            let contextCsvData = value.csv.split(',');
            // ETONET番号を取得
            let keyEtonetNo = contextCsvData[etonetNoIndex];
            let writeValue = value;

            // ETONET番号でマッピング
            context.write({
                key: keyEtonetNo,
                value: writeValue
            });
        }
    }

    function reduce(context) {
        log.debug("reduce開始")
        try{

            // 1.処理結果確認
            if (context.errorResult !== ERROR_RESULT.SUCCESS) {
                // 戻り値を設定して処理を終了
                context.write({
                    key: context.key,
                    value: context.value
                });
                return;
            }

            // 2.データ区分ごとに分別
            const headerDataObjList = []; // ヘッダ情報格納用リスト
            const detailDataObjList = []; // 明細情報格納用リスト
            const mailDataObjList = []; // メール情報格納用リスト
            const taxDataObjList = []; // 消費税情報格納用リスト
            const mailAddressList = [];// メールアドレス
            for (let contextLine = 1; contextLine < context.value.length; contextLine++) {
                // 値を取得
                const contextValue = context.value[contextLine];
                // csv情報を取得
                const contextCsv = contextValue.csv.split(',');
                // 「データ区分」の列インデックスを取得
                const dataPartitionIndex = etonetLib.HEADER_INDEX.DATA_PARTITION;
                // データ区分を取得
                let dataPartition = contextCsv[dataPartitionIndex];
                // 2-1.受注ヘッダ
                if (dataPartition === DATA_PARTITION.HEADER) {
                    const headerData = {};
                    let headerCsvData = contextCsv;
                    for (let dataRow = 0; dataRow < headerCsvData.length; dataRow++) {
                        // フィールドIDを取得
                        const fieldId = etonetLib.findHeaderByIndex(dataRow).fieldId;
                        if(fieldId){
                            headerData[fieldId] = headerCsvData[dataRow];
                        }
                    }
                    headerData.externalId = contextValue.externalId;
                    // 「ETONET番号」のフィールドIDを取得
                    const etonetNoFieldId = etonetLib.findHeaderByLabel("ETONET番号").fieldId;
                    // ETONET番号に設定し直す
                    headerData[etonetNoFieldId] = contextValue.externalId;
                    headerDataObjList.push(headerData);
                }
                // 2-2.受注明細
                if (dataPartition === DATA_PARTITION.DETAIL) {
                    const detailData = {};
                    let detailCsvData = contextCsv;
                    for (let dataRow = 0; dataRow < detailCsvData.length; dataRow++) {
                        // フィールドIDを取得
                        const fieldId = etonetLib.findDetailByIndex(dataRow).fieldId;
                        if(fieldId){
                            detailData[fieldId] = detailCsvData[dataRow];
                        }
                    }
                    detailData.item = contextValue.itemInternalId;
                    detailData.taxCd = contextValue.taxCdInternalId;
                    detailData.location = contextValue.locationInternalID;
                    detailData.department = contextValue.itemDept;
                    // 在庫詳細
                    if (contextValue.inventoryDetailList) {
                        detailData.inventoryDetailList = contextValue.inventoryDetailList;
                    }

                    detailDataObjList.push(detailData);
                }
                // 2-3.受注メール明細
                if(dataPartition === DATA_PARTITION.MAIL){
                    // 「メールアドレス」の列インデックスを取得
                    const mailAddressIndex = etonetLib.MAIL_INDEX.MAIL_ADDRESS;
                    // メールアドレスを取得
                    let mailAddress = contextCsv[mailAddressIndex];
                    // メールアドレスリストに格納
                    mailAddressList.push(mailAddress);
                }
                // 2-4.受注消費税明細
                if (dataPartition === DATA_PARTITION.TAX) {
                    const taxData = {};
                    let taxCsvData = contextCsv;
                    for (let dataRow = 0; dataRow < taxCsvData.length; dataRow++) {
                        // フィールドIDを取得
                        const fieldId = etonetLib.findDetailByIndex(dataRow).fieldId;
                        if(fieldId){
                            taxData[fieldId] = taxCsvData[dataRow];
                        }
                    }
                    taxDataObjList.push(taxData);
                }
            }
            // 受注メール明細オブジェクトにメールアドレスを格納
            mailDataObjList.push(mailAddressList.join(","));

            // 3.各データ有無チェック
            let value = JSON.parse(context.value);
            // 3-1.受注ヘッダ
            if (headerDataObjList.length === 0) {
                value.errorResult = ERROR_RESULT.HEADER_EXIST_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }
            // 3-2.受注明細
            if (detailDataObjList.length === 0) {
                value.errorResult = ERROR_RESULT.DETAIL_EXIST_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }
            // 3-3.受注メール
            if (mailDataObjList.length === 0) {
                value.errorResult = ERROR_RESULT.MAIL_EXIST_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }
            // 3-4.受注消費税
            if (taxDataObjList.length === 0) {
                value.errorResult = ERROR_RESULT.TAX_EXIST_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }

            // 4.注文書作成
            // 注文書レコードを新規作成
            const salesOrder = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true
            });
            // 4-1.受注ヘッダ情報の入力
            // TODO:headerDataObjListには1行分しか入っていないためループの必要はないのでは？
            for (let headerObjectLine = 0; headerObjectLine < headerDataObjList.length; headerObjectLine++) {

                for (let headerLine = 0; headerLine < etonetLib.HEADER_INFO.length; headerLine++) {

                    // ETONET番号を設定
                    salesOrder.setValue({
                        fieldID: FIELD_ID.ETONET_NO,
                        value: headerDataObjList[headerObjectLine].externalId
                    })

                    // 外部IDを設定
                    salesOrder.setValue({
                        fieldID: FIELD_ID.EXTERNAL_ID,
                        value: headerDataObjList[headerObjectLine].externalId
                    })

                    // ETONET伝票種類を設定
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
            // 4-2.受注明細情報の入力
            // 置き換え項目の一覧リスト
            const replaceFieldList = [FIELD_ID.ITEM, FIELD_ID.LOCATION, FIELD_ID.TAX_CD];
            for (let detailObjectLine = 0; detailObjectLine < detailDataObjList.length; detailObjectLine++) {
                for (let detailLine = 0; detailLine < etonetLib.DETAIL_INFO.length; detailLine++) {
                    // 明細行を追加
                    salesOrder.selectNewLine({ sublistId: 'item' });

                    // アイテムを設定
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.ITEM,
                        value: detailDataObjList[detailObjectLine].item
                    })

                    // 場所を設定
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.LOCATION,
                        value: detailDataObjList[detailObjectLine].location
                    })

                    // 税金コードを設定
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.TAX_CD,
                        value: detailDataObjList[detailObjectLine].taxCdInternalId
                    })

                    if (etonetLib.DETAIL_INFO[detailLine].fieldid !== null) {
                        // 項目「アイテム」「場所」「税金コード」以外の場合
                        if (replaceFieldList.indexOf(etonetLib.DETAIL_INFO[detailLine].fieldid) === -1) {
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: etonetLib.DETAIL_INFO[detailLine].fieldid,
                                value: detailDataObjList[detailObjectLine][detailLine]
                            })
                        }

                        // 在庫詳細がある時、在庫詳細を設定
                        if (detailDataObjList[detailObjectLine].inventoryDetailList) {

                            // 在庫詳細サブレコードの作成
                            const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                                sublistId: 'item',
                                fieldId: 'inventorydetail',
                            });

                            // 在庫詳細のラインを設定
                            detailDataObjList[detailObjectLine].inventoryDetailList.forEach(function (detail) {
                                // 在庫詳細サブリストのアイテムライン選択
                                inventoryRecord.selectNewLine({
                                    sublistId: 'inventoryassignment',
                                });

                                //在庫詳細の数量
                                inventoryRecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: detail.quantity
                                });

                                // 在庫詳細のシリアル/ロット番号
                                inventoryRecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'receiptinventorynumber',
                                    value: detail.lotNumber
                                });
                    
                                //在庫詳細サブリストで現在選択されているラインを確定
                                inventoryRecord.commitLine({
                                    sublistId: 'inventoryassignment'
                                });

                            })
                        }

                        // アイテムサブリストで現在選択されているラインを確定
                        salesOrder.commitLine({
                            sublistId: 'item'
                        });

                        // 4-2-1.お得意様価格変更の入力
                        // 「顧客別価格区分」のインデックスを取得する
                        const customerPriceClassIndex = etonetLib.DETAIL_INDEX.CUSTOMER_PRICE_TYPE;
                        
                        if (detailDataObjList[detailObjectLine][customerPriceClassIndex] === "3" || detailDataObjList[detailObjectLine][customerPriceClassIndex] === "4") {
                            // 明細行を追加
                            salesOrder.selectNewLine({ sublistId: 'item' });

                            // アイテムを設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.ITEM,
                                value: DISCOUNT_ITEM.COSTOMER_PRICE
                            })

                            // 価格水準を設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.PRICE,
                                value: "-1" // カスタム
                            })

                            // 金額を設定
                            // 「顧客別卸価格」を取得する
                            const customerWholesalePriceIndex = etonetLib.DETAIL_INDEX.CUSTOMER_WHOLESALE_PRICE;
                            const customerWholesalePrice = detailDataObjList[detailObjectLine][customerWholesalePriceIndex]
                            // 「マスタ卸価格」を取得する
                            const masterWholesalePriceIndex = etonetLib.DETAIL_INDEX.MASTER_WHOLESALE_PRICE;
                            const masterWholesalePrice = detailDataObjList[detailObjectLine][masterWholesalePriceIndex]
                            // 「数量」を取得する
                            const quantityIndex = etonetLib.DETAIL_INDEX.QUANTITY;
                            const quantity = detailDataObjList[detailObjectLine][quantityIndex]
                            // （顧客別卸価格-マスタ卸価格）*数量を取得する
                            const customerTypePrice = (customerWholesalePrice-masterWholesalePrice)*quantity;
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.AMOUNT,
                                value: customerTypePrice
                            })

                            // 税金コードを設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.TAX_CD,
                                value: detailDataObjList[detailObjectLine].taxCdInternalId 
                            })

                            // 部門を設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.DEPT,
                                value: DEPT.SALES_DIVISION // 営業本部
                            })

                            // アイテムサブリストで現在選択されているラインを確定
                            salesOrder.commitLine({
                                sublistId: 'item'
                            });

                        }

                        // 4-2-2.セール値引の入力
                        // 「割引区分」のインデックスを取得する
                        const discountCategoryIndex = etonetLib.DETAIL_INDEX.DISCOUNT_TYPE;
                        
                        if (detailDataObjList[detailObjectLine][discountCategoryIndex] === "3" 
                            || detailDataObjList[detailObjectLine][discountCategoryIndex] === "7"
                            || detailDataObjList[detailObjectLine][discountCategoryIndex] === "8"
                        ) {
                            // 明細行を追加
                            salesOrder.selectNewLine({ sublistId: 'item' });

                            // アイテムを設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.ITEM,
                                value: DISCOUNT_ITEM.SALE_DISCOUNT
                            })

                            // 価格水準を設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.PRICE,
                                value: "-1" // カスタム
                            })

                            // 金額を設定
                            // 「販売卸価格」を取得する
                            const saleWholesalePriceIndex = etonetLib.DETAIL_INDEX.SALES_WHOLESALE_PRICE;
                            const saleWholesalePrice = detailDataObjList[detailObjectLine][saleWholesalePriceIndex]
                            // 「顧客別卸価格」を取得する
                            const customerWholesalePriceIndex = etonetLib.DETAIL_INDEX.CUSTOMER_WHOLESALE_PRICE;
                            const customerWholesalePrice = detailDataObjList[detailObjectLine][customerWholesalePriceIndex]
                            // 「数量」を取得する
                            const quantityIndex = etonetLib.DETAIL_INDEX.QUANTITY;
                            const quantity = detailDataObjList[detailObjectLine][quantityIndex]
                            // （販売卸価格-顧客別卸価格）*数量を取得する
                            const saleDiscount = (saleWholesalePrice - customerWholesalePrice)*quantity;
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.AMOUNT,
                                value: saleDiscount
                            })

                            // 税金コードを設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.TAX_CD,
                                value: detailDataObjList[detailObjectLine].taxCdInternalId 
                            })

                            // 部門を設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.DEPT,
                                value: detailDataObjList[detailObjectLine].department
                            })

                            // アイテムサブリストで現在選択されているラインを確定
                            salesOrder.commitLine({
                                sublistId: 'item'
                            });
                        }

                        // 4-2-3.価格変更の入力
                        if (detailDataObjList[discountCategoryIndex] === "4") {
                            // 明細行を追加
                            salesOrder.selectNewLine({ sublistId: 'item' });

                            // アイテムを設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.ITEM,
                                value: DISCOUNT_ITEM.PRICE_CHANGE
                            })

                            // 価格水準を設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.PRICE,
                                value: "-1" // カスタム
                            })

                            // 金額を設定
                            // 「販売卸価格」を取得する
                            const saleWholesalePriceIndex = etonetLib.DETAIL_INDEX.SALES_WHOLESALE_PRICE;
                            const saleWholesalePrice = detailDataObjList[detailObjectLine][saleWholesalePriceIndex]
                            // 「顧客別卸価格」を取得する
                            const customerWholesalePriceIndex = etonetLib.DETAIL_INDEX.CUSTOMER_WHOLESALE_PRICE;
                            const customerWholesalePrice = detailDataObjList[detailObjectLine][customerWholesalePriceIndex]
                            // 「数量」を取得する
                            const quantityIndex = etonetLib.DETAIL_INDEX.QUANTITY;
                            const quantity = detailDataObjList[detailObjectLine][quantityIndex]
                            // （販売卸価格-顧客別卸価格）*数量を取得する
                            const saleDiscount = (saleWholesalePrice - customerWholesalePrice)*quantity;
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.AMOUNT,
                                value: saleDiscount
                            })

                            // 税金コードを設定
                            // 「税金コード」を取得する
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.TAX_CD,
                                value: detailDataObjList[detailObjectLine].taxCdInternalId 
                            })

                            // 部門を設定
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldID: FIELD_ID.DEPT,
                                value: detailDataObjList[detailObjectLine].department
                            })

                            // アイテムサブリストで現在選択されているラインを確定
                            salesOrder.commitLine({
                                sublistId: 'item'
                            });
                            
                        }
                    }
                }
            }
            // 4-3.受注メール情報の入力
            for (let mailLine = 0; mailLine < etonetLib.MAIL_INFO.length; mailLine++) {
                if (etonetLib.MAIL_INFO[mailLine].fieldid === "mail") {
                    salesOrder.setValue({
                        fieldID: etonetLib.MAIL_INFO[mailLine].fieldid,
                        value: mailDataObjList[0]// 1つしかないため0を設定
                    })
                }
            }

            // 4-4.受注消費税情報の入力
            // 「適用消費税コード」の列インデックスを取得する
            const taxCdIndex = etonetLib.TAX_INDEX.APPLIED_TAX_CD;
            // 「消費税対象額」の列インデックスを取得する
            const taxTargetIndex = etonetLib.TAX_INDEX.TAXABLE_AMOUNT;
            // 「消費税額」の列インデックスを取得する
            const taxPriceIndex = etonetLib.TAX_INDEX.TAX_AMOUNT;
            // 軽減税率8%の場合
            if (taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.EIGHT_PER)) {
                const eight_per_tax_target = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.EIGHT_PER)?.[taxTargetIndex];
                const eight_per_tax_price = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.EIGHT_PER)?.[taxPriceIndex];

                salesOrder.setValue({
                    fieldID: "custbody_etonet_taxable_amount_8",// 課税対象額(8%)
                    value: eight_per_tax_target
                })
                salesOrder.setValue({
                    fieldID: "custbody_etonet_tax_amount_8",// 消費税額(8%)
                    value: eight_per_tax_price
                })
            }
            // 10%の場合
            if (taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.TEN_PER)) {
                const ten_per_tax_target = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.TEN_PER)?.[taxTargetIndex];
                const ten_per_tax_price = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.TEN_PER)?.[taxPriceIndex];

                salesOrder.setValue({
                    fieldID: "custbody_etonet_taxable_amount_10",// 課税対象額(10%)
                    value: ten_per_tax_target
                })
                salesOrder.setValue({
                    fieldID: "custbody_etonet_tax_amount_10",// 消費税額(10%)
                    value: ten_per_tax_price
                })
            }
            // 非課税の場合
            if (taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.NO_TAX)) {
                const no_tax_target = taxDataObjList.find(data => data[taxCdIndex] === APPLY_TAX_CD.NO_TAX)?.[taxTargetIndex];

                salesOrder.setValue({
                    fieldID: "custbody_etonet_nontaxable_amount",// 非課税対象額
                    value: no_tax_target
                })
            }

            // 4-5.小計の入力
            // 明細行を追加
            salesOrder.selectNewLine({ sublistId: 'item' });

            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: 'item',
                value: 'subtotalitem' // 小計
            })

            // アイテムサブリストで現在選択されているラインを確定
            salesOrder.commitLine({
                sublistId: 'item'
            });

            // 4-6.クーポン値引の入力
            // 「ECサイト値引額」の列インデックスを取得する
            const ecSiteDiscountIndex = etonetLib.HEADER_INDEX.EC_SITE_DISCOUNT;
            // 「ECサイト値引額」を取得する
            const ecSiteDiscount = headerDataObjList[ecSiteDiscountIndex];

            // 「ECサイト値引額」＞0の場合、追加
            if (ecSiteDiscount > 0) {
                // 4-6-1.税金コードごとの値引金額取得
                let noTaxTotal = 0; //非課税の合計額
                let tenPerTotal = 0; // 税率10％の合計額
                let eightPerTotal = 0; // 軽減税率8％の合計額
                let subtotalLine = 0; // アイテムが「小計」の行
                let lineCount = salesOrder.getLineCount({ sublistId: 'item' });
                for (let itemLine = 0; itemLine < lineCount; itemLine++) {
                    salesOrder.selectLine({
                        sublistId: 'item',
                        line: itemLine
                    });
                    // 税金コードを取得
                    let lineTaxCd = salesOrder.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.TAX_CD
                    });
                    // 金額を取得
                    let lineAmount = salesOrder.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.AMOUNT
                    });

                    // 税金コードが「非課税」の場合
                    if (lineTaxCd === TAX_CD.NO_TAX) {
                        noTaxTotal += lineAmount;
                    }else if (lineTaxCd === TAX_CD.TEN_PER) {
                        // 税金コードが「10%」の場合
                        tenPerTotal += lineAmount;
                    }else if (lineTaxCd === TAX_CD.EIGHT_PER) {
                        // 税金コードが「軽減税率8%」の場合
                        eightPerTotal += lineAmount;
                    }

                    // アイテムが「小計」の行を取得
                    let lineItem = salesOrder.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: 'item'
                    });
                    if (lineItem === 'subtotalitem') {
                        subtotalLine = itemLine;
                    }
                }

                // 小計の列を選択
                salesOrder.selectLine({
                    sublistId: 'item',
                    line: subtotalLine
                });
                // 小計の金額を取得
                const subtotal = salesOrder.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldID: FIELD_ID.AMOUNT
                })

                // クーポン値引額を取得
                // 非課税の場合
                const noTaxCouponDiscount = noTaxTotal*ecSiteDiscount/subtotal;
                // 標準税率10％の場合
                const tenPerCouponDiscount = tenPerTotal*ecSiteDiscount/subtotal;
                // 軽減税率8%の場合
                const eightPerCouponDiscount = ecSiteDiscount-noTaxCouponDiscount-tenPerCouponDiscount;

                // 税金コードとクーポン値引額のセットをリストに格納
                const couponDiscountList = [];
                let couponDiscountObj = {};
                // 非課税
                if (noTaxCouponDiscount) {
                    couponDiscountObj.taxCd = TAX_CD.NO_TAX;
                    couponDiscountObj.couponDiscount = noTaxCouponDiscount;
                    couponDiscountList.push(couponDiscountObj);
                }
                // 標準税率10％の場合
                if (tenPerCouponDiscount) {
                    couponDiscountObj.taxCd = TAX_CD.TEN_PER;
                    couponDiscountObj.couponDiscount = tenPerCouponDiscount;
                    couponDiscountList.push(couponDiscountObj);
                }
                // 軽減税率8%の場合
                if (eightPerCouponDiscount) {
                    couponDiscountObj.taxCd = TAX_CD.EIGHT_PER;
                    couponDiscountObj.couponDiscount = eightPerCouponDiscount;
                    couponDiscountList.push(couponDiscountObj);
                }

                // 4-6-2.税金コードごとのアイテムの設定
                couponDiscountList.forEach(function (couponDiscount) {
                    const couponDiscountInfo = {};
                    couponDiscountInfo.record = salesOrder;
                    couponDiscountInfo.item = DISCOUNT_ITEM.COUPON_DISCOUNT;// クーポン値引
                    couponDiscountInfo.amount = couponDiscount.couponDiscount;
                    couponDiscountInfo.taxCd = couponDiscount.taxCd;
                    couponDiscountInfo.dept = DEPT.SALES_DIVISION;
                    addItemLine(postageInfo);
                })
            }

            // 4-7.送料の入力
            // 「送料金額」の列インデックスを取得する
            const postageAmountIndex = etonetLib.HEADER_INDEX.POSTAGE;
            // 「送料金額」を取得する
            const postageAmount = headerDataObjList[postageAmountIndex];

            // 「送料金額」＞0の場合、明細に送料の行を追加
            if (postageAmount > 0) {
                const postageInfo = {};
                postageInfo.record = salesOrder;
                postageInfo.item = DELIVERY_ITEM.POSTAGE;// 送料
                postageInfo.amount = postageAmount;
                postageInfo.taxCd = TAX_CD.TEN_PER;
                postageInfo.dept = DEPT.LOGISTICS;
                addItemLine(postageInfo);
            }

            // 4-8.送料サービスの入力
            // 「送料金額サービス額」の列インデックスを取得する
            const postageAmountServiceIndex = etonetLib.HEADER_INDEX.POSTAGE_SERVICE;
            // 「送料サービス額」を取得する
            const postageAmountService = headerDataObjList[postageAmountServiceIndex];

            // 「送料サービス額」＞0の場合、明細に送料サービス額の行を追加
            if (postageAmountService > 0) {
                const postageServiceInfo = {};
                postageServiceInfo.record = salesOrder;
                postageServiceInfo.item = DISCOUNT_ITEM.POSTAGE_SERVICE;// 送料サービス額
                postageServiceInfo.amount = postageAmountService;
                postageServiceInfo.taxCd = TAX_CD.TEN_PER;
                postageServiceInfo.dept = DEPT.SALES_DIVISION;
                addItemLine(postageServiceInfo);
            }

            // 4-9.代引手数料の入力
            // 「代引き手数料」の列インデックスを取得する
            const CodChargeIndex = etonetLib.HEADER_INDEX.COD_CHARGE;
            // 「代引手数料」を取得する
            const CodCharge = headerDataObjList[CodChargeIndex];

            // 「代引手数料」＞0の場合、明細に代引手数料の行を追加
            if (CodCharge > 0) {
                const CodChargeInfo = {};
                CodChargeInfo.record = salesOrder;
                CodChargeInfo.item = DELIVERY_ITEM.COD_CHARGE;// 代引手数料
                CodChargeInfo.amount = CodCharge;
                CodChargeInfo.taxCd = TAX_CD.TEN_PER;
                CodChargeInfo.dept = DEPT.LOGISTICS;
                addItemLine(CodChargeInfo);
            }

            // 4-10.代引手数料サービスの入力
            // 「代引手数料サービス額」の列インデックスを取得する
            const CodChargeServiceIndex = etonetLib.HEADER_INDEX.COD_CHARGE_SERVICE;
            // 「代引手数料サービス額」を取得する
            const CodChargeService = headerDataObjList[CodChargeServiceIndex];

            // 「代引手数料サービス額」＞0の場合、明細に代引手数料サービス額の行を追加
            if (CodChargeService > 0) {
                const CodChargeServiceInfo = {};
                CodChargeServiceInfo.record = salesOrder;
                CodChargeServiceInfo.item = DISCOUNT_ITEM.COD_CHARGE_SERVICE;// 代引手数料サービス額
                CodChargeServiceInfo.amount = CodChargeService;
                CodChargeServiceInfo.taxCd = TAX_CD.TEN_PER;
                CodChargeServiceInfo.dept = DEPT.LOGISTICS;
                addItemLine(CodChargeServiceInfo);
            }

            // 5.金額の整合性チェック
            // 5-1.小計額の整合性チェック
            // NSの小計額を取得
            const subtotalNs = salesOrder.getValue({
                fieldID: 'subtotal'
            });

            // 「小計」の列インデックスを取得する
            const subtotalCsvIndex = etonetLib.HEADER_INDEX.SUBTOTAL;
            // 「小計」を取得する
            const subtotalCsv = headerDataObjList[subtotalCsvIndex];

            // 「商品外計」の列インデックスを取得する
            const extarnalTotalCsvIndex = etonetLib.HEADER_INDEX.EXTARNAL_TOTAL;
            // 「商品外計」を取得する
            const extarnalTotalCsv = headerDataObjList[extarnalTotalCsvIndex];

            // NSの小計額≠CSVの小計+商品外計の場合、エラー
            if (subtotalNs !== (subtotalCsv + extarnalTotalCsv)) {
                value.errorResult = ERROR_RESULT.SUBTOTAL_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }

            // 5-2.消費税額の整合性チェック
            // NSの税金合計を取得
            const consumptionTaxNs = salesOrder.getValue({
                fieldID: 'taxtotal'
            });

            // 「消費税額」の列インデックスを取得する
            const consumptionTaxIndex = etonetLib.HEADER_INDEX.TAX_AMOUNT;
            // 「消費税額」を取得する
            const consumptionTax = headerDataObjList[consumptionTaxIndex];

            // NSの税金合計とCSVの消費税額が不一致の場合、エラー
            if (consumptionTaxNs !== consumptionTax) {
                value.errorResult = ERROR_RESULT.CONSUMPTION_TAX_ERROR;
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }

            // 注文書を保存
            salesOrder.save();

            // 7.戻り値を設定
            context.write({
                key: context.key,
                value: value
            });

        }
        catch (e) {
            log.error("想定外エラー", e.stack);
            let value = JSON.parse(context.value);
            value.errorResult = "例外エラー";
            context.write({
                key: context.key,
                value: value
            });
        }
    }

    function summarize(summary) {
        log.debug("summarize開始")
        // 1.エラー有無の確認
        let errorFlg = false; // エラー有無フラグ
        // 処理結果をループする
        summary.output.iterator().each(function (key, value) {
            if (value.errorResult) {
                errorFlg = true;
                return false;
            }
            return true;
        });

        // 2.実行ファイルの移動
        // TODO:共通関数の作成待ち

        // 3.エラーファイルの作成
        const trandate = new Date();
        // タイムスタンプを作成(YYYYMMDDHHMISS)
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

        // ヘッダ情報書込
        let errorCsvHeader = ERROR_CSV_HEADER.join(",");
        errorFile.appendLine({ value: errorCsvHeader });

        // 3-1.エラー情報の書き込み
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

        // 3-2.エラーファイル保存
        if (existError) {
            errFileId = errorFile.save();
        }

        // 4.受注連携結果メール送信
        // メール送信先のアドレス取得
        let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
        // メール情報を格納
        const mailContent = {};
        mailContent.author = sendTo;
        mailContent.recipients = sendTo;
        mailContent.attachments.push(existError ? [errorFile] : null);

        // エラーメールを送信
        common.sendMail(mailContent, MESSAGE_ID.ORDERS_CREATE_MR);
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }

    /**
     * アイテムラインに新規明細行を追加する
     * @param {*} params 
     * @param {Object*} params.record レコード
     * @param {String*} params.item アイテム
     * @param {String*} params.amount 金額
     * @param {String*} params.taxCd 税金コード
     * @param {String*} params.dept 部門
     * @return なし
     */
        function addItemLine(params) {

            // 明細行を追加
            params.record.selectNewLine({ sublistId: 'item' });
            // アイテムを設定
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.ITEM,
                value: params.item
            })

            // 価格水準を設定
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.PRICE,
                value: "-1" // カスタム
            })

            // 金額を設定
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.AMOUNT,
                value: params.amount
            })

            // 税金コードを設定
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.TAX_CD,
                value: params.taxCd
            })

            // 部門を設定
            params.record.setCurrentSublistValue({
                sublistId: 'item',
                fieldID: FIELD_ID.DEPT,
                value: params.dept
            })

            // アイテムサブリストで現在選択されているラインを確定
            params.record.commitLine({
                sublistId: 'item'
            });
        }
    
})