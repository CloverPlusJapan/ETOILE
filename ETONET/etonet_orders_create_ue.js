/**
 * ETONET_受注連携
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @Version 1.0
 * @CreatedBy Mariya Sawada
 * @CreatedDate 2023/11/13
 */

define([
    "../LIBRARY/constant_lib.js",
    "../LIBRARY/common_lib.js",
    'N/email'
], function (
    constLib,
    common,
    email
) {
    /** フィールドID */
    const FIELD_ID = {
        /** バック・オーダー */
        BACKORDERED: 'backordered',
        /** 伝票種類 */
        TRAN_TYPE: 'custbody_etonet_tran_type',
        /** ETONET番号 */
        ETONET_NUMBER: 'custbody_etonet_so_number',
    }

    /** メッセージID */
    const MESSAGE_ID = {
        ORDERS_CREATE_UE: 'ETONET_OEDERS_CREATE_UE_ERROR'
    }

    function afterSubmit(context) {
        let currentRec = context.newRecord; // 送信中のレコードを取得

        // 1.対象の判定
        // サブリスト「アイテム」の行数取得
        const itemLines = currentRec.getLineCount('item');
        // レコードの種類
        const recType = currentRec.type;
        // トランザクションの種類が「注文書」以外の場合、処理を終了
        if (recType != "SALES_ORDER"){
            return;
        }
        // 伝票種類
        const salesType = currentRec.getValue(FIELD_ID.TRAN_TYPE);
        // 伝票種類が「ETONET受注」以外の場合、処理を終了
        if (salesType != "ETONET受注"){
            return;
        }

        // 2.バックオーダーチェック
        // ETONET番号を取得
        const orderNo = currentRec.getValue(FIELD_ID.ETONET_NUMBER);
        // アイテムラインのループ
        for (let itemLine = 0; i < itemLines; itemLine++) {
            // 項目「バックオーダー」が0より大きい場合
            let backOrder = currentRec.getSublistValue({
                sublistId: 'item',
                line: itemLine,
                fieldId: FIELD_ID.BACKORDERED
            });
            if (backOrder > 0){
                // メール送信先のアドレス取得
                let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
                // メール情報を格納
                const mailContent = {};
                mailContent.author = sendTo;
                mailContent.recipients = sendTo;
                mailContent.attachments.push(existError ? [errorFile] : null);
                mailContent.body.push(orderNo);

                // エラーメールを送信
                common.sendMail(mailContent, MESSAGE_ID.ORDERS_CREATE_UE);
                return;
            }
        }
    }
    return {
        afterSubmit: afterSubmit
    }

});