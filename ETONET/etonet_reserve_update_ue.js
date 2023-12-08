/**
 * ETONET_予約・出荷保留連携
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @Version 1.0
 * @CreatedBy Mariya Sawada
 * @CreatedDate 2023/11/22
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

    // TODO:共通関数からのエラーメール送信に要修正
    /** その他エラーメール情報 */
    const ERROR_MAIL_INFO = {
        SUBJECT: "【NetSuite】ETONET予約・出荷保留連携処理エラー",
        BODY: "ETONET連携の予約・出荷保留連携処理にて、予約番号{etonetNo}にバックオーダーチェックエラーが発生しました。"
    }

    function afterSubmit(context) {
        let currentRec = context.newRecord; // 送信中のレコードを取得

        // 1.対象の判定
        // サブリスト「アイテム」の行数取得
        const itemLines = currentRec.getLineCount('item');
        // レコードの種類
        const recType = currentRec.type;
        // トランザクションの種類が「注文書」以外の場合、処理を終了
        if (recType != "SALES_ORDER") {
            return;
        }
        // 伝票種類
        const salesType = currentRec.getValue(FIELD_ID.TRAN_TYPE);
        // 伝票種類が「ETONET予約出荷保留」以外の場合、処理を終了
        if (salesType != "ETONET予約出荷保留") {
            return;
        }
        // ETONET番号を取得
        const etonetNo = currentRec.getValue(FIELD_ID.ETONET_NUMBER);
        // ETONET番号の頭文字が"R"＆レコードタイプが新規作成の場合、処理を終了
        if (etonetNo.startWith('R') && context.type === context.UserEventType.CREATE) {
            return;
        }


        // 2.バックオーダーチェック
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
                let mailSubject = ERROR_MAIL_INFO.SUBJECT
                let mailBody = ERROR_MAIL_INFO.BODY.replace("{etonetNo}", etonetNo);
            
                // TODO:共通関数からのエラーメール送信に要修正
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
        }
    }
    return {
        afterSubmit: afterSubmit
    }

});