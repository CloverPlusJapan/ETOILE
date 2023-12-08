/**
 * ETONET_予約・出荷保留連携
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
    /** フィールドID */
    // TODO:item:~が必要か要検討
    const FIELD_ID = {
        /** 内部ID */
        INTERNAL_ID: 'internalid',
        /** アイテム */
        ITEM: 'item',
        /** 数量 */
        QUANTITY: 'quantity',
        /** 類番 */
        CATEGORY_NUMBER: 'category_number',
        /** 品番 */
        PRODUCT_NUMBER: 'product_number',
        /** カラー */
        COLOR: 'color',
        /** サイズ */
        SIZE: 'size',
        /** 類品番登録日 */
        REGISTRATION_DATE: 'product_registration_date',
        /** ロット番号付きアイテム */
        LOT_NUMBER_ITEM: '',
        /** 場所 */
        LOCATION: 'location',
        /** 部門（アイテム：部門） */
        DEPARTMENT: 'department',
        /** ETONET引当可 */
        ETONET_ALLOCATION_ALLOWED: 'custrecord_etonet_allocation_allowed',
        /** 無効（場所を無効にする） */
        IS_INACTIV: 'isinactive',
        /** 有効期限 */
        EFFECTIVE_DATE: '',
        /** アイテム：種類 */
        ITEM_TYPE: '',
        /** アイテム：シリアル/ロット番号 */
        ITEM_SERIAL_LOT_NO: 'issueinventorynumber',
        /** ETONET番号 */
        ETONET_NO: 'etonet_so_number',
        /** 外部ID */
        EXTERNAL_ID: 'externalid',
        /** アイテム：税金コード */
        TAX_CD: 'taxcode',
        /** アイテム：価格水準 */
        PRICE: 'price',
        /** アイテム：金額 */
        AMOUNT: 'amount',
        /** 納税スケジュール */
        TAX_SCHEDULE: 'taxschedule', 
        /** 確保を確認済み */
        // TODO:要フィールドID調査
        SECURE_CONFIRMED: '', 
        /** 確保済み */
        SECURE_QUANTITY: 'quantitycommitted', 
        /** アイテム：ETONET受注No */
        ETONET_ORDER_NUMBER: 'custcol_etonet_order_number', 
        /** アイテム：受注日 */
        OEDER_DATE: 'custcol_order_date', 
        /** アイテム：現在状態 */
        CURRENT_STATUS: 'custcol_current_status', 
        
    }

    /** 現在状態 */
    const CURRENT_STATUS = {
        /** 割当待ち */
        WAITING_ALLOCATION: '0',
        /** 割当済み */
        ASSIGNED: '1',
        /** 注文済み */
        OEDERED: '2',
        /** 解約 */
        CANCEL: '3',
        /** 期限切れ */
        EXPIRED: '4',
    }

    /** 予約番号1 */
    const RESERVE_NUMBER_1 = {
        /** 予約 */
        RESERVE: 'R',
        /** 出荷保留 */
        SHIPPING_HOLD: 'T',
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
    }

    /** エラーCSVヘッダー */
    const ERROR_CSV_HEADER = ["処理結果", "エラー項目", "予約番号", "CSV"]

    // TODO:メールのsubject、bodyはカスタムレコードからの取得に要修正
    /** エラーメール情報 */
    const ERROR_MAIL_INFO = {
        SUBJECT: "【NetSuite】ETONET予約・出荷保留連携処理エラー",
        BODY: "ETONET連携の予約・出荷保留連携処理にて、エラーが発生しました。\n詳細は添付ファイルをご確認ください。"
    }

    function getInputData() {
        log.debug("getInputData開始")
        try {
            let result = [];// 戻り値
            // 1.CSVファイルのダウンロード
            // 1-1.CSVファイルのダウンロード
            common.executeTrusted(); // TODO:名称や引数変更するかも？　NS上の未処理フォルダに格納
            // 1-2.対象のCSVファイルの存在チェック
            // 未処理フォルダを指定する
            const untreatedFolderId = etonetLib.FOLDER.UNTREATED.RESERVE;

            // フォルダ内のファイルを検索
            const targetFileSearchType = search.type.FOLDER;
            const targetFileSearchFilters = [
                search.createFilter({ name: FIELD_ID.INTERNAL_ID, operator: search.Operator.IS, values: untreatedFolderId})
            ];
            const targetFileSearchColums = [
                search.createColumn({ name: file.internalid })// ファイル：内部ID
            ];
            const targetFileSearch = common.getSearchData(targetFileSearchType, targetFileSearchFilters, targetFileSearchColums);
            
            const fileObjList = [];
            // フォルダ内のファイルを取得
            for (let targetFile of targetFileSearch) {
                let fileId = targetFile.getValue({ name: file.internalid });
                // ファイルをロードする
                let fileObj = file.load(fileId);
                fileObjList.push(fileObj);
            }

            // 2.ETONET側のCSVファイル移動
            // TODO:共通関数作成待ち（common.executeTrusted内で実行？）

            // 3.ファイル情報の取得
            for (let fileObj of fileObjList) {
                let createEtonetNumberList = [];// 新規作成用ETONET番号リスト
                let updateEtonetNumberList = [];// 更新用ETONET番号リスト
                // ファイル情報を取得
                const fileContent = fileObj.getContents();
                // 改行で分割
                const csvRows = fileContent.split('\n');

                // データ行の処理(1行目は項目ヘッダーのため対象外)
                for (let rowNumber = 1; rowNumber < csvRows.length; rowNumber++) {
                    let rowData = csvRows[rowNumber].split(',');

                    // 予約番号1~予約番号枝番を取得
                    let reservationNumber1 = rowData[etonetLib.RESERVE_INDEX.RESERVATION_NUMBER_1];
                    let reservationNumber2 = rowData[etonetLib.RESERVE_INDEX.RESERVATION_NUMBER_2];
                    let reservationNumber3 = rowData[etonetLib.RESERVE_INDEX.RESERVATION_NUMBER_3];
                    let reservationSubNumber = rowData[etonetLib.RESERVE_INDEX.RESERVATION_SUB_NUMBER];
                    // 現在状態を取得
                    let currentStatus = rowData[etonetLib.RESERVE_INDEX.CURRENT_STATUS];
                    // 引当数を取得
                    let provisionedQuantity = rowData[etonetLib.RESERVE_INDEX.PROVISIONED_QUANTITY];
                    // ETONET番号を取得する
                    let etonetNo = reservationNumber1 + "-" + reservationNumber2 + "-" + reservationNumber3 + "-" + reservationSubNumber;
                    // 3-1.新規作成用ETONET番号取得
                    if ((reservationNumber1 === "R" && currentStatus === CURRENT_STATUS.WAITING_ALLOCATION && provisionedQuantity === "0") || (reservationNumber1 === "T" && currentStatus === CURRENT_STATUS.ASSIGNED)) {
                        if (!createEtonetNumberList.includes(etonetNo)) {
                            createEtonetNumberList.push(etonetNo);
                        }
                    } else if (!updateEtonetNumberList.includes(etonetNo)) {
                        // 3-2.更新用ETONET番号取得
                        updateEtonetNumberList.push(etonetNo);
                    }
                    
                }
                // 4.チェック用情報取得
                // 4-1.顧客マスタ取得
                const customerSearchType = search.Type.CUSTOMER;
                const customerSearchFilters = [];
                const customerSearchColums = [];
                const customerSearch = common.getSearchData(customerSearchType, customerSearchFilters, customerSearchColums);

                // 4-2.アイテムマスタ取得
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
                    search.createColumn({ name: FIELD_ID.AMOUNT }),// TODO:基準価格のフィールドID要調査
                    search.createColumn({ name: FIELD_ID.TAX_SCHEDULE }),
                ];
                const itemSearch = common.getSearchData(itemSearchType, itemSearchFilters, itemSearchColums);

                // 4-3.場所マスタ取得
                const locationSearchType = search.Type.LOCATION;
                const locationSearchFilters = [
                    [FIELD_ID.ETONET_ALLOCATION_ALLOWED,"is","T"], // 「ETONET引当可フラグ」がオン
                    "AND",
                    [FIELD_ID.IS_INACTIV,"is","F"] //「場所を無効にする」がオフ
                ];
                const locationSearchColums = [];
                const locationSearch = common.getSearchData(locationSearchType, locationSearchFilters, locationSearchColums);

                // 4-4.在庫詳細マスタ取得
                // 処理日の日付を取得
                const today = new Date();
                // 項番4-3の場所を取得
                const locationList = locationSearch.id;
                const inventoryDetailSearchType = search.Type.INVENTORY_DETAIL;
                const inventoryDetailSearchFilters = [
                    [FIELD_ID.LOT_NUMBER_ITEM,"is","T"], // 「アイテム：ロット番号付きアイテム」がtrue
                    "AND",
                    [FIELD_ID.EFFECTIVE_DATE,"greaterthanorequalto", today], //「有効期限」が処理日以降
                    "AND",
                    [FIELD_ID.ITEM_TYPE,"is","在庫アイテム"], //「アイテム：種類」が在庫アイテム
                    "AND",
                    [FIELD_ID.LOCATION,"anyof", locationList] //「場所」が項番4-3で取得した場所
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
                    ["type","anyof","SalesOrd"], // 種類が注文書
                    "AND",
                    [FIELD_ID.ETONET_NO,"isnotempty"], //「ETONET番号」がnullではない
                    "AND",
                    [FIELD_ID.EXTERNAL_ID,"isnotempty"], //「外部ID」がnullではない
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
                    let rowData = csvRows[rowNumber].split(',');

                    // 5.入力チェック
                    errorDetail = etonetLib.validationCheck(etonetLib.RESERVE_INFO,rowData);

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
                    const membershipNumberIndex = etonetLib.RESERVE_INDEX.MEMBERSHIP_NUMBER;
                    // マスタのリスト内を検索してチェック
                    let customerCheck = customerSearch.some(function(item) {
                        return item.id === rowData[membershipNumberIndex];
                    })
                    if (!customerCheck) {
                        errorDetail.errorResult = ERROR_RESULT.CUSTOMER_MASTER_ERROR;
                        errorDetail.errorContent = "会員番号";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }
            
                    // 6-2.アイテムマスタ存在チェック
                    const categoryNumberIndex = etonetLib.RESERVE_INDEX.CATEGORY_NUMBER;
                    const productNumberIndex = etonetLib.RESERVE_INDEX.PRODUCT_NUMBER;
                    const colorIndex = etonetLib.RESERVE_INDEX.COLOR;
                    const sizeIndex = etonetLib.RESERVE_INDEX.SIZE;
                    const registrationDateIndex = etonetLib.RESERVE_INDEX.PRODUCT_REGISTRATION_DATE;
                    // チェック対象のアイテムを取得
                    let checkItem = rowData[categoryNumberIndex] + rowData[productNumberIndex] + rowData[colorIndex] + rowData[sizeIndex] + rowData[registrationDateIndex];
                    let itemCheck = itemSearch.some(function(item) {
                        return item.id === checkItem;
                    })
                    if (!itemCheck) {
                        errorDetail.errorResult = ERROR_RESULT.ITEM_MASTER_ERROR;
                        // TODO:エラー項目を「類品番登録日」⇒「商品登録日」にしたが問題ないか
                        errorDetail.errorContent = "類番、品番、カラー、サイズ、商品登録日";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        itemInternalId = itemSearch.id;
                        amount = itemSearch.getValue({ name: FIELD_ID.AMOUNT });// TODO:amountで問題ないか確認
                        taxCdInternalId = itemSearch.getValue({ name: FIELD_ID.TAX_SCHEDULE });
                        lotNoCheck = itemSearch.getValue({ name: FIELD_ID.LOT_NUMBER_ITEM });
                        itemDept = itemSearch.getValue({ name: FIELD_ID.DEPARTMENT });
                        resultObj.itemInternalId = itemInternalId;
                        resultObj.amount = amount;
                        resultObj.taxCdInternalId = taxCdInternalId;
                        resultObj.lotNoCheck = lotNoCheck;
                        resultObj.itemDept = itemDept;
                    }

                    // 6-3.場所マスタ存在チェック
                    // マスタのリスト内を検索してチェック
                    let locationCheck = locationSearch.some(function(item) {
                        return item.id === itemSearch.getValue({ name: FIELD_ID.LOCATION });
                    })
                    if (!locationCheck) {
                        errorDetail.errorResult = ERROR_RESULT.LOCATION_MASTER_ERROR;
                        errorDetail.errorContent = "類番、品番、カラー、サイズ、商品登録日";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }else{
                        locationInternalID = locationSearch.id;
                        resultObj.locationInternalID = locationInternalID; 
                    }

                    // 6-4.在庫詳細マスタ存在チェック
                    // 「ロット番号有無」がtrueの時のみ実施
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
                        // 引当数を取得
                        let provisionedQuantity = rowData[etonetLib.RESERVE_INDEX.PROVISIONED_QUANTITY];
                        // マスタの「数量」の合計＜引当数の場合、チェックエラー
                        if (quantityTotal < provisionedQuantity) {
                            inventoryDetailCheck = false;
                        }

                        if (!inventoryDetailCheck) {
                            errorDetail.errorResult = ERROR_RESULT.INVENTORY_DETAIL_MASTER_ERROR;
                            errorDetail.errorContent = "類番、品番、カラー、サイズ、商品登録日";
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

                    // 6-5.税金コードマスタ存在チェック
                    // マスタのリスト内を検索してチェック
                    let taxCdCheck = taxCdSearch.some(function(item) {
                        // アイテムマスタから取得した納税スケジュールを取得
                        const taxCode = resultObj.taxCdInternalId;
                        // マスタに存在した場合、trueを返す
                        return item.id === taxCode;
                    })
                    if (!taxCdCheck) {
                        errorDetail.errorResult = ERROR_RESULT.TAX_CD_MASTER_ERROR;
                        errorDetail.errorContent = "類番、品番、カラー、サイズ、商品登録日";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }

                    // 6-6.従業員マスタ存在チェック
                    const employeeIndex = etonetLib.RESERVE_INDEX.OPERATION_PROXY;
                    // マスタのリスト内を検索してチェック
                    let employeeCheck = employeeSearch.some(function(item) {
                        return item.id === rowData[employeeIndex];
                    })
                    if (!employeeCheck) {
                        errorDetail.errorResult = ERROR_RESULT.EMPLOYEE_MASTER_ERROR;
                        errorDetail.errorContent = "操作代行者";
                        resultObj.errorResult = errorDetail.errorResult;
                        resultObj.errorContent = errorDetail.errorContent;
                        resultObj.csv = csvRows[rowNumber];
                        result.push(resultObj);
                        continue;
                    }

                    // 7.注文書存在チェック

                    // マスタのETONET番号を取得し、リストに格納する
                    const salesOrderEtonetNoList = [];
                    const salesOrderIdList = [];
                    for (const salesOrderData of salesOrderSearch) {
                        let etonetNumber = salesOrderData.getValue({ name: FIELD_ID.ETONET_NO });
                        salesOrderIdList.push(salesOrderData.id);
                        salesOrderEtonetNoList.push(etonetNumber);
                    }

                    // 7-1.予約番号1が"R"(予約)＆現在状態が割当待ち("0")＆引当数が"0"、または予約番号1が"T"(出荷保留)＆現在状態が割当済み("1")の場合
                    let salesOrderCheck;
                    if ((reservationNumber1 === "R" && currentStatus === CURRENT_STATUS.WAITING_ALLOCATION && provisionedQuantity === "0") || (reservationNumber1 === "T" && currentStatus === CURRENT_STATUS.ASSIGNED)) {
                        // マスタのリスト内を検索してチェック
                        const createCheckLists = {};
                        createCheckLists.masterList = salesOrderEtonetNoList;
                        createCheckLists.subjectList = createEtonetNumberList;
                        createCheckLists.matchCheck = false;
                        salesOrderCheck = checkList(createCheckLists);
                    }else{
                        // 7-2.上記以外の場合
                        // マスタのリスト内を検索してチェック
                        const updateCheckLists = {};
                        updateCheckLists.masterList = salesOrderEtonetNoList;
                        updateCheckLists.subjectList = updateEtonetNumberList;
                        updateCheckLists.matchCheck = true;
                        salesOrderCheck = checkList(updateCheckLists);
                    }
                    if (!salesOrderCheck) {
                        errorDetail.errorResult = ERROR_RESULT.SALES_ORDER_EXIST_ERROR;
                        errorDetail.errorContent = "ETONET番号";
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
                        // 更新対象の注文書内部IDを追加
                        resultObj.salesOrderId = getMatchInternalId(getInternalIdConditions);
                        // ETONET番号を追加
                        resultObj.etonetNo = etonetNo;
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
        const value = JSON.parse(context.value);
        log.debug("map開始")
        for (let contextRow = 0; value && contextRow < value.length; contextRow++) {
            // ETONET番号を取得
            let keyEtonetNo = value.etonetNo;
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
            let value = JSON.parse(context.value);
            // 1.処理結果確認
            if (context.errorResult !== ERROR_RESULT.SUCCESS) {
                // 戻り値を設定して処理を終了
                context.write({
                    key: context.key,
                    value: value
                });
                return;
            }

            // 2.CSV情報取得
            const reserveDataObjList = []; // CSV情報格納用リスト
            for (let contextLine = 1; contextLine < value.length; contextLine++) {
                // 値を取得
                const contextValue = value[contextLine];
                // csv情報を取得
                const contextCsv = contextValue.csv.split(',');
                // CSV情報格納用オブジェクト
                const reserveData = {};
                // 設定済み項目リスト
                const setFeildIdList = [];

                // 外部IDを設定
                reserveData[FIELD_ID.EXTERNAL_ID] = contextValue.etonetNo;
                setFeildIdList.push(FIELD_ID.EXTERNAL_ID);
                // ETONET番号を設定
                reserveData[FIELD_ID.ETONET_NO] = contextValue.etonetNo;
                setFeildIdList.push(FIELD_ID.ETONET_NO);
                // アイテム：アイテムを設定
                reserveData[FIELD_ID.ITEM] = contextValue.itemInternalId;
                setFeildIdList.push(FIELD_ID.ITEM +':'+ FIELD_ID.ITEM);
                // アイテム：税金コードを設定
                reserveData[FIELD_ID.TAX_CD] = contextValue.taxCdInternalId;
                setFeildIdList.push(FIELD_ID.ITEM +':'+ FIELD_ID.TAX_CD);
                // アイテム：部門を設定
                reserveData[FIELD_ID.DEPARTMENT] = contextValue.itemDept;
                setFeildIdList.push(FIELD_ID.ITEM +':'+ FIELD_ID.DEPARTMENT);
                // アイテム：場所を設定
                reserveData[FIELD_ID.LOCATION] = contextValue.locationInternalID;
                setFeildIdList.push(FIELD_ID.ITEM +':'+ FIELD_ID.LOCATION);

                for (let dataRow = 0; dataRow < contextCsv.length; dataRow++) {
                    // フィールドIDを取得
                    const fieldId = etonetLib.findReserveByIndex(dataRow).fieldId;
                    // フィールドIDが存在し、設定済みのフィールドID以外の場合、オブジェクトにデータを設定
                    if(fieldId && setFeildIdList.indexOf(fieldId) < 0){
                        reserveData[fieldId] = contextCsv[dataRow];
                    }
                }

                // 予約番号1を設定
                reserveData.reserveNumber1 = contextCsv[etonetLib.RESERVE_INDEX.RESERVATION_NUMBER_1];
                // 引当数を設定
                reserveData.provisionedQuantity = contextCsv[etonetLib.RESERVE_INDEX.PROVISIONED_QUANTITY];
                // 予約数を設定
                reserveData.reserveQuantity = contextCsv[etonetLib.RESERVE_INDEX.RESERVE_QUANTITY];
                // 在庫詳細
                if (contextValue.inventoryDetailList) {
                    reserveData.inventoryDetailList = contextValue.inventoryDetailList;
                }

                // 既存の注文書が存在する場合、注文書の内部IDも取得
                if (contextValue.salesOrderId) {
                    reserveData.salesOrderId = contextValue.salesOrderId;
                }

                reserveDataObjList.push(reserveData);
            }

            // 3.注文書の作成・更新
            for (let dataLine = 1; dataLine < reserveDataObjList.length; dataLine++) {
                // 予約番号1を取得
                const reserveNumber1 = reserveDataObjList[dataLine].reservationNumber1;
                // 現在状態を取得
                const currentStatusFieldId = etonetLib.findReserveByIndex(etonetLib.RESERVE_INDEX.CURRENT_STATUS).fieldid;
                const currentStatus = reserveDataObjList[dataLine][currentStatusFieldId];
                // 引当数を取得
                const provisionedQuantity = reserveDataObjList[dataLine].provisionedQuantity;
                
                // 3-1.予約＆割当待ち＆引当数が0、または出荷保留＆割当済みの場合
                if ((reserveNumber1 === RESERVE_NUMBER_1.RESERVE && currentStatus === CURRENT_STATUS.WAITING_ALLOCATION && provisionedQuantity === "0") || (reserveNumber1 === RESERVE_NUMBER_1.SHIPPING_HOLD && currentStatus === CURRENT_STATUS.ASSIGNED)) {
                    // 注文書レコードを新規作成
                    const salesOrder = record.create({
                        type: record.Type.SALES_ORDER,
                        isDynamic: true
                    });

                    // 置き換え項目の一覧リスト
                    const replaceFieldList = [];

                    // ETONET番号を設定
                    salesOrder.setValue({
                        fieldID: FIELD_ID.ETONET_NO,
                        value: reserveDataObjList[dataLine][FIELD_ID.ETONET_NO]
                    })
                    replaceFieldList.push(FIELD_ID.ETONET_NO);

                    // 外部IDを設定
                    salesOrder.setValue({
                        fieldID: FIELD_ID.EXTERNAL_ID,
                        value: reserveDataObjList[dataLine][FIELD_ID.EXTERNAL_ID]
                    })
                    replaceFieldList.push(FIELD_ID.EXTERNAL_ID);
                
                    // 明細行を追加
                    salesOrder.selectNewLine({ sublistId: 'item' });

                    // アイテムを設定
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.ITEM,
                        value: reserveDataObjList[dataLine][FIELD_ID.ITEM]
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.ITEM);

                    // 場所を設定
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.LOCATION,
                        value: reserveDataObjList[dataLine][FIELD_ID.LOCATION]
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.LOCATION);

                    // 税金コードを設定
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.TAX_CD,
                        value: reserveDataObjList[dataLine][FIELD_ID.TAX_CD]
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.TAX_CD);

                    // 数量を設定（予約数の値を設定）
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.QUANTITY,
                        value: reserveDataObjList[dataLine].reserveQuantity
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.QUANTITY);

                    // 部門を設定
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.DEPARTMENT,
                        value: reserveDataObjList[dataLine][FIELD_ID.DEPARTMENT]
                    })
                    replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.DEPARTMENT);

                    // 出荷保留＆割当済みの場合
                    if (reserveNumber1 === RESERVE_NUMBER_1.SHIPPING_HOLD && currentStatus === CURRENT_STATUS.ASSIGNED) {
                        // 確保を確認済みを設定
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.SECURE_CONFIRMED,
                            value: true
                        })
                    }
                    for (let reserveLine = 0; reserveLine < etonetLib.RESERVE_INFO.length; reserveLine++) {
                        if (etonetLib.RESERVE_INFO[reserveLine].fieldid !== null) {
                            // 設定するフィールドIDを取得
                            let currentFieldId = etonetLib.RESERVE_INFO[reserveLine].fieldid;
                            // 設定済み項目以外の場合
                            if (replaceFieldList.indexOf(currentFieldId) < 0) {
                                if (currentFieldId.indexOf("item:") === 0) {
                                    // 明細行を選択する
                                    salesOrder.selectLine({
                                        sublistId: 'item',
                                        line: 0
                                    });
                                    // 明細行に値を設定する
                                    salesOrder.setCurrentSublistValue({
                                        sublistId: 'item',
                                        // フィールドIDが「item:~」で始まっているため、5文字目以降を設定
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
    
                            // 在庫詳細がある時、在庫詳細を設定
                            if (reserveDataObjList[dataLine].inventoryDetailList) {
    
                                // 在庫詳細サブレコードの作成
                                const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                });
    
                                // 在庫詳細のラインを設定
                                reserveDataObjList[dataLine].inventoryDetailList.forEach(function (detail) {
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
                        }
                    }

                    // 注文書を保存
                    salesOrder.save();

                // 3-2.予約＆割当待ち＆引当数が0以外の場合
                } else if (reserveNumber1 === RESERVE_NUMBER_1.RESERVE && currentStatus === CURRENT_STATUS.WAITING_ALLOCATION && provisionedQuantity !== "0") {
                    // 更新対象の注文書の内部IDを取得
                    const salesOrderId = reserveDataObjList[dataLine].salesOrderId;
                    // 注文書レコードを読み込み
                    const salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId,
                        isDynamic: true
                    });

                    // 設定済み項目のリスト
                    const setItemsList = [];

                    // ETONET番号を設定
                    salesOrder.setValue({
                        fieldID: FIELD_ID.ETONET_NO,
                        value: reserveDataObjList[dataLine][FIELD_ID.ETONET_NO]
                    })
                    setItemsList.push(FIELD_ID.ETONET_NO);

                    // 外部IDを設定
                    salesOrder.setValue({
                        fieldID: FIELD_ID.EXTERNAL_ID,
                        value: reserveDataObjList[dataLine][FIELD_ID.EXTERNAL_ID]
                    })
                    setItemsList.push(FIELD_ID.EXTERNAL_ID);

                    for (let reserveLine = 0; reserveLine < etonetLib.RESERVE_INFO.length; reserveLine++) {
                        // 設定するフィールドIDを取得
                        let currentFieldId = etonetLib.RESERVE_INFO[reserveLine].fieldid;
                        // アイテムライン項目チェック
                        const itemFieldIdChk = currentFieldId.indexOf("item:");
                        // 設定済み項目重複チェック
                        const fieldIdDuplicationChk = setItemsList.indexOf(currentFieldId);
                        // フィールドIDが存在する＆アイテムラインのフィールドIDではない＆設定済み項目ではない場合
                        if (currentFieldId !== null && itemFieldIdChk < 0 && fieldIdDuplicationChk < 0) {
                            // ボディ部分の値を設定する
                            salesOrder.setValue({
                                fieldID: etonetLib.RESERVE_INFO[reserveLine].fieldid,
                                value: reserveDataObjList[dataLine][currentFieldId]
                            })
                        }
                    }

                    // 明細の1行目を選択する
                    salesOrder.selectLine({
                        sublistId: 'item',
                        line: 0
                    });

                    // 数量を設定（引当数を設定）
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.QUANTITY,
                        value: reserveDataObjList[dataLine].provisionedQuantity
                    })

                    // 確保済みを設定（引当数を設定）
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.SECURE_QUANTITY,
                        value: reserveDataObjList[dataLine].provisionedQuantity
                    })

                    // 確保を確認済みを設定
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.SECURE_CONFIRMED,
                        value: true
                    })

                    // 在庫詳細がある時、在庫詳細を設定
                    if (reserveDataObjList[dataLine].inventoryDetailList) {

                        // 在庫詳細サブレコードの作成
                        const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                        });

                        // 在庫詳細のラインを設定
                        reserveDataObjList[dataLine].inventoryDetailList.forEach(function (detail) {
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


                    // 明細の行数を取得する
                    const detailLineCount = salesOrder.getLineCount({
                        sublistId: 'item'
                    });

                    if (detailLineCount >= 2) {
                        // 明細の2行目を選択する
                        salesOrder.selectLine({
                            sublistId: 'item',
                            line: 1
                        });
                    }else{
                        // 明細の2行目を作成する
                        salesOrder.selectNewLine({ sublistId: 'item' });
                    }

                    // 置き換え項目の一覧リスト
                    const replaceFieldList = [];

                    // 数量を設定
                    const subQuantity = reserveDataObjList[dataLine].reserveQuantity - reserveDataObjList[dataLine].provisionedQuantity;
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.QUANTITY,
                        value: subQuantity
                    })
                    replaceFieldList.push(FIELD_ID.QUANTITY);
                    
                    for (let reserveLine = 0; reserveLine < etonetLib.RESERVE_INFO.length; reserveLine++) {
                        if (etonetLib.RESERVE_INFO[reserveLine].fieldid !== null) {
                            // 設定するフィールドIDを取得
                            let currentFieldId = etonetLib.RESERVE_INFO[reserveLine].fieldid;
                            // 設定済み項目以外＆フィールドIDがアイテムラインのものの場合
                            if (replaceFieldList.indexOf(currentFieldId) < 0 && currentFieldId.indexOf("item:") === 0) {
                                // 明細行に値を設定する
                                salesOrder.setCurrentSublistValue({
                                    sublistId: 'item',
                                    // フィールドIDが「item:~」で始まっているため、5文字目以降を設定
                                    fieldID: currentFieldId.slice(5),
                                    value: reserveDataObjList[dataLine][currentFieldId]
                                })
                            }
                        }
                    }

                    // 在庫詳細がある時、在庫詳細を設定
                    if (reserveDataObjList[dataLine].inventoryDetailList) {

                        // 在庫詳細サブレコードの作成
                        const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                        });

                        // 在庫詳細のラインを設定
                        reserveDataObjList[dataLine].inventoryDetailList.forEach(function (detail) {
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

                    // アイテムサブリストで現在選択されているラインを確定
                    salesOrder.commitLine({
                        sublistId: 'item'
                    });


                    // 注文書を保存
                    salesOrder.save();

                // 3-3.予約＆割当済みの場合
                } else if (reserveNumber1 === RESERVE_NUMBER_1.RESERVE && currentStatus === CURRENT_STATUS.ASSIGNED) {
                    // 更新対象の注文書の内部IDを取得
                    const salesOrderId = reserveDataObjList[dataLine].salesOrderId;
                    // 注文書レコードを読み込み
                    const salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId,
                        isDynamic: true
                    });

                    // 明細の1行目を選択する
                    salesOrder.selectLine({
                        sublistId: 'item',
                        line: 0
                    });

                    // 数量を設定（引当数を設定）
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.QUANTITY,
                        value: reserveDataObjList[dataLine].provisionedQuantity
                    })

                    // 確保済みを設定（引当数を設定）
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.SECURE_QUANTITY,
                        value: reserveDataObjList[dataLine].provisionedQuantity
                    })

                    // 確保を確認済みを設定
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldID: FIELD_ID.SECURE_CONFIRMED,
                        value: true
                    })

                    // 在庫詳細がある時、在庫詳細を設定
                    if (reserveDataObjList[dataLine].inventoryDetailList) {

                        // 在庫詳細サブレコードの作成
                        const inventoryRecord = salesOrder.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                        });

                        // 在庫詳細のラインを設定
                        reserveDataObjList[dataLine].inventoryDetailList.forEach(function (detail) {
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

                    // 明細の行数を取得
                    const detailLineCount = salesOrder.getLineCount({
                        sublistId: 'item'
                    });
                    // 明細行が2行以上存在する場合
                    if (detailLineCount >= 2) {
                        for (let detailLine = detailLineCount-1; detailLine >= 1; detailLine--) {
                            // 2行目以降の明細を削除
                            salesOrder.removeLine({
                                sublistId: 'item',
                                line: detailLine
                            });
                        }
                    }

                    // 注文書を保存
                    salesOrder.save();

                // 3-4.上記以外の場合
                } else {
                    // 更新対象の注文書の内部IDを取得
                    const salesOrderId = reserveDataObjList[dataLine].salesOrderId;
                    // 注文書レコードを読み込み
                    const salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId,
                        isDynamic: true
                    });

                    // 更新しない値を設定
                    const replaceFieldList = [];

                    // ETONET番号を設定
                    salesOrder.setValue({
                        fieldID: FIELD_ID.ETONET_NO,
                        value: reserveDataObjList[dataLine][FIELD_ID.ETONET_NO]
                    })
                    replaceFieldList.push(FIELD_ID.ETONET_NO);

                    // 外部IDを設定
                    salesOrder.setValue({
                        fieldID: FIELD_ID.EXTERNAL_ID,
                        value: reserveDataObjList[dataLine][FIELD_ID.EXTERNAL_ID]
                    })
                    replaceFieldList.push(FIELD_ID.EXTERNAL_ID);

                    // 明細の行数を取得
                    const detailLineCount = salesOrder.getLineCount({
                        sublistId: 'item'
                    });
                    for (let detailLine = 0; detailLine < detailLineCount; detailLine++) {
                        // 明細の行を選択する
                        salesOrder.selectLine({
                            sublistId: 'item',
                            line: detailLine
                        });
                        
                        // 注文を終了をtrueにする
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.SECURE_CONFIRMED,
                            value: true
                        })
                        replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.SECURE_CONFIRMED);
        
                        // アイテムを設定
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.ITEM,
                            value: reserveDataObjList[dataLine][FIELD_ID.ITEM]
                        })
                        replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.ITEM);

                        // 場所を設定
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.LOCATION,
                            value: reserveDataObjList[dataLine][FIELD_ID.LOCATION]
                        })
                        replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.LOCATION);

                        // 税金コードを設定
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldID: FIELD_ID.TAX_CD,
                            value: reserveDataObjList[dataLine][FIELD_ID.TAX_CD]
                        })
                        replaceFieldList.push(FIELD_ID.ITEM + ':' + FIELD_ID.TAX_CD);

                        // アイテムサブリストで現在選択されているラインを確定
                        salesOrder.commitLine({
                            sublistId: 'item'
                        });
                    }

                    for (let reserveLine = 0; reserveLine < etonetLib.RESERVE_INFO.length; reserveLine++) {
                        if (etonetLib.RESERVE_INFO[reserveLine].fieldid !== null) {
                            // 設定するフィールドIDを取得
                            let currentFieldId = etonetLib.RESERVE_INFO[reserveLine].fieldid;
                            // 設定済み項目以外＆フィールドIDがアイテムラインのものの場合★
                            if (replaceFieldList.indexOf(currentFieldId) < 0 && currentFieldId.indexOf("item:") === 0) {
                                // 明細の行を選択する
                                salesOrder.selectLine({
                                    sublistId: 'item',
                                    line: 0
                                });
                                // 明細行に値を設定する
                                salesOrder.setCurrentSublistValue({
                                    sublistId: 'item',
                                    // フィールドIDが「item:~」で始まっているため、5文字目以降を設定
                                    fieldID: currentFieldId.slice(5),
                                    value: reserveDataObjList[dataLine][currentFieldId]
                                })
                                if (detailLineCount === 2){
                                    // 明細の行を選択する
                                    salesOrder.selectLine({
                                        sublistId: 'item',
                                        line: 1
                                    });
                                    // 明細行に値を設定する
                                    salesOrder.setCurrentSublistValue({
                                        sublistId: 'item',
                                        // フィールドIDが「item:~」で始まっているため、5文字目以降を設定
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

                    // 注文書を保存
                    salesOrder.save();

                }
            }

            // 5.戻り値を設定
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
        let summaryValue = JSON.parse(summary.value);
        // 1.エラー有無の確認
        let errorFlg = false; // エラー有無フラグ
        // 処理結果をループする
        summaryValue.output.iterator().each(function (key, value) {
            if (value.errorResult) {
                errorFlg = true;
                return false;
            }
            return true;
        });

        // 2.実行ファイルの移動
        // TODO:共通関数の作成待ち

        // 3.エラーファイルの作成
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

        // 3-2.エラーファイル保存
        if (existError) {
            errFileId = errorFile.save();
        }

        // 4.予約・出荷保留連携結果メール送信
        // メール送信先のアドレス取得
        let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
        // TODO:メールのsubject、bodyはカスタムレコード(customrecord_error_mail_info)からの取得に要修正
        let mailSubject = ERROR_MAIL_INFO.SUBJECT;
        let mailBody = ERROR_MAIL_INFO.BODY;

        // エラーメールを送信
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
     * 判定対象リストの値とマスタリスト内の値を比較するチェック
     * @param {*} params 
     * @param {List*} params.subjectList 判定対象リスト
     * @param {List*} params.masterList マスタリスト
     * @param {Boolean*} params.matchCheck 一致チェック
     * @return {Boolean}
     */
    function checkList(params) {
        for (let masterListLine; masterListLine < params.masterList.length; masterListLine++) {
            if (params.matchCheck && !params.subjectList.includes(params.masterList[masterListLine])) {
                // マスタにない値が設定されていたらfalseを返す
                return false;
            }
            if (!params.matchCheck && params.subjectList.includes(params.masterList[masterListLine])) {
                // マスタに存在する値が設定されていたらfalseを返す
                return false;
            }
        }
        return true;
    }

    /**
     * 判定対象と一致するETONET番号を持つ注文書の内部IDを取得する
     * @param {*} params 
     * @param {String*} params.subjectEtonetNo 判定対象のETONET番号
     * @param {List*} params.etonetNoList ETONET番号リスト
     * @param {List*} params.internalIdList 内部IDリスト
     * @return {String} 注文書の内部ID
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