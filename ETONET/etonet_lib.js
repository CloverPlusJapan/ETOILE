/**
 * @NApiVersion 2.1
*/
define([
    'N/search',
    'N/record',
    'N/email',
    'N/format',
    '../LIBRARY/constant_lib.js'
], function (
    search,
    record,
    email,
    format,
    constLib
) {

        /** フォルダ */
        const FOLDER = {
            /** 未処理 */
            UNTREATED: {
                ORDER: '1242',// 受注連携
                RESERVE_INDEX: '1246',//予約出荷保留連携
                CUSTOMER: '1250'// 顧客連携 
            }
        }

        /** 変換情報 */
        // TODO:マスタ登録後に要修正
        const CONVERSION_INFO = {
            /** データ区分 */
            DATA_CLASS: {
                1: "1",
                2: "2",
                3: "3",
                4: "4"
            },
            /** 精算方法区分 */
            PAY_TYPE: {
                20: "20",
                30: "30",
                31: "31",
                32: "32",
                40: "40",
                45: "45",
                50: "50",
                60: "60",
                97: "97",
                98: "98",
                99: "99"
            },
            /** 受渡区分 */
            DELIVER_TYPE: {
                1: "1",
                2: "2",
                3: "3",
                4: "4",
                5: "5"
            },
            /** 適用消費税コード */
            APPLIED_TAX_CD: {
                '02': "11", // 軽減税率8%
                '03': "10", // 10%
                '05': "9" // 非課税
            },
            /** 受注経路区分 */
            ORDER_ROUTE_TYPE: {
                '01': "01", // EC
                '02': "02", // 購入履歴
                '03': "03", // 品番指定
                '04': "04", // お気に入り
                '09': "09" // 予約・出荷保留・代理受注
            },
            /** 割引区分 */
            DISCOUNT_CATEGORY: {
                0: "0", // 通常
                3: "3", // セール（値引除く）
                4: "4", // 価格変更
                5: "5", // 顧客別割引
                6: "6", // 顧客別割増
                7: "7", // 顧客別割引+セール
                8: "8", // 顧客別割増+セール
            },
            /** 操作代行区分 */
            OPERATION_PROXY_TYPE: {
                0: "0", // なし
                1: "1", // あり
            },
            /** 顧客別価格区分 */
            CUSTOMER_PRICE_TYPE: {
                0: "0", // 通常
                3: "3", // 顧客別割引
                4: "4", // 顧客別割増
            },
            /** お届け先担当者敬称 */
            MANGER_HONORIFIC_TITLE: {
                0: "0", // 敬称なし
                1: "1", // Mr.
                2: "2", // Ms.
            },
            /** 販売ステータス */
            SALE_STATUS: {
                '01': "01", // ON
            },
            /** 掲載ステータス */
            PUBLISH_STATUS: {
                '03': "03", // 掲載済み
            },
            /** 販売先限定区分 */
            LIMITED_SALES_CATEGORY: {
                0: "0", // 通常商品
                1: "1", // 販路限定販売商品
            },
            /** 集計区分 */
            AGGREGATION_CATEGORY: {
                1: "1", // 商品
                2: "2", // 商品外
                3: "3", // 合計
            },
            /** 予約番号1 */
            RESERVATION_NUMBER_1: {
                R: "R", // 予約
                T: "T", // 出荷保留
            },
            /** 優先度 */
            ORDER_PRIORITY: {
                '2': "2", // 特
                '1': "1", // 高
                '0': "0", // 中
                '-1': "-1", // 低
            },
            /** 現在状態 */
            CURRENT_STATUS: {
                0: "0", // 割当待ち
                1: "1", // 割当済み
                2: "2", // 注文済み
                3: "3", // 解約
                4: "4", // 期限切れ
            },
            /** 代理者予約フラグ */
            AGENCY_ORDER_FLG: {
                0: "0", // なし
                1: "1", // あり
            },
            /** 更新区分 */
            UPDATE_CATEGORY: {
                1: "1", // 新規
                2: "2", // 修正
                3: "3", // 削除
            },
            /** 対応言語 */
            SUPPORTED_LANGUAGE: {
                1: "1", // 日本語
                2: "2", // 英語
                3: "3", // 繁体字
                4: "4", // 簡体字
                5: "5", // 韓国語
                6: "6", // その他
            },
            /** メール受信言語 */
            MAIL_RECEIVING_LANGUAGE: {
                1: "1", // 日本語
                2: "2", // 英語
                3: "3", // 繁体字
                4: "4", // 簡体字
                5: "5", // 韓国語
            },
            /** 本支店区分 */
            HEAD_BRANCH_DIVISION: {
                1: "1", // 本店
                2: "2", // 支店
                3: "3", // 単店
            },
            /** 年賀状区分 */
            NEW_YEARS_CARD_CD: {
                1: "1", // 喪中
                2: "2", // なし
            },
            /** 規約区分 */
            TERMS_AND_CONDITIONS: {
                0: "0", // なし
                1: "1", // 依頼日
                2: "2", // 受理日
            },
            /** サービス基準金額 */
            SERVICE_STANDARD_AMOUNT: {
                0: "0", // 常時サービス
                1: "1", // 1万以上サービス
                2: "2", // 2万以上サービス
                3: "3", // 3万以上サービス
                4: "4", // 4万以上サービス
                5: "5", // 5万以上サービス
            },
            /** 売り場所所有形態 */
            SALES_PLACE: {
                1: "1", // 自己所有
                2: "2", // テナント
            },
            /** EKを利用する目的 */
            PURPOSE_OF_USE: {
                1: "1", // お店を新たに始めるため
                2: "2", // 新規商品の開拓,増加のため
                3: "3", // 既存取引先から仕入れができなくなったため
                4: "4", // 情報収集
                5: "5", // その他
            },
            /** 弊社を知ったきっかけ */
            HOW_FOUND_OUR_CONPANY: {
                1: "1", // インターネットで検索
                2: "2", // 知人の紹介
                3: "3", // 雑誌、新聞、書籍など
                4: "4", // その他→詳細
            },
            /** 主な取引先 */
            MAJOR_TRADING_PARTNERS: {
                1: "1", // ネット仕入れ
                2: "2", // メーカー
                3: "3", // 問屋
                4: "4", // 専門商社
                5: "5", // その他
            },
            /** 日本からの仕入先 */
            SUPPLIERS_FROM_JAPAN: {
                1: "1", // メーカー
                2: "2", // 現金問屋
                3: "3", // ネット卸
                4: "4", // その他
            },
            /** 店舗のテイストイメージ */
            SHOP_TASTE_IMAGE: {
                1: "1", // モダン
                2: "2", // シンプル
                3: "3", // ナチュラル
                4: "4", // カジュアル
                5: "5", // ポップ
            },
            /** 服や服飾のイメージ */
            FASHION_IMAGE: {
                1: "1", // クラシック
                2: "2", // モダン
                3: "3", // マニッシュ
                4: "4", // スポーティブ
                5: "5", // アバンギャルド
            },
            /** 扱っているインテリア/生活雑貨のイメージ */
            INTERIOR_IMAGE: {
                1: "1", // クラシック
                2: "2", // モダン
                3: "3", // ポップ
                4: "4", // ナチュラル
                5: "5", // アバンギャルド
                6: "6", // エスニック
                7: "7", // シンプル
                8: "8", // エレガント
                9: "9", // カジュアル
                10: "10", // その他
            },
            /** 取扱い商品(アパレル)の価格帯 */
            APPAREL_PLICE_RANGE: {
                1: "1", // 5000円未満
                2: "2", // 5000円~10000円未満
                3: "3", // 10000円~30000円未満
                4: "4", // 30000円以上
            },
            /** 取扱い商品(雑貨)の価格帯 */
            GOODS_PLICE_RANGE: {
                1: "1", // 500円未満
                2: "2", // 500円~1000円未満
                3: "3", // 1000円~5000円未満
                4: "4", // 5000円以上
            },
            /** 販売形態 */
            SALES_FORM: {
                1: "1", // 実店舗のみ
                2: "2", // ネットのみ
                3: "3", // 実店舗＋ネット
                4: "4", // その他
            },
            /** 会員種別 */
            MEMBERSHIP_TYPE: {
                1: "1", // 通常会員
                2: "2", // 特別便宜
                3: "3", // 仮番登録
                4: "4", // OBOG
                5: "5", // 社員
                6: "6", // パート
                7: "7", // 派遣
                8: "8", // 取引先メーカー
                9: "9", // 社内便宜用
                10: "10", // 代行業者
                11: "11", // 個人会員
                12: "12", // 会計管理用
            },
            /** 統一伝票・様式コード */
            STYLE_CODE: {
                1: "1", // チェーンストア
                2: "2", // 百貨店
            },
            /** 統一伝票・商品コード印字位置 */
            PRODUCT_CD_PRINTING_POSITION: {
                1: "1", // 品名欄上段に印字
                2: "2", // 商品コード欄に印字
            },
            /** お仕入データ・処理区分 */
            PROCESSING_DIVISION: {
                1: "1", // Mail71
                2: "2", // Mail9
                3: "3", // Mail91
                4: "4", // Edi6
                5: "5", // Mail10
            },
            /** お仕入データ・送信方法 */
            HOW_TO_SEND: {
                1: "1", // メール
                2: "2", // EDI
            },
            /** 振替区分 */
            TRANSFER_CLASS: {
                1: "1", // 都銀
                2: "2", // 地銀
                3: "3", // 郵便局
            },
            /** 引落日 */
            WITHDRAWAL_DATE: {
                1: "1", // 北海道
                2: "2", // 地銀
                3: "3", // 郵便局
                5: "5", // りそな
                6: "6", // みずほ
                7: "7", // 三菱UFJ
            },
            /** 預金区分 */
            DEPOSIT_CLASS: {
                1: "1", // 普通
                2: "2", // 当座
            },
            /** 個人名義 */
            INDIVISUAL_NAME: {
                1: "1", // 個人名義
                2: "2", // 否
            },
            /** 締日区分 */
            CLOSING_DATE_CLASS: {
                1: "1", // 5日
                2: "2", // 10日
                3: "3", // 15日
                4: "4", // 20日
                5: "5", // 25日
                6: "6", // 末
            },
            /** 会区分 */
            ASSOCIATION_CLASS: {
                1: "1", // 送付無
                2: "2", // 経理請
                3: "3", // 担当請
            },
            /** 入金方法 */
            PAYMENT_METHOD: {
                1: "1", // 経理入金
                2: "2", // 通信入金
                3: "3", // 振替入金
                4: "4", // 売り場入金
                5: "5", // 銀行入金
            },
            /** 手数料区分 */
            COMMISSION_CLASS: {
                1: "1", // 弊社負担
                2: "2", // 相手先負担
            },
            /** 法人・個人事業主区分 */
            BUSINESS_OWNER_CLASS: {
                1: "1", // 法人
                2: "2", // 個人
            },
            /** 返済方法 */
            REPAYMENT_METHOD: {
                1: "1", // 振込
                2: "2", // 口座振替
            },
            /** 運送便コード */
            TRANSPORT_CODE: {
                '02': "02", // 佐川急便
                '25': "25", // ヤマト運輸
                '45': "45", // 日本郵便
            },
            /** 性別 */
            GENDER: {
                0: "0", // 不明
                1: "1", // 男性
                2: "2", // 女性
            },
        }

        /**
         * 受注連携ヘッダの情報
         *  fieldidについて
         *   ・複数のフィールドを指定する場合はカンマで区切る
         *   ・サブリスト(明細)のフィールドを指定する場合はサブリストIDとフィールドIDをコロンで区切る
         **/
        const HEADER_INFO = [
            {index:0,label:"受注日",fieldid:"trandate",isRequired:true,isInteger:false,isDate:true,list:null},
            {index:1,label:"ETONET番号",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:2,label:"データ区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DATA_CLASS),conversionInfo: CONVERSION_INFO.DATA_CLASS},
            {index:3,label:"受注時間",fieldid:"custbody_etonet_registration_time",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:4,label:"受信日",fieldid:"custbody_csv_receive_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:5,label:"受信時間",fieldid:"custbody_csv_receive_time",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"ユーザＩＤ",fieldid:"entity",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:7,label:"店名",fieldid:"billaddress:addressee",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:8,label:"郵便番号",fieldid:"billaddress:zip",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:9,label:"住所１",fieldid:"billaddress:state",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:10,label:"住所２",fieldid:"billaddress:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:11,label:"住所３",fieldid:"billaddress:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:12,label:"電話番号",fieldid:"billaddress:addrphone",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:13,label:"お届け先?",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:14,label:"お届け先店名",fieldid:"addressee",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:15,label:"お届け先郵便番号",fieldid:"zip",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"お届け先住所１",fieldid:"city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:17,label:"お届け先住所２",fieldid:"addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:18,label:"お届け先住所３",fieldid:"addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:19,label:"お届け先住所４",fieldid:"addr3",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:20,label:"お届け先担当者敬称",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.MANGER_HONORIFIC_TITLE),conversionInfo:CONVERSION_INFO.MANGER_HONORIFIC_TITLE},
            {index:21,label:"お届け先担当者名",fieldid:"attention",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:22,label:"お届け先国コード",fieldid:"country",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:23,label:"お届け先電話番号",fieldid:"addrphone",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:24,label:"精算方法区分",fieldid:"custbody_payment_method_kbn",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PAY_TYPE),conversionInfo: CONVERSION_INFO.PAY_TYPE},
            {index:25,label:"精算場所コード",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:26,label:"出荷希望日",fieldid:"shipdate",isRequired:true,isInteger:false,isDate:true,list:null},
            {index:27,label:"品切時対応区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:28,label:"電話注文同送",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:29,label:"保留品同送",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:30,label:"ＦＡＸ注文同送",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:31,label:"コメント",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:32,label:"商品金額計",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:33,label:"ECサイト値引率",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:34,label:"送料金額",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:35,label:"小計",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:36,label:"消費税額",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:37,label:"受注金額合計",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:38,label:"仕入日",fieldid:"custbody_purchase_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:39,label:"出荷日未定区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:40,label:"欠品時連絡担当者名",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:41,label:"欠品時連絡先",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:42,label:"受渡区分",fieldid:"custbody_delivery_type",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DELIVER_TYPE),conversionInfo: CONVERSION_INFO.DELIVER_TYPE},
            {index:43,label:"受渡区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:44,label:"代行業者メモ",fieldid:"custbody_proxy_operator",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:45,label:"クレジット会社コード",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:46,label:"精算顧客コード",fieldid:"custbody_payment_customer",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:47,label:"ECサイト値引額",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:48,label:"お得意様値引率_通常",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:49,label:"お得意様値引額_通常",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:50,label:"お得意様値引率_ｲﾍﾞﾝﾄ",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:51,label:"お得意様値引額_ｲﾍﾞﾝﾄ",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:52,label:"非課税区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:53,label:"課税率",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:54,label:"消費税額_商品計",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:55,label:"箱数",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:56,label:"送料サービス額",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:57,label:"代引手数料額",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:58,label:"代引手数料サービス額",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:59,label:"商品外計",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:60,label:"消費税額_商品外計",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:61,label:"値引割引合計額",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:62,label:"運送会社コード",fieldid:"custbody_transport_co",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:63,label:"確認メール送信先件数",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:64,label:"サーチャージ料",fieldid:null,isRequired:false,isInteger:true,isDate:false,list:null},
            {index:65,label:"保険料",fieldid:null,isRequired:false,isInteger:true,isDate:false,list:null},
            {index:66,label:"取引ID",fieldid:"custbody_transaction_id",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:67,label:"取引パスワード",fieldid:"custbody_transaction_pw",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:68,label:"取引状態",fieldid:"custbody_transaction_status",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:69,label:"操作代行区分",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.OPERATION_PROXY_TYPE),conversionInfo:CONVERSION_INFO.OPERATION_PROXY_TYPE},
            {index:70,label:"操作代行者",fieldid:"custbody_operation_proxy",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:71,label:"住所4",fieldid:"addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:72,label:"住所5",fieldid:"addr3",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:73,label:"お届け先住所5",fieldid:"custrecord_addr4",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:74,label:"お届け先住所6",fieldid:"custrecord_addr5",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:75,label:"クーポンコード",fieldid:"custbody_coupon_code",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:76,label:"オーダーID",fieldid:"custbody_gmo_order_id",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:77,label:"通番",fieldid:"order_sequence_number",isRequired:false,isInteger:true,isDate:false,list:null},
        ];

        /**
         * 受注連携明細の情報
         *  fieldidについて
         *   ・複数のフィールドを指定する場合はカンマで区切る
         *   ・サブリスト(明細)のフィールドを指定する場合はサブリストIDとフィールドIDをコロンで区切る
         **/
        const DETAIL_INFO = [
            {index:0,label:"受注日",fieldid:null,isRequired:true,isInteger:false,isDate:true,list:null},
            {index:1,label:"ETONET番号",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:2,label:"データ区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DATA_CLASS),conversionInfo: CONVERSION_INFO.DATA_CLASS},
            {index:3,label:"行?",fieldid:"item:line",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:4,label:"フロアコード",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:5,label:"類番",fieldid:"item:custcol_category_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"品番",fieldid:"item:custcol_product_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:7,label:"CL",fieldid:"item:custcol_color",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:8,label:"SZ",fieldid:"item:custcol_size",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:9,label:"商品名",fieldid:"item:custcol_product_name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:10,label:"通常卸価格",fieldid:"item:custcol_normal_wholesale_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:11,label:"販売卸価格",fieldid:"item:custcol_sales_wholesale_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:12,label:"数量",fieldid:"item:quantity",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:13,label:"金額",fieldid:"item:amount",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:14,label:"詳細カラー名",fieldid:"item:custcol_detail_color",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:15,label:"詳細サイズ名",fieldid:"item:custcol_detail_size",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"販売ステータス",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SALE_STATUS),conversionInfo:CONVERSION_INFO.SALE_STATUS},
            {index:17,label:"掲載ステータス",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PUBLISH_STATUS),conversionInfo:CONVERSION_INFO.PUBLISH_STATUS},
            {index:18,label:"受注経路区分",fieldid:"item:custcol_order_route_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.ORDER_ROUTE_TYPE),conversionInfo:CONVERSION_INFO.ORDER_ROUTE_TYPE},
            {index:19,label:"割引区分",fieldid:"item:custcol_discount_type",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DISCOUNT_CATEGORY),conversionInfo:CONVERSION_INFO.DISCOUNT_CATEGORY},
            {index:20,label:"類品番登録日",fieldid:"item:custcol_commodity_id_regist_date",isRequired:true,isInteger:false,isDate:true,list:null},
            {index:21,label:"販売先限定区分",fieldid:"item:custcol_sales_dest_limit_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.LIMITED_SALES_CATEGORY),conversionInfo:CONVERSION_INFO.LIMITED_SALES_CATEGORY},
            {index:22,label:"客注区分",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:23,label:"小売価格",fieldid:"item:custcol_retail_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:24,label:"卸値率",fieldid:"item:custcol_wholesale_rate",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:25,label:"卸単位",fieldid:"item:custcol_wholesale_unit",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:26,label:"通常卸単価",fieldid:"item:custcol_normal_wholesale_unit_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:27,label:"販売卸単価",fieldid:"item:custcol_sales_wholesale_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:28,label:"操作代行区分",fieldid:"item:custcol_operation_proxy_type",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.OPERATION_PROXY_TYPE),conversionInfo:CONVERSION_INFO.OPERATION_PROXY_TYPE},
            {index:29,label:"操作代行者",fieldid:"item:custcol_operation_proxy",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:30,label:"適用消費税コード",fieldid:"item:custcol_applicable_consump_tax_cd",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.APPLIED_TAX_CD),conversionInfo:CONVERSION_INFO.APPLIED_TAX_CD},
            {index:31,label:"消費税率（課税率）",fieldid:null,isRequired:false,isInteger:true,isDate:false,list:null},
            {index:32,label:"マスタ卸価格",fieldid:"item:custcol_master_wholesale_price",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:33,label:"マスタ卸単価",fieldid:"item:custcol_master_wholesale_unit_price",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:34,label:"顧客別価格区分",fieldid:"item:custcol_customer_price_type",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.CUSTOMER_PRICE_TYPE),conversionInfo:CONVERSION_INFO.CUSTOMER_PRICE_TYPE},
            {index:35,label:"顧客別価格率",fieldid:"item:custcol_customer_price_rate",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:36,label:"顧客別卸価格",fieldid:"item:custcol_customer_wholesale_price",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:37,label:"顧客別卸単価",fieldid:"item:custcol_customer_wholesale_unit_price",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:38,label:"余白",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
        ];

        /**
         * 受注連携メール明細の情報
         *  fieldidについて
         *   ・複数のフィールドを指定する場合はカンマで区切る
         *   ・サブリスト(明細)のフィールドを指定する場合はサブリストIDとフィールドIDをコロンで区切る
         **/
        const MAIL_INFO = [
            {index:0,label:"受注日",fieldid:null,isRequired:true,isInteger:false,isDate:true,list:null},
            {index:1,label:"ETONET番号",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:2,label:"データ区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DATA_CLASS),conversionInfo: CONVERSION_INFO.DATA_CLASS},
            {index:3,label:"通番",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:4,label:"メールアドレス",fieldid:"mail",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:5,label:"余白",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
        ];

        /**
         * 受注連携消費税明細の情報
         *  fieldidについて
         *   ・複数のフィールドを指定する場合はカンマで区切る
         *   ・サブリスト(明細)のフィールドを指定する場合はサブリストIDとフィールドIDをコロンで区切る
         **/
        const TAX_INFO = [
            {index:0,label:"受注日",fieldid:null,isRequired:true,isInteger:false,isDate:true,list:null},
            {index:1,label:"ETONET番号",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:2,label:"データ区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DATA_CLASS),conversionInfo: CONVERSION_INFO.DATA_CLASS},
            {index:3,label:"集計区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.AGGREGATION_CATEGORY),conversionInfo:CONVERSION_INFO.AGGREGATION_CATEGORY},
            {index:4,label:"適用消費税コード",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.APPLIED_TAX_CD),conversionInfo:CONVERSION_INFO.APPLIED_TAX_CD},
            {index:5,label:"消費税率",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:6,label:"消費税対象額",fieldid:"custbody_etonet_nontaxable_amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:6,label:"消費税対象額",fieldid:"custbody_etonet_taxable_amount_10",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:6,label:"消費税対象額",fieldid:"custbody_etonet_taxable_amount_8",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:7,label:"消費税額",fieldid:"custbody_etonet_tax_amount_10",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:7,label:"消費税額",fieldid:"custbody_etonet_tax_amount_8",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:8,label:"余白",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
        ];

        /**
         * 予約・出荷保留連携の情報
         *  fieldidについて
         *   ・複数のフィールドを指定する場合はカンマで区切る
         *   ・サブリスト(明細)のフィールドを指定する場合はサブリストIDとフィールドIDをコロンで区切る
         **/
        const RESERVE_INFO = [
            {index:0,label:"予約番号１",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.RESERVATION_NUMBER_1),conversionInfo:CONVERSION_INFO.RESERVATION_NUMBER_1},
            {index:1,label:"予約番号２",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"予約番号３",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:3,label:"予約番号枝番",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:4,label:"予約日",fieldid:"trandate",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:5,label:"予約時間",fieldid:"custbody_etonet_registration_time",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"会員番号",fieldid:"entity",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:7,label:"類番",fieldid:"item:custcol_category_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:8,label:"品番",fieldid:"item:custcol_product_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:9,label:"CL",fieldid:"item:custcol_color",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:10,label:"SZ",fieldid:"item:custcol_size",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:11,label:"商品登録日",fieldid:"item:custcol_product_registration_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:12,label:"商品名",fieldid:"custcol_product_name",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:13,label:"予約数",fieldid:"item:quantity",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:14,label:"引当数",fieldid:"item:quantity",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:15,label:"引当完了日",fieldid:"item:custcol_allocation_completion_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"引当完了時間",fieldid:"item:custcol_allocation_completion_time",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:17,label:"優先度",fieldid:"item:orderpriority",isRequired:true,isInteger:true,isDate:false,list:Object.keys(CONVERSION_INFO.OPERATION_PROXY_TYPE),conversionInfo:CONVERSION_INFO.ORDER_PRIORITY},
            {index:18,label:"現在状態",fieldid:"item:custcol_current_status",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.CURRENT_STATUS),conversionInfo:CONVERSION_INFO.CURRENT_STATUS},
            {index:19,label:"受注日",fieldid:"item:custcol_order_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:20,label:"受注?",fieldid:"item:custcol_etonet_order_number",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:21,label:"代理予約フラグ",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.AGENCY_ORDER_FLG),conversionInfo:CONVERSION_INFO.AGENCY_ORDER_FLG},
            {index:22,label:"代理予約者コード",fieldid:"custbody_operation_proxy",isRequired:false,isInteger:false,isDate:false,list:null},
        ];

        /**
         * 顧客連携の顧客情報
         *  fieldidについて
         *   ・複数のフィールドを指定する場合はカンマで区切る
         *   ・サブリスト(明細)のフィールドを指定する場合はサブリストIDとフィールドIDをコロンで区切る
         **/
        // TODO:fieldidが""の箇所は要確認、未定のカスタムは「custbody」を仮で前につけている（修正の可能性あり）
        const CUSTOMER_INFO = [
            {index:0,label:"更新区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.UPDATE_CATEGORY),conversionInfo:CONVERSION_INFO.UPDATE_CATEGORY},
            {index:1,label:"会員番号",fieldid:"entityid",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"法人名",fieldid:"companyname",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:3,label:"法人名（カナ）",fieldid:"phoneticname",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:4,label:"メールアドレス",fieldid:"email",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:5,label:"メルマガ受信設定",fieldid:"custbody_mail_setting",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"顧客海外区分",fieldid:"custbody_customer_overseas_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:7,label:"ETONET登録区分",fieldid:"custbody_etonet_reg_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:8,label:"国・地域",fieldid:"custbody_country_or_region",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:9,label:"対応言語（メイン）",fieldid:"custbody_main_lang_support",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPORTED_LANGUAGE),conversionInfo:CONVERSION_INFO.SUPPORTED_LANGUAGE},
            {index:10,label:"対応言語（サブ）",fieldid:"custbody_sub_lang_support",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPORTED_LANGUAGE),conversionInfo:CONVERSION_INFO.SUPPORTED_LANGUAGE},
            {index:11,label:"メール受信言語",fieldid:"custbody_email_recept_lang",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.MAIL_RECEIVING_LANGUAGE),conversionInfo:CONVERSION_INFO.MAIL_RECEIVING_LANGUAGE},
            {index:12,label:"会員規約確認日",fieldid:"custbody_mem_agree_conf_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:13,label:"EC利用停止",fieldid:"custbody_ec_usage_suspend",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:14,label:"本支店区分",fieldid:"custbody_head_office_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.HEAD_BRANCH_DIVISION),conversionInfo:CONVERSION_INFO.HEAD_BRANCH_DIVISION},
            {index:15,label:"本店コード",fieldid:"parent",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"実績合算区分",fieldid:"custbody_perf_agg_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:17,label:"本店精算一括コード",fieldid:"custbody_head_office_sett_bulk_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:18,label:"会員割引区分",fieldid:"custbody_mem_disc_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:19,label:"取引申込日",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:20,label:"会員証発行日",fieldid:"custbody_mem_card_issue_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:21,label:"会員証有効期限",fieldid:"custbody_mem_card_valid_period",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:22,label:"取引開始日",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:23,label:"担当フロア",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:24,label:"計算フロアコード",fieldid:"custbody_calc_floor_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:25,label:"主担当社員番号1",fieldid:"custbody_main_resp_emp_no_1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:26,label:"主担当社員番号2",fieldid:"custbody_main_resp_emp_no_2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:27,label:"会員識別コード→会員ランク",fieldid:"custbody_mem_ident_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:28,label:"会員分類区分",fieldid:"custbody_mem_classification_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:29,label:"識別固定区分",fieldid:"custbody_ident_fixed_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:30,label:"ＤＭチェックコード",fieldid:"custbody_dm_check_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:31,label:"年賀状区分",fieldid:"custbody_ny_card_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.NEW_YEARS_CARD_CD),conversionInfo:CONVERSION_INFO.NEW_YEARS_CARD_CD},
            {index:32,label:"取引中止(ＢＡＤ)コード",fieldid:"custbody_txn_discon_bad_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:33,label:"取引中止コード入力日",fieldid:"custbody_txn_discon_cd_input_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:34,label:"旧識別コード",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:35,label:"注記コード",fieldid:"custbody_note_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:36,label:"更新次止(閉店)コード",fieldid:"custbody_update_stop_closure_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:37,label:"店舗区分（無店舗コード）",fieldid:"custbody_store_type_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:38,label:"一般規約区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TERMS_AND_CONDITIONS),conversionInfo:CONVERSION_INFO.TERMS_AND_CONDITIONS},
            {index:39,label:"一般規約日",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:40,label:"無店舗規約区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TERMS_AND_CONDITIONS),conversionInfo:CONVERSION_INFO.TERMS_AND_CONDITIONS},
            {index:41,label:"無店舗規約日",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:42,label:"ネット規約区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TERMS_AND_CONDITIONS),conversionInfo:CONVERSION_INFO.TERMS_AND_CONDITIONS},
            {index:43,label:"ネット規約日",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:44,label:"サービス基準金額",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SERVICE_STANDARD_AMOUNT),conversionInfo:CONVERSION_INFO.SERVICE_STANDARD_AMOUNT},
            {index:45,label:"備考1",fieldid:"custbody_note_1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:46,label:"備考2",fieldid:"custbody_note_2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:47,label:"備考3",fieldid:"custbody_note_3",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:48,label:"備考4",fieldid:"custbody_note_4",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:49,label:"備考5",fieldid:"custbody_note_5",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:50,label:"備考6",fieldid:"custbody_note_6",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:51,label:"履歴日1",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:52,label:"履歴1",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:53,label:"履歴日2",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:54,label:"履歴2",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:55,label:"履歴日3",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:56,label:"履歴3",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:57,label:"履歴日4",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:58,label:"履歴4",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:59,label:"履歴日5",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:60,label:"履歴5",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:61,label:"履歴日6",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:62,label:"履歴6",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:63,label:"履歴日7",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:64,label:"履歴7",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:65,label:"履歴日8",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:66,label:"履歴8",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:67,label:"履歴日9",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:68,label:"履歴9",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:69,label:"履歴日10",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:70,label:"履歴10",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:71,label:"履歴日11",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:72,label:"履歴11",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:73,label:"履歴日12",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:74,label:"履歴12",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:75,label:"履歴日13",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:76,label:"履歴13",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:77,label:"履歴日14",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:78,label:"履歴14",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:79,label:"履歴日15",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:80,label:"履歴15",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:81,label:"履歴日16",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:82,label:"履歴16",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:83,label:"履歴日17",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:84,label:"履歴17",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:85,label:"履歴日18",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:86,label:"履歴18",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:87,label:"履歴日19",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:88,label:"履歴19",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:89,label:"代表精算区分",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:90,label:"自振区分",fieldid:"",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:91,label:"クレジット区分",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:92,label:"売掛区分",fieldid:"",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:93,label:"スマートプラン区分",fieldid:"custbody_smart_plan_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:94,label:"郵便番号",fieldid:"addressbook:zip",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:95,label:"住所海外区分",fieldid:"addressbook:custbody_addr_over_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:96,label:"都道府県コード",fieldid:"addressbook:custbody_prefecture_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:97,label:"都道府県",fieldid:"addressbook:state",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:98,label:"市区町村",fieldid:"addressbook:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:99,label:"町域名",fieldid:"addressbook:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:100,label:"番地",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:101,label:"建物名",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:102,label:"離島区分",fieldid:"addressbook:custbody_island_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:103,label:"ブロックコード",fieldid:"addressbook:custbody_block_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:104,label:"住所(カナ)",fieldid:"addressbook:custbody_addr_kana",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:105,label:"店舗名",fieldid:"addressbook:addressee",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:106,label:"店名(カナ)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:107,label:"電話番号",fieldid:"addressbook:addrphone",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:108,label:"FAX",fieldid:"addressbook:fax",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:109,label:"店舗写真",fieldid:"custbody_store_photo",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:110,label:"店舗内写真",fieldid:"custbody_interior_photo",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:111,label:"営業証明書",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:112,label:"名刺",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:113,label:"売り場所有形態",fieldid:"custbody_store_own_form",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SALES_PLACE),conversionInfo:CONVERSION_INFO.SALES_PLACE},
            {index:114,label:"売り場面積",fieldid:"custbody_sales_area",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:115,label:"支店有無",fieldid:"custbody_branch_presence",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:116,label:"支店数",fieldid:"custbody_num_of_branches",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:117,label:"創業年",fieldid:"custbody_founding_year",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:118,label:"定休日有無",fieldid:"custbody_reg_holiday_presence",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:119,label:"定休日月",fieldid:"custbody_reg_holiday_mon",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:120,label:"定休日火",fieldid:"custbody_reg_holiday_tue",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:121,label:"定休日水",fieldid:"custbody_reg_holiday_wed",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:122,label:"定休日木",fieldid:"custbody_reg_holiday_thu",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:123,label:"定休日金",fieldid:"custbody_reg_holiday_fri",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:124,label:"定休日土",fieldid:"custbody_reg_holiday_sat",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:125,label:"定休日日",fieldid:"custbody_reg_holiday_sun",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:126,label:"営業時間",fieldid:"custbody_bus_hours",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:127,label:"従業員数",fieldid:"",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:128,label:"年商",fieldid:"",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:129,label:"EKを利用する目的",fieldid:"custbody_purpose_of_ek",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PURPOSE_OF_USE),conversionInfo:CONVERSION_INFO.PURPOSE_OF_USE},
            {index:130,label:"弊社を知ったきっかけ",fieldid:"custbody_how_you_know_us",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.HOW_FOUND_OUR_CONPANY),conversionInfo:CONVERSION_INFO.HOW_FOUND_OUR_CONPANY},
            {index:131,label:"ネットショップの有無",fieldid:"custbody_online_shop_presence",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:132,label:"ネットショップURL",fieldid:"url",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:133,label:"ネットショップの店舗名",fieldid:"custbody_online_shop_store_name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:134,label:"主な取引先",fieldid:"custbody_major_customers",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.MAJOR_TRADING_PARTNERS),conversionInfo:CONVERSION_INFO.MAJOR_TRADING_PARTNERS},
            {index:135,label:"日本からの仕入先",fieldid:"custbody_suppliers_from_jp",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPLIERS_FROM_JAPAN),conversionInfo:CONVERSION_INFO.SUPPLIERS_FROM_JAPAN},
            {index:136,label:"徒歩5分圏内にある施設(立地)ついて",fieldid:"custbody_walking_distance_5min_lo",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:137,label:"業種コード",fieldid:"custbody_industry_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:138,label:"業種２コード",fieldid:"custbody_industry_cd_2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:139,label:"取扱い商品1",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:140,label:"取扱い商品2",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:141,label:"取扱い商品3",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:142,label:"取扱い商品4",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:143,label:"取扱い商品5",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:144,label:"取扱い商品6",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:145,label:"取扱い商品7",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:146,label:"取扱い商品8",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:147,label:"取扱い商品9",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:148,label:"取扱い商品10",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:149,label:"エトワールで仕入れたい商品1",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:150,label:"エトワールで仕入れたい商品2",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:151,label:"エトワールで仕入れたい商品3",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:152,label:"エトワールで仕入れたい商品4",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:153,label:"エトワールで仕入れたい商品5",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:154,label:"エトワールで仕入れたい商品6",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:155,label:"エトワールで仕入れたい商品7",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:156,label:"エトワールで仕入れたい商品8",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:157,label:"エトワールで仕入れたい商品9",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:158,label:"エトワールで仕入れたい商品10",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:159,label:"ターゲットの客層",fieldid:"custbody_target_customer_seg",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:160,label:"店舗のテイストイメージ",fieldid:"custbody_store_taste_image",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SHOP_TASTE_IMAGE),conversionInfo:CONVERSION_INFO.SHOP_TASTE_IMAGE},
            {index:161,label:"扱っている服や服飾雑貨のイメージ",fieldid:"custbody_apparel_accessories_impre",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.FASHION_IMAGE),conversionInfo:CONVERSION_INFO.FASHION_IMAGE},
            {index:162,label:"扱っているインテリア/生活雑貨のイメージ",fieldid:"custbody_interior_living_goods_impre",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.INTERIOR_IMAGE),conversionInfo:CONVERSION_INFO.INTERIOR_IMAGE},
            {index:163,label:"取扱い商品(アパレル）の価格帯",fieldid:"custbody_apparel_price_range",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.APPAREL_PLICE_RANGE),conversionInfo:CONVERSION_INFO.APPAREL_PLICE_RANGE},
            {index:164,label:"取扱い商品（雑貨）の価格帯",fieldid:"custbody_misc_goods_price_range",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.GOODS_PLICE_RANGE),conversionInfo:CONVERSION_INFO.GOODS_PLICE_RANGE},
            {index:165,label:"登録日",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:166,label:"登録時間",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:167,label:"登録者",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:168,label:"更新日",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:169,label:"更新時間",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:170,label:"更新者",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:171,label:"代行業者区分",fieldid:"custbody_proxy_operator_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:172,label:"EC輸出区分",fieldid:"custbody_ec_export_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:173,label:"取引状態",fieldid:"custbody_transaction_status",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:174,label:"販売形態",fieldid:"custbody_sales_form",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SALES_FORM),conversionInfo:CONVERSION_INFO.SALES_FORM},
            {index:175,label:"会員種別",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.MEMBERSHIP_TYPE),conversionInfo:CONVERSION_INFO.MEMBERSHIP_TYPE},
            {index:176,label:"サービスランク",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:177,label:"セグメント",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:178,label:"統一伝票・様式コード",fieldid:"custbody_format_cd",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.STYLE_CODE),conversionInfo:CONVERSION_INFO.STYLE_CODE},
            {index:179,label:"統一伝票・取引先コード",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:180,label:"統一伝票・伝票区分／取引区分",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:181,label:"統一伝票・社店コード／店別",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:182,label:"統一伝票・納品場所名",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:183,label:"統一伝票・商品コード印字位置",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PRODUCT_CD_PRINTING_POSITION),conversionInfo:CONVERSION_INFO.PRODUCT_CD_PRINTING_POSITION},
            {index:184,label:"統一伝票・小売価格印字",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:185,label:"統一伝票・登録日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:186,label:"統一伝票・更新日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:187,label:"お仕入データ・レジ入力顧客番号",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:188,label:"お仕入データ・出力まとめ先顧客番号",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:189,label:"お仕入データ・データ出力先パス名",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:190,label:"お仕入データ・ファイル名",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:191,label:"お仕入データ・処理区分",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PROCESSING_DIVISION),conversionInfo:CONVERSION_INFO.PROCESSING_DIVISION},
            {index:192,label:"お仕入データ・送信方法",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.HOW_TO_SEND),conversionInfo:CONVERSION_INFO.HOW_TO_SEND},
            {index:193,label:"お仕入データ・登録日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:194,label:"お仕入データ・更新日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:195,label:"振替区分",fieldid:"custrecord_2663_change_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TRANSFER_CLASS),conversionInfo:CONVERSION_INFO.TRANSFER_CLASS},
            {index:196,label:"引落日",fieldid:"custrecord_2663_debit_date",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.WITHDRAWAL_DATE),conversionInfo:CONVERSION_INFO.WITHDRAWAL_DATE},
            {index:197,label:"自振可能・不能",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:198,label:"自振指示日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:199,label:"銀行コード",fieldid:"custrecord_2663_entity_bank_code",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:200,label:"銀行支店コード",fieldid:"custrecord_2663_bank_branch_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:201,label:"預金区分",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DEPOSIT_CLASS),conversionInfo:CONVERSION_INFO.DEPOSIT_CLASS},
            {index:202,label:"口座番号",fieldid:"custrecord_2663_entity_acct_no",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:203,label:"預金名義(半角ｶﾅ)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:204,label:"自振備考",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:205,label:"個人名義",fieldid:"custrecord_2663_personal_name",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.INDIVISUAL_NAME),conversionInfo:CONVERSION_INFO.INDIVISUAL_NAME},
            {index:206,label:"自振登録日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:207,label:"自振更新日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:208,label:"締日区分",fieldid:"custbody_clothing_date_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.CLOSING_DATE_CLASS),conversionInfo:CONVERSION_INFO.CLOSING_DATE_CLASS},
            {index:209,label:"会区分",fieldid:"custbody_association_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.ASSOCIATION_CLASS),conversionInfo:CONVERSION_INFO.ASSOCIATION_CLASS},
            {index:210,label:"入金方法",fieldid:"custbody_deposit_method",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PAYMENT_METHOD),conversionInfo:CONVERSION_INFO.PAYMENT_METHOD},
            {index:211,label:"入金予定日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:212,label:"売掛可能・停止",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:213,label:"手数料区分",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.COMMISSION_CLASS),conversionInfo:CONVERSION_INFO.COMMISSION_CLASS},
            {index:214,label:"売掛備考",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:215,label:"売掛指示日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:216,label:"売掛登録日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:217,label:"売掛更新日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:218,label:"法人・個人事業主区分",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.BUSINESS_OWNER_CLASS),conversionInfo:CONVERSION_INFO.BUSINESS_OWNER_CLASS},
            {index:219,label:"法人名/契約者名",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:220,label:"法人/契約者 郵便番号",fieldid:"addressbook:zip",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:221,label:"法人/契約者 都道府県",fieldid:"addressbook:state",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:222,label:"法人/契約者 市区町村",fieldid:"addressbook:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:223,label:"法人/契約者 町域名",fieldid:"addressbook:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:224,label:"法人/契約者 番地",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:225,label:"法人/契約者 建物名",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:226,label:"法人/契約者 電話番号(ハイフンなし)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:227,label:"法人代表者/店舗名・屋号",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:228,label:"請求書 郵便番号",fieldid:"addressbook:zip",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:229,label:"請求書 都道府県",fieldid:"addressbook:state",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:230,label:"請求書 市区町村",fieldid:"addressbook:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:231,label:"請求書 町域名",fieldid:"addressbook:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:232,label:"請求書 番地",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:233,label:"請求書 建物名",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:234,label:"請求書送付先電話番号(ハイフンなし)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:235,label:"請求書送付先宛名",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:236,label:"返済方法",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.REPAYMENT_METHOD),conversionInfo:CONVERSION_INFO.REPAYMENT_METHOD},
            {index:237,label:"スマプラ可能・停止",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:238,label:"スマプラ備考",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:239,label:"スマプラ指示日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:240,label:"スマプラ登録日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:241,label:"スマプラ更新日",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            

        ];

        /**
         * 顧客連携の顧客住所情報
         *  fieldidについて
         *   ・複数のフィールドを指定する場合はカンマで区切る
         *   ・サブリスト(明細)のフィールドを指定する場合はサブリストIDとフィールドIDをコロンで区切る
         **/
        // TODO:fieldidが""の箇所は要確認、未定のカスタムは「custbody」を仮で前につけている（修正の可能性あり）
        const CUSTOMER_ADDRESS_INFO = [
            {index:0,label:"顧客番号",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:1,label:"通番",fieldid:"addressbook:label",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"郵便番号",fieldid:"addressbook:zip",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:3,label:"住所海外区分",fieldid:"addressbook:custbody_addr_over_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:4,label:"都道府県コード",fieldid:"addressbook:custbody_prefecture_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:5,label:"都道府県",fieldid:"addressbook:state",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"市区町村",fieldid:"addressbook:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:7,label:"町域名",fieldid:"addressbook:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:8,label:"番地",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:9,label:"建物名",fieldid:"addressbook:addr3",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:10,label:"離島区分",fieldid:"addressbook:custbody_island_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:11,label:"ブロックコード",fieldid:"addressbook:custbody_block_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:12,label:"お届先名(漢字)",fieldid:"addressbook:addressee",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:13,label:"お届先名(カナ)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:14,label:"電話番号",fieldid:"addressbook:addrphone",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:15,label:"FAX",fieldid:"addressbook:fax",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"運送便コード",fieldid:"addressbook:custbody_ship_service_cd",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TRANSPORT_CODE),conversionInfo:CONVERSION_INFO.TRANSPORT_CODE},
            {index:17,label:"備考",fieldid:"addressbook:custbody_remarks",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:18,label:"連絡区分",fieldid:"addressbook:custbody_contact_cd",isRequired:true,isInteger:false,isDate:false,list:null},
        ];

        /**
         * 顧客連携の顧客担当者情報
         *  fieldidについて
         *   ・複数のフィールドを指定する場合はカンマで区切る
         *   ・サブリスト(明細)のフィールドを指定する場合はサブリストIDとフィールドIDをコロンで区切る
         **/
        // TODO:fieldidが""の箇所は要確認、未定のカスタムは「custbody」を仮で前につけている（修正の可能性あり）
        const CUSTOMER_MANAGER_INFO = [
            {index:0,label:"顧客番号",fieldid:"company",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:1,label:"通番",fieldid:"custbody_tsuban",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"肩書",fieldid:"title",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:3,label:"氏名(漢字)",fieldid:"lastname",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:4,label:"氏名(カナ)",fieldid:"phoneticname",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:5,label:"性別",fieldid:"custbody_gender",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.GENDER),conversionInfo:CONVERSION_INFO.GENDER},
            {index:6,label:"生年月日",fieldid:"custbody_birthday",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:7,label:"顔写真",fieldid:"custbody_portrait",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:8,label:"電話番号",fieldid:"phone",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:9,label:"メールアドレス",fieldid:"email",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:10,label:"メルマガ受信設定",fieldid:"custbody_mail_setting",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:11,label:"対応言語（メイン）",fieldid:"custbody_main_lang_support",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPORTED_LANGUAGE),conversionInfo:CONVERSION_INFO.SUPPORTED_LANGUAGE},
            {index:12,label:"対応言語（サブ）",fieldid:"custbody_sub_lang_support",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPORTED_LANGUAGE),conversionInfo:CONVERSION_INFO.SUPPORTED_LANGUAGE},
        ];

        /**
         * 顧客連携の顧客SNS情報
         *  fieldidについて
         *   ・複数のフィールドを指定する場合はカンマで区切る
         *   ・サブリスト(明細)のフィールドを指定する場合はサブリストIDとフィールドIDをコロンで区切る
         **/
        // TODO:fieldidが""の箇所は要確認、未定のカスタムは「custbody」を仮で前につけている（修正の可能性あり）
        const CUSTOMER_SNS_INFO = [
            {index:0,label:"顧客番号",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:1,label:"通番",fieldid:"custbody_tsuban",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"URL",fieldid:"name",isRequired:true,isInteger:false,isDate:false,list:null},
        ];

        /** ヘッダーインデックス情報 */
        const HEADER_INDEX = {
            /** データ区分 */
            DATA_PARTITION: 2,
            /** ETONET番号 */
            ETONET_NUMBER: 1,
            /** ユーザID */
            USER_ID: 6,
            /** 操作代行者 */
            OPERATION_PROXY: 70,
            /** 受注日 */
            TRANDATE: 0,
            /** ECサイト値引額 */
            EC_SITE_DISCOUNT: 7,
            /** 送料金額 */
            POSTAGE: 34,
            /** 送料サービス額 */
            POSTAGE_SERVICE: 56,
            /** 代引手数料 */
            COD_CHARGE: 57,
            /** 代引手数料サービス額 */
            COD_CHARGE_SERVICE: 58,
            /** 小計 */
            SUBTOTAL: 35,
            /** 商品外計 */
            EXTARNAL_TOTAL: 59,
            /** 消費税額 */
            TAX_AMOUNT: 36,
        }

        /** 明細インデックス情報 */
        const DETAIL_INDEX = {
            /** データ区分 */
            DATA_PARTITION: 2,
            /** 類番 */
            CATEGORY_NUMBER: 5,
            /** 品番 */
            PRODUCT_NUMBER: 6,
            /** カラー */
            COLOR: 7,
            /** サイズ */
            SIZE: 8,
            /** 類品番登録日 */
            COMMODITY_ID_REGIST_DATE: 20,
            /** 数量 */
            QUANTITY: 12,
            /** 顧客別価格区分 */
            CUSTOMER_PRICE_TYPE: 34,
            /** 顧客別卸価格 */
            CUSTOMER_WHOLESALE_PRICE: 36,
            /** マスタ卸価格 */
            MASTER_WHOLESALE_PRICE: 32,
            /** 割引区分 */
            DISCOUNT_TYPE: 19,
            /** 販売卸価格 */
            SALES_WHOLESALE_PRICE: 11,
            /** 適用消費税コード */
            TAX_CD: 30,
        }

        /** メール明細インデックス情報 */
        const MAIL_INDEX = {
            /** メールアドレス */
            MAIL_ADDRESS: 4,
        }

        /** 消費税明細インデックス情報 */
        const TAX_INDEX = {
            /** 適用消費税コード */
            APPLIED_TAX_CD: 4,
            /** 消費税対象額 */
            TAXABLE_AMOUNT: 6,
            /** 消費税額 */
            TAX_AMOUNT: 7,
        }

        /** 予約・出荷保留インデックス情報 */
        const RESERVE_INDEX = {
            /** 予約番号1 */
            RESERVATION_NUMBER_1: 0,
            /** 予約番号2 */
            RESERVATION_NUMBER_2: 1,
            /** 予約番号3 */
            RESERVATION_NUMBER_3: 2,
            /** 予約番号枝番 */
            RESERVATION_SUB_NUMBER: 3,
            /** 現在状態 */
            CURRENT_STATUS: 18,
            /** 引当数 */
            PROVISIONED_QUANTITY: 14,
            /** 予約数 */
            RESERVE_QUANTITY: 13,
            /** 会員番号 */
            MEMBERSHIP_NUMBER: 6,
            /** 類番 */
            CATEGORY_NUMBER: 7,
            /** 品番 */
            PRODUCT_NUMBER: 8,
            /** カラー */
            COLOR: 9,
            /** サイズ */
            SIZE: 10,
            /** 商品登録日 */
            PRODUCT_REGISTRATION_DATE: 11,
        }

        /** 顧客情報インデックス情報 */
        const CUSTOMER_INFO_INDEX = {
            /** 更新区分 */
            UPDATE_CATEGORY: 0,
            /** 顧客番号 */
            CUSTOMER_NUMBER: 1,
            /** 番地（ラベル「DM」） */
            DM_STREET_ADDRESS: 100,
            /** 建物名（ラベル「DM」） */
            DM_BUILDING_NAME: 101,
            /** 番地（ラベル「契約者」） */
            CONTRACTOR_STREET_ADDRESS: 224,
            /** 建物名（ラベル「契約者」） */
            CONTRACTOR_BUILDING_NAME: 225,
            /** 番地（ラベル「明細書送付」） */
            SENDING_STATEMENT_STREET_ADDRESS: 10,
            /** 建物名（ラベル「明細書送付」） */
            SENDING_STATEMENT_BUILDING_NAME: 101,
            /** 履歴日＆履歴開始位置 */
            START_HISTORYS: 51,
            /** 履歴日＆履歴終了位置 */
            END_HISTORYS: 88,
            /** ラベル「DM」住所開始位置 */
            START_DM_ADDRESS: 94,
            /** ラベル「DM」住所終了位置 */
            END_DM_ADDRESS: 108,
            /** 取扱い商品開始位置 */
            START_PRODUCTS_HUNDLED: 139,
            /** 取扱い商品終了位置 */
            END_PRODUCTS_HUNDLED: 148,
            /** エトワールで仕入れたい商品開始位置 */
            START_EK_WANT_PRODUCTS: 149,
            /** エトワールで仕入れたい商品終了位置 */
            END_EK_WANT_PRODUCTS: 158,
            /** ラベル「契約者」住所開始位置 */
            START_CONTRACTOR_ADDRESS: 220,
            /** ラベル「契約者」住所終了位置 */
            END_CONTRACTOR_ADDRESS: 227,
            /** ラベル「明細書送付」住所開始位置 */
            START_SENDING_STATEMENT_ADDRESS: 228,
            /** ラベル「明細書送付」住所終了位置 */
            END_SENDING_STATEMENT_ADDRESS: 235,
            /** 銀行詳細開始位置 */
            START_BANK_DETAIL: 195,
            /** 銀行詳細終了位置 */
            END_BANK_DETAIL: 205,
        }

        /** 顧客住所情報インデックス情報 */
        const CUSTOMER_ADDRESS_INFO_INDEX = {
            /** 顧客番号 */
            CUSTOMER_NUMBER: 0,
        }
        /** 顧客担当者情報インデックス情報 */
        const CUSTOMER_MANAGER_INFO_INDEX = {
            /** 顧客番号 */
            CUSTOMER_NUMBER: 0,
        }
        /** 顧客SNS情報インデックス情報 */
        const CUSTOMER_SNS_INFO_INDEX = {
            /** 顧客番号 */
            CUSTOMER_NUMBER: 0,
        }

        /** フィールド階層セパレータ文字列 */
        const FIELD_SEPARATOR = ",";

        /** フィールド階層セパレータ文字列 */
        const FIELD_LEVEL_SEPARATOR = ":";

        /**
         * インデックスからヘッダ情報を抽出する
         * @param {*} index
         * @returns
         */
        function findHeaderByIndex(index) {
            return HEADER_INFO.find(val => val.index == index);
        }
        
        /**
         * インデックスから明細情報を抽出する
         * @param {*} index
         * @returns
         */
        function findDetailByIndex(index) {
            return DETAIL_INFO.find(val => val.index == index);
        }
        
        /**
         * インデックスからメール情報を抽出する
         * @param {*} index
         * @returns
         */
        function findMailByIndex(index) {
            return MAIL_INFO.find(val => val.index == index);
        }
        
        /**
         * インデックスから消費税情報を抽出する
         * @param {*} index
         * @returns
         */
        function findTaxByIndex(index) {
            return TAX_INFO.find(val => val.index == index);
        }
        
        /**
         * インデックスから予約出荷保留情報を抽出する
         * @param {*} index
         * @returns
         */
        function findReserveByIndex(index) {
            return RESERVE_INFO.find(val => val.index == index);
        }
        
        /**
         * インデックスから顧客情報を抽出する
         * @param {*} index
         * @returns
         */
        function findCustomerByIndex(index) {
            return CUSTOMER_INFO.find(val => val.index == index);
        }
        
        /**
         * ラベル名からヘッダ情報を抽出する
         * @param {*} label
         * @returns
         */
        function findHeaderByLabel(label) {
            return HEADER_INFO.find(val => val.label == label);
        }

        /**
         * ラベル名から明細情報を抽出する
         * @param {*} label
         * @returns
         */
        function findDetailByLabel(label) {
            return DETAIL_INFO.find(val => val.label == label);
        }

        /**
         * ラベル名からメールアドレス情報を抽出する
         * @param {*} label
         * @returns
         */
        function findMailByLabel(label) {
            return MAIL_INFO.find(val => val.label == label);
        }

        /**
         * ラベル名から消費税情報を抽出する
         * @param {*} label
         * @returns
         */
        function findTaxByLabel(label) {
            return TAX_INFO.find(val => val.label == label);
        }

        /**
         * 入力チェック
         * @param {*} dataInfo データ情報
         * @param {*} value 値
         * @returns エラータイプ
         */
        function validationCheck(dataInfo, value) {
            let errorDetail = {
                errorResult: "正常",// エラー処理結果
                errorContent: ""// エラー項目
            };
            // 2.必須チェック
            if (dataInfo.isRequired) {
                if (value == "") {
                    errorDetail.errorResult = "必須チェックエラー";
                    errorDetail.errorContent = dataInfo.label;
                    return errorDetail;
                }
            }
            else if (value == "") {
                // 必須項目以外で値が空の場合はチェックせず、正常応答
                return errorDetail;
            }

            // 3.リスト値チェック
            if (dataInfo.list != null && dataInfo.list.indexOf(value) < 0) {
                errorDetail.errorResult = "リスト値チェックエラー";
                errorDetail.errorContent = dataInfo.label;
                return errorDetail;
        }

            // 4.数値チェック
            if (dataInfo.isInteger && isNaN(value)) {
                errorDetail.errorResult = "数値チェックエラー";
                errorDetail.errorContent = dataInfo.label;
                return errorDetail;
        }
            // 5.日付チェック
            if (dataInfo.isDate && isNaN(new Date(value).getTime())) {
                errorDetail.errorResult = "日付チェックエラー";
                errorDetail.errorContent = dataInfo.label;
                return errorDetail;
        }

            return errorDetail;
        }

        return {
            FOLDER: FOLDER,
            HEADER_INFO: HEADER_INFO,
            DETAIL_INFO: DETAIL_INFO,
            MAIL_INFO: MAIL_INFO,
            TAX_INFO: TAX_INFO,
            RESERVE_INFO: RESERVE_INFO,
            CUSTOMER_INFO: CUSTOMER_INFO,
            CUSTOMER_ADDRESS_INFO: CUSTOMER_ADDRESS_INFO,
            CUSTOMER_MANAGER_INFO: CUSTOMER_MANAGER_INFO,
            CUSTOMER_SNS_INFO: CUSTOMER_SNS_INFO,
            HEADER_INDEX: HEADER_INDEX,
            DETAIL_INDEX: DETAIL_INDEX,
            MAIL_INDEX: MAIL_INDEX,
            TAX_INDEX: TAX_INDEX,
            RESERVE_INDEX: RESERVE_INDEX,
            CUSTOMER_INFO_INDEX: CUSTOMER_INFO_INDEX,
            CUSTOMER_ADDRESS_INFO_INDEX: CUSTOMER_ADDRESS_INFO_INDEX,
            CUSTOMER_MANAGER_INFO_INDEX: CUSTOMER_MANAGER_INFO_INDEX,
            CUSTOMER_SNS_INFO_INDEX: CUSTOMER_SNS_INFO_INDEX,
            FIELD_SEPARATOR: FIELD_SEPARATOR,
            FIELD_LEVEL_SEPARATOR: FIELD_LEVEL_SEPARATOR,
            CONVERSION_INFO: CONVERSION_INFO,
            validationCheck: validationCheck,
            findHeaderByIndex: findHeaderByIndex,
            findDetailByIndex: findDetailByIndex,
            findMailByIndex: findMailByIndex,
            findTaxByIndex: findTaxByIndex,
            findReserveByIndex: findReserveByIndex,
            findCustomerByIndex: findCustomerByIndex,
            findDetailByLabel: findDetailByLabel,
            findHeaderByLabel: findHeaderByLabel,
            findMailByLabel: findMailByLabel,
            findTaxByLabel: findTaxByLabel
        }

});