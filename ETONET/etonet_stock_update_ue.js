/**
 * ETONET_在庫連携
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
    /** フィールドID */
    const FIELD_ID = {
        /** ETONET引当可 */
        ETONET_ALLOCATION_ALLOWED: 'custrecord_etonet_allocation_allowed',
        /** ETONET連携済み */
        ETONET_LINKED_COMPLETED: 'custrecord_etonet_linked_completed',
        /** 場所を無効にする */
        IS_INACTIV: 'isinactive',
        /** 移動先 */
        DESTINATION: 'location',
        /** 移動元 */
        MOVINGSOURCE: 'location',
        /** アイテム */
        ITEM: 'item',
        /** アイテム：場所 */
        ITEM_LOCATION: 'location',
        /** 類番 */
        CATEGORY_NUMBER: 'custcol_category_number',
        /** 品番 */
        PRODUCT_NUMBER: 'custcol_product_number',
        /** カラー */
        COLOR: 'custcol_color',
        /** サイズ */
        SIZE: 'custcol_size',
        /** 類品番登録日 */
        REGISTRATION_DATE: 'custcol_commodity_id_regist_date',
        /** 数量 */
        QUANTITY: 'quantity',
        /** 調整数量 */
        ADJUST_QUANTITY: 'adjustqtyby',
        /** WMS在庫連携 */
        WMS_LINK_FLG: 'custbody_wms_inventory_link_flg',
        /** ステータス */
        STATUS: 'orderstatus',
    }

    /** トランザクションの種類 */
    const TRANSACTION = {
        /** 受領書 */
        ITEM_RECEIPT: "itemreceipt",
        /** 移動伝票 */
        INVENTORY_TRANSFER: "transferorder",
        /** 在庫調整 */
        INVENTORY_ADJUSTMENT: "inventoryadjustment"
    }

    /** エラーCSV接頭辞 */
    const ERROR_FILE_NAME_PREFIX = "error_"

    /** エラーCSVヘッダー */
    const ERROR_CSV_HEADER = ["処理結果", "アイテムID", "在庫数", "在庫変動数"]

    // TODO:エラーメール関係は共通関数から要処理
    /** API接続エラーメール情報 */
    const CONNECT_ERROR_MAIL_INFO = {
        SUBJECT: "【NetSuite】ETONET在庫連携API接続エラー",
        BODY: "ETONET連携の在庫連携処理にて、API接続エラーが発生しました。"
    }

    /** その他エラーメール情報 */
    const ERROR_MAIL_INFO = {
        SUBJECT: "【NetSuite】ETONET在庫連携処理エラー",
        BODY: "ETONET連携の在庫連携処理にて、アイテムID:{itemId}に{errorInfo}が発生しました。\nエラー詳細は添付ファイルをご確認ください。"
    }

    function beforeSubmit(context) {
        const currentRec = context.newRecord; // 送信中のレコードを取得

        // 1.対象の場所取得
        // 検索を作成
        const searchLocationType = "location";
        const searchLocationFilters = [
            [FIELD_ID.ETONET_ALLOCATION_ALLOWED,"is","T"], // 「ETONET引当可フラグ」がオン
            "AND",
            [FIELD_ID.IS_INACTIV,"is","F"] //「場所を無効にする」がオフ
        ];
        const searchLocationColumns = [];

        // 検索結果を取得
        let locationSearchResultList = common.getSearchData(searchLocationType, searchLocationFilters, searchLocationColumns);
        log.debug("対象場所一覧", locationSearchResultList)

        // 2.対象の判定
        // サブリスト「アイテム」の行数取得
        const inventoryLine = currentRec.getLineCount('inventory');
        // レコードの種類
        const recType = currentRec.type;
        log.debug("レコードの種類", recType)

        let targetFlg = false;// 対象判定用フラグ
        const invAdjItemList = [];// 在庫調整対象行情報格納リスト
        for (let locationResult of locationSearchResultList) {
            let location = locationResult.id;
            // 2-1.受領書
            if (recType === TRANSACTION.ITEM_RECEIPT){
                const destination = currentRec.getValue(FIELD_ID.DESTINATION);
                // 項目「移動先」が対象の場所である場合
                if (destination === location){
                    targetFlg = true;
                    break;
                }
            }
            // 2-2.移動伝票
            if (recType === TRANSACTION.INVENTORY_TRANSFER){
                const status = currentRec.getValue(FIELD_ID.STATUS);
                log.debug("status",status)
                // ステータスが「承認待ち」の場合、処理を終了
                if (status === constLib.INV_TRAN_STATUS.PRE_APPROVE){
                    return;
                }
                const movingsource = currentRec.getValue(FIELD_ID.MOVINGSOURCE);
                log.debug("movingsource",movingsource)
                // 項目「移動元」が対象の場所である場合
                if (movingsource === location){
                    log.debug("フラグ変更if確認",movingsource)
                    targetFlg = true;
                    break;
                }
            }
            // 2-3.在庫調整
            if (recType === TRANSACTION.INVENTORY_ADJUSTMENT){
                const wmsFlg = currentRec.getValue(FIELD_ID.WMS_LINK_FLG);
                // 項目「WMS在庫連携」がtrueの場合、処理を終了
                if (wmsFlg) {
                    return;
                }
                // 明細のループ
                for (let i = 0; i < inventoryLine; i++) {
                    let itemLocation = currentRec.getSublistValue({
                        sublistId: 'inventory',
                        line: i,
                        fieldId: FIELD_ID.ITEM_LOCATION
                    });
                    // 項目「アイテム：場所」が対象の場所である場合
                    if (itemLocation === location){
                        targetFlg = true;
                        const invAdjDataOnj = {};
                        // 数量を取得
                        invAdjDataOnj.quantityDiff = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.ADJUST_QUANTITY
                        });
                        log.debug("invAdjDataOnj.quantityDiff",invAdjDataOnj.quantityDiff)

                        // 類番を取得
                        const categoryNumber = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.CATEGORY_NUMBER
                        });
                        // 品番を取得
                        const productNumber = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.PRODUCT_NUMBER
                        });
                        // カラーを取得
                        const color = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.COLOR
                        });
                        // サイズを取得
                        const size = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.SIZE
                        });
                        // 類品番登録日を取得
                        let registrationDate = currentRec.getSublistValue({
                            sublistId: 'inventory',
                            line: i,
                            fieldId: FIELD_ID.REGISTRATION_DATE
                        });
                        // TODO:類品番登録日の変換に問題ないか要調査⇒項目がないため現在確認不可★
                        log.debug("registrationDate",registrationDate)
                        registrationDate = common.setDateToString(registrationDate, 'yyyyMMdd');
                        
                        // アイテムを取得
                        invAdjDataOnj.item = categoryNumber + productNumber + color + size + registrationDate;

                        invAdjItemList.push(invAdjDataOnj)
                    }
                }
            }
        }

        // 在庫調整対象行情報格納リストにデータが1件以上ある時、対象フラグtrue
        if (invAdjItemList.length > 0) {
            targetFlg = true;
        }
        log.debug("対象フラグ", targetFlg)

        // 対象の場所ではない場合、処理を終了
        if (!targetFlg) {
            return;
        }

        // 3.画面の判定
        const targetDataList = [];
        // 3-1.新規作成の場合
        if (recType === TRANSACTION.INVENTORY_ADJUSTMENT) {
            // 在庫調整の場合
            for (let invAdjItem of invAdjItemList) {
                targetDataList.push(invAdjItem);
            }
        }else{
            // 明細の行数を取得
            const detailLineCount = currentRec.getLineCount({
                sublistId: 'item'
            });
            // アイテムと数量を取得し、対象リストに格納
            for (let detailLine = 0; detailLine < detailLineCount; detailLine++){
                const targetData = {};
                // 数量を取得
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

                // 類番を取得
                const categoryNumber = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.CATEGORY_NUMBER
                });
                // 品番を取得
                const productNumber = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.PRODUCT_NUMBER
                });
                // カラーを取得
                const color = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.COLOR
                });
                // サイズを取得
                const size = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.SIZE
                });
                // 類品番登録日を取得
                let registrationDate = currentRec.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: FIELD_ID.REGISTRATION_DATE
                });
                // TODO:※項目自体が伝票にないため、現在確認不可★
                log.debug("registrationDate",registrationDate)
                registrationDate = common.setDateToString(registrationDate, 'yyyyMMdd');
                
                // アイテムを取得
                targetData.item = categoryNumber + productNumber + color + size + registrationDate;

                targetDataList.push(targetData);
            }
        }
        log.debug("対象データリスト", targetDataList)
        // 4.在庫情報の合算
        // 合算後データ格納用リスト
        const totalDataList = [];
        // 格納済みアイテムリスト
        const storedItemList = [];

        for (let targetData of targetDataList) {
            // 4-1.格納済みリスト内に一致する「アイテム」が存在しない場合
            if (storedItemList.indexOf(targetData.item) <0) {
                totalDataList.push(targetData);
                storedItemList.push(targetData.item);
            }else{
                // 4-2.上記以外の場合、一致するアイテムの「数量」に取得した「数量」を足す
                storedItemList.forEach(item => {
                    if (item.item === targetData.item) {
                        item.quantityDiff += targetData.quantityDiff;
                    }
                })
            }
        }
        log.debug("合算済みリスト", totalDataList)
        // 5.リクエストボディ作成
        // 5-1.認証情報の取得
        //const authentication = common.getAPIInfo(constLib.API_KBN['在庫連携']));// TODO:取得元データ実装後コメントアウト解除
        const authentication = {
            user_id: "core_system001",
            request_datetime: "20231101235959001",
            token: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        }// TODO:共通関数実装後削除

        log.debug("認証情報", authentication)

        // 5-2.在庫情報の取得
        const inventoryDataList = [];

        for (let totalData of totalDataList) {
            const inventoryDataObj = {};
            inventoryDataObj.key = totalData.item + '01';
            inventoryDataObj.quantityDiff = totalData.quantityDiff;

            inventoryDataList.push(inventoryDataObj)
        }
        log.debug("在庫情報", inventoryDataList);

        const requestBody = JSON.stringify({
            authentication: authentication,
            stocks: inventoryDataList,
        });
        log.debug("リクエストボディ", requestBody);
        
        // TODO:動作確認用のreturn
        return;

        // 6.ETONETの在庫連携API呼び出し
        // 在庫連携ヘッダー
        const stockUpdateHeader = {
        'Content-Type': 'application/json'
        }

        //項番3で取得したデータをリクエストボディに格納し、ETONETの在庫連携APIを呼び出す
        const requestParams = {
            url: 'https://stg-etonet-admin.ek-enet-dev.com/api/v1/stocks/put-all',
            headers: stockUpdateHeader,
            body: JSON.stringify({
                authentication: authentication,// 認証情報
                stocks: inventoryDataList,// 在庫情報
            })
        };

        //リクエスト送信
        const response = https.post(requestParams);

        log.debug("response", response)

        // 6-1.エラー処理
        const httpStatus = response.code;
        if (httpStatus != constLib.HTTP_STATUS.SUCCESS) {
            let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
            let mailSubject = CONNECT_ERROR_MAIL_INFO.SUBJECT
            let mailBody = CONNECT_ERROR_MAIL_INFO.BODY

            // エラーメールを送信
            email.send({
                author: sendTo,
                subject: mailSubject,
                body: mailBody,
                recipients: sendTo,
                attachments: existError ? [errorFile] : null
            });
            return;
        }

        // 7.データ保存処理
        //リターンコードを取得する
        const returnCd = response.body.result.return_code;

        log.debug("リターンコード", returnCd)

        if (httpStatus === constLib.HTTP_STATUS.SUCCESS && returnCd === '00'){
            // TODO:連携済みフラグはなくなったため不要で、保存処理のみ？
            // 成功の場合、連携済みフラグをtrueに更新しデータ保存を完了
            currentRec.setVAlue({
                fieldId: FIELD_ID.ETONET_LINKED_COMPLETED,
                value: true
            });
            currentRec.save();
        }else{
            // 失敗の場合、データ保存を中止
            return;
        }

        // 8.エラーファイルの作成
        // 現在時刻を取得
        const date = new Date();
        let trandate = new Date(date.setTime(date.getTime() + 1000 * 60 * 60 * 9));
        // タイムスタンプを作成(YYYYMMDDHHMISS)
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

        // ヘッダ情報書込
        let errorCsvHeader = ERROR_CSV_HEADER.join(",") 
        errorFile.appendLine({ value: errorCsvHeader });

        // 8-1.エラー情報の書き込み
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
                errorInfos.push(tranErrorInfo)// 処理結果
                errorInfos.push(errorItem)// アイテムID
                errorInfos.push(tranResultList[i][quantity])// 在庫数
                errorInfos.push(tranResultList[i][quantityDiff])// 在庫変動数
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
                errorInfos.push('レスポンスエラー')// 処理結果
                errorInfos.push(tranResultList[i][key].substr(0,tranResultList[i][key].length-2))// アイテムID
                errorInfos.push("")// 在庫数
                errorInfos.push("")// 在庫変動数
                errorFile.appendLine({ value: errorInfos.join(",") });
                mailErrorItemId = errorItem;
                mailErrorInfo = tranErrorInfo;
            }
        }
        let errFileId = null;
        // 8-2.エラーファイル保存
        if (existError) {
            errFileId = errorFile.save();
            mailSubject = ERROR_MAIL_INFO.SUBJECT
            mailBody = ERROR_MAIL_INFO.BODY
        }

        // 9.在庫連携結果メール送信
        // TODO:エラーメール関係は共通関数で処理
        // メール送信先のアドレス取得
        let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
        let mailSubject = ERROR_MAIL_INFO.SUBJECT
        let mailBody = ERROR_MAIL_INFO.BODY.replace("{itemID}", mailErrorItemId).replace("{errorInfo}", mailErrorInfo);

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
        beforeSubmit: beforeSubmit
    }
});