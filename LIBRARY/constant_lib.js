/**
 * @NApiVersion 2.1
*/
define([],
    function () {

        /** Bank Details 口座タイプ */
        const ENTITY_BANK_TYPE = {
            PRIMARY: "1",//プライマリ口座
            SUB: "2",//副口座
        }

        /** 移動伝票ステータス */
        const INV_TRAN_STATUS = {
            PRE_APPROVE: "TrnfrOrd:A",//承認待ち
        }

        /** メールアドレス */
        const EMAIL_ADDRESS = {
            //TODO：システム管理者決定次第修正
            SYS_ADOMINISTRATOR: "m.sawada@four-brains.com",//システム管理者
        }

        /** ファイルキャビネット */
        const CABINET = {
            FORDER: {
            //TODO：フォルダ構成決まり次第修正
            ETONET_ERROR_INFO_CSV: "1227",//ETONET連携エラー詳細フォルダ
            }
        }
        /** CM_アイテム価格自動変更*/
        const ITEM_TYPE = {
            "OthCharge" : "otherchargeitem", // その他の手数料
            "Markup" : "markupitem", // マークアップ
            "Kit" : "kititem",// キット/パッケージ
            "InvtPart" :  "inventoryitem",// 在庫アイテム
            "Discount" : "discountitem", // ディスカウント
            "Service" : "serviceitem", // サービス
            "Assembly" : "assemblyitem",// アセンブリ
            "NonInvtPart" : "noninventoryitem"// 非在庫アイテム
        } // アイテムタイプマッピング

        return {
            ENTITY_BANK_TYPE: ENTITY_BANK_TYPE,
            INV_TRAN_STATUS: INV_TRAN_STATUS,
            EMAIL_ADDRESS: EMAIL_ADDRESS,
            CABINET: CABINET,
            ITEM_TYPE:ITEM_TYPE
        }
    }
);