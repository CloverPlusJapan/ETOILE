/**
 *   計算書作成
 *  Author: 宋金来
 *  Date : 2023/11/27
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/email', 'N/log', 'N/render', 'N/runtime', 'N/format', 'N/record', 'N/file'],
    function (search, email, log, render, runtime, format, record, file) {

        const TEMPLATE_ID = 118;	//請求書PDFテンプレート（アドバンストPDFテンプレートID）
        const TEMPLATE_ID_CM = 119;	//Protea クレジットメモ（アドバンストPDFテンプレートID）
        const STATEMENT_ID = 256;	//お取引一覧表	（カスタムフォーム）
        function getInputData() {
            //保存検索
            let statementSearch = runtime.getCurrentScript().getParameter({
                name: 'custscript_statement_search'
            });

            let customerSearchObj = search.load({
                id: statementSearch
            });
            return customerSearchObj;
        }

        function map(context) {
            try {
                let mapData = JSON.parse(context.value);
                let mapDataValues = mapData.values;
                let mapEntityId = mapData.id

                //開始日
                let startDate = runtime.getCurrentScript().getParameter({
                    name: 'custscript_start_date'
                });
                //計算書日付
                let statementDate = runtime.getCurrentScript().getParameter({
                    name: 'custscript_statement_date'
                });
                //フォルダ
                let statementFolder = runtime.getCurrentScript().getParameter({
                    name: 'custscript_statement_folder'
                });

                //トランザクション残高チェック
                let balSearch = search.load({
                    id: 'customsearch_balance_search'	///顧客残高検索 Script
                });

                let filtersBal = balSearch.filters; //reference Search.filters object to a new variable

                filtersBal.push(search.createFilter({ //create new filter
                    name: 'entity',
                    operator: search.Operator.ANYOF,
                    values: mapEntityId	//顧客: map_entityId
                }));

                filtersBal.push(search.createFilter({ //create new filter
                    name: 'trandate',
                    operator: search.Operator.ONORBEFORE,
                    values: statementDate	//日付: 終了日以前
                }));

                let srchRes1 = getItems(balSearch); //run search


                //トランザクションがない場合→ return
                if (srchRes1.length == 0) return;

                //残高を取得
                let value = srchRes1[0].getValue({name: 'amount', summary: search.Summary.SUM}); 	//金額

                //残高が0の場合
                if (value == 0) {
                    //当月トランザクション検索
                    let tranSearchObj = search.load({
                        id: 'customsearch_balance_search'	//顧客残高検索 Script
                    });

                    let filtersTran = tranSearchObj.filters;

                    filtersTran.push(search.createFilter({ //create new filter
                        name: 'entity',
                        operator: search.Operator.ANYOF,
                        values: mapEntityId	//顧客: map_entityId
                    }));

                    filtersTran.push(search.createFilter({ //create new filter
                        name: 'trandate',
                        operator: search.Operator.WITHIN,
                        values: [startDate, statementDate]	//日付: 開始日~終了日 start_date / statement_date
                    }));

                    let srchRes2 = getItems(tranSearchObj); //run search

                    //当月のトランザクションがない場合→ return
                    if (srchRes2.length == 0) return;
                }

                // 2023.05.30 F.Saito add start ***
                // 顧客ID 取得
                let customId = mapDataValues.entityid;
                let dateString = statementDate;
                let dateParts = dateString.split('/');
                let year = dateParts[0];
                let month = dateParts[1];
                let day = dateParts[2];
                let statementDateFormat = String(year) + String(month) + String(day);

                //フォルダ名ルール：　20230220_0031958S
                let csv_save_file_id = createFolder(statementFolder, statementDateFormat, customId);
                log.debug({title: 'map', details: 'csv_save_file_id = ' + csv_save_file_id});
                // 2023.05.30 F.Saito add end   ***

                //計算書の作成
                let transactionFile = render.statement({
                    entityId: parseInt(mapEntityId),
                    formId: STATEMENT_ID, //ご請求一覧表
                    printMode: render.PrintMode.PDF,
                    startDate: startDate,
                    statementDate: statementDate,
                    openTransactionsOnly: false,
                    consolidateStatements: false,
                    inCustLocale: true,
                    subsidiaryId: 6
                });
                if (transactionFile) {
                    try {
                        transactionFile.folder = csv_save_file_id;
                        transactionFile.name = statementDateFormat + "_" + mapDataValues.altname +"_"+ "様_計算書" + ".pdf";
                        let fileID = transactionFile.save();
                    } catch (e) {
                        log.audit({title: 'A problem occurred whilst creating File', details: e.message})
                    }
                }

                 //請求書作成
                //請求書抽出
                let invSearch = search.load({
                    id: 'customsearch_invoice_print'	//印刷対象請求書検索 Script
                });

                let filtersInv = invSearch.filters; //reference Search.filters object to a new variable
                filtersInv.push(search.createFilter({ //create new filter
                    name: 'entity',
                    operator: search.Operator.ANYOF,
                    values: mapEntityId	//顧客: map_entityId
                }));
                filtersInv.push(search.createFilter({ //create new filter
                    name: 'trandate',
                    operator: search.Operator.WITHIN,
                    values: [startDate, statementDate]	//日付: 開始日~終了日 start_date / statement_date
                }));
                let srchRes = getItems(invSearch); //run search

                //トランザクションがない場合→ return
                if (srchRes.length == 0) return;

                //請求書でループ
                let xml = '';
                for (let count = 0; count < srchRes.length; count++) {
                    let renderer = render.create();
                    let invoiceId = srchRes[count].getValue('internalid');
                    if (srchRes[count].recordType == 'creditmemo') {	//クレジットメモの場合
                        renderer.setTemplateById(TEMPLATE_ID_CM);
                        renderer.addRecord('record', record.load({type: record.Type.CREDIT_MEMO, id: invoiceId}));
                    } else {	//請求書の場合
                        renderer.setTemplateById(TEMPLATE_ID);
                        renderer.addRecord('record', record.load({type: record.Type.INVOICE, id: invoiceId}));
                    }
                    if (count == 0) {	//1件目の場合
                        xml += renderer.renderAsString();
                    } else {	//2件目以降の請求書の場合
                        //前のxmlの最終行削除
                        let xmlLines = xml.split('\n');
                        xmlLines.pop();

                        xml = xmlLines.join('\n');
                        //先頭から２行削除
                        let inputString = renderer.renderAsString();

                        let StringLines = inputString.split('\n');
                        StringLines.shift();
                        StringLines.shift();

                        xml += StringLines.join('\n');
                    }
                }

                let filePDF = render.xmlToPdf({
                    xmlString: xml
                });

                //let filePDF = renderer.renderAsPdf();
                let base64 = filePDF.getContents();

                //ファイル名　20230220_0031958S たくまシーマックス様_請求書
                let fileName = statementDateFormat + "_" + mapDataValues.altname + "様_請求書" + ".pdf";

                try {
                    let fileObj = file.create({
                        name: fileName,
                        folder: csv_save_file_id,
                        fileType: file.Type.PDF,
                        contents: base64,
                    })
                    fileObj.save();
                } catch (e) {
                    log.audit("error", e.message);
                }
            } catch (e) {
                log.audit({title: 'A problem occurred whilst ', details: e.message})
                log.audit({title: 'e.stack', details: e.stack})
            }

        }

        /**
         * 名称：createFolder
         * パラメータ：
         *   oyafolderId：親フォルダID
         *   statementDate：計算書日付
         *   customId：顧客ID
         *  説明：
         *    親フォルダ直下に、顧客ID + 計算書日付のフォルダを作成する
         */
        function createFolder(oyafolderId, statementDate, customId) {
            // 顧客ID + 計算書日付(パラメータ：custscript_statement_date)
            let nameId = statementDate + "_" + isUndefined(customId);
            //フォルダ存在チェック
            let folderSearch = search.create({
                type: search.Type.FOLDER,
                filters: [
                    ['name', 'is', nameId],
                    'AND',
                    ['parent', 'anyof', oyafolderId],	//親フォルダ
                ]
            });

            let searchResult = folderSearch.run().getRange({
                start: 0,
                end: 1
            });

            //既存フォルダが存在する場合、
            if (searchResult.length > 0) {
                let folderId = searchResult[0].id;
                return folderId;
            } else {

                let folder = record.create({
                    type: record.Type.FOLDER
                });
                folder.setValue({
                    fieldId: 'parent',
                    value: oyafolderId
                });
                folder.setValue({
                    fieldId: 'name',
                    value: nameId
                });
                return folder.save();
            }
        }

        function getItems(objSearch) {
            let record = objSearch.run();
            let searchResults = [];
            if (record != null) {
                let resultIndex = 0;
                let resultStep = 1000;
                do {
                    var searchlinesResults = record.getRange({
                        start: resultIndex,
                        end: resultIndex + resultStep
                    });
                    if (searchlinesResults.length > 0) {
                        searchResults = searchResults.concat(searchlinesResults);
                        resultIndex = resultIndex + resultStep;
                    }
                } while (searchlinesResults.length > 0);
            }
            return searchResults;
        }

        function isUndefined(str){
            if (str) {
                return str
            }
            return "";
        }

        return {
            getInputData: getInputData,
            map: map
        };
    });
