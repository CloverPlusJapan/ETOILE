/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(["N/runtime", 'N/search', 'N/record', 'N/file', 'N/task', 'N/error', 'N/format'],
    /**
     * @param {task} task
     * @param {runtime} runtime
     */
    function (runtime, search, record, file, task, error, format) {

        /**
         * Definition of the Scheduled script trigger point.
         *
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
         * @Since 2015.2
         */
        function execute(scriptContext) {
        	
        	let script = runtime.getCurrentScript();
        	    
            // CSV名前
            let csvFileName = script.getParameter({name: "custscript_neoss_csv_name"});
                      
            // CSV保存フォルダID
            let csvSaveFolder = script.getParameter({name: "custscript_neoss_csv_folde"});
            
            // CSV
            let csvStr = '';
            const one = '\u2460' 	
            const two = '\u2461' 	
            const three = '\u2462'   
            const four = '\u2463'   
            const five = '\u2464'   
            //ヘッダ名
            csvStr += ['伝票ＩＤ'] + ',' + ['伝票ＩＤ名'] + ',' + ['伝票番号' + one] + ',' + ['伝票番号' + two] + ',' + ['伝票一連NO'] + ',' + ['処理日付（年）' + one] + ',' + ['処理日付（年）' + two] + ',' + ['処理日付（月）'] + ',' + ['処理日付（日）'] + ',' + ['処理時間（時間）'] + ',' + ['処理時間（分）'] 
            	   + ',' + ['処理時間（秒）'] + ',' + ['処理者社員NO'] + ',' + ['処理者社員名'] + ',' + ['処理端末名'] + ',' + ['仕入先コード'] + ',' + ['仕入先郵便番号'] + ',' + ['仕入先住所' + one] + ',' + ['仕入先住所' + two] + ',' + ['仕入先住所' + three] + ',' + ['仕入先名' + one] 
                   + ',' + ['仕入先名' + two] + ',' + ['仕入先名' + three] + ',' + ['仕入先電話番号'] + ',' + ['仕入先ＦＡＸ番号'] + ',' + ['注文日（年）'] + ',' + ['注文日（月）'] + ',' + ['注文日（日）'] + ',' + ['商品納期（年）'] + ',' + ['商品納期（月）'] + ',' + ['商品納期（日）'] + ',' + ['商品区分'] 
                   + ',' + ['商品区分名'] + ',' + ['納入先区分'] + ',' + ['納入先名'] + ',' + ['配品先ﾌﾛｱｺｰﾄﾞ'] + ',' + ['配品先ﾎﾞｯｸｽｺｰﾄﾞ'] + ',' + ['配品先名'] + ',' + ['担当者コード'] + ',' + ['部門コード'] + ',' + ['担当者名'] + ',' + ['入荷日（年）'] + ',' + ['入荷日（月）'] + ',' + ['入荷日（日）'] 
                   + ',' + ['伝票行番号' + one] + ',' + ['類番' + one] + ',' + ['品番' + one] + ',' + ['カラーコード' + one] + ',' + ['サイズコード' + one] + ',' + ['メーカー商品ｺｰﾄﾞ' + one] + ',' + ['ＡＫ' + one] + ',' + ['商品名' + one] + ',' + ['カラー名' + one] + ',' + ['サイズ名' + one] + ',' + ['数量' + one] 
                   + ',' + ['仕入単位' + one] + ',' + ['仕入単価' + one] + ',' + ['仕入金額' + one] + ',' + ['データ状況' + one] + ',' + ['データ状況名' + one] + ',' + ['伝票行番号' + two] + ',' + ['類番' + two] + ',' + ['品番' + two] + ',' + ['カラーコード' + two] + ',' + ['サイズコード' + two] 
                   + ',' + ['ﾒｰｶｰ商品ｺｰﾄﾞ' + two] + ',' + ['ＡＫ' + two] + ',' + ['商品名' + two] + ',' + ['カラー名' + two] + ',' + ['サイズ名' + two] + ',' + ['数量' + two] + ',' + ['仕入単位' + two] + ',' + ['仕入単価' + two] + ',' + ['仕入金額' + two] + ',' + ['データ状況' + two]
            	   + ',' + ['データ状況名' + two] + ',' + ['伝票行番号' + three] + ',' + ['類番' + three] + ',' + ['品番' + three] + ',' + ['カラーコード' + three] + ',' + ['サイズコード' + three] + ',' + ['ﾒｰｶｰ商品ｺｰﾄﾞ' + three] + ',' + ['ＡＫ' + three] + ',' + ['商品名' + three] + ',' + ['カラー名' + three] 
                   + ',' + ['サイズ名' + three] + ',' + ['数量' + three] + ',' + ['仕入単位' + three] + ',' + ['仕入単価' + three] + ',' + ['仕入金額' + three] + ',' + ['データ状況' + three] + ',' + ['データ状況名' + three] + ',' + ['伝票行番号' + four] + ',' + ['類番' + four] + ',' + ['品番' + four] 
            	   + ',' + ['カラーコード' + four] + ',' + ['サイズコード' + four] + ',' + ['ﾒｰｶｰ商品ｺｰﾄﾞ' + four] + ',' + ['ＡＫ' + four] + ',' + ['商品名' + four] + ',' + ['カラー名' + four] + ',' + ['サイズ名' + four] + ',' + ['数量' + four] + ',' + ['仕入単位' + four] + ',' + ['仕入単価' + four] 
                   + ',' + ['仕入金額' + four] + ',' + ['データ状況' + four] + ',' + ['データ状況名' + four] + ',' + ['伝票行番号' + five] + ',' + ['類番' + five] + ',' + ['品番' + five] + ',' + ['カラーコード' + five] + ',' + ['サイズコード' + five] + ',' + ['ﾒｰｶｰ商品ｺｰﾄ' + five] + ',' + ['ＡＫ' + five] 
            	   + ',' + ['商品名' + five] + ',' + ['カラー名' + five] + ',' + ['サイズ名' + five] + ',' + ['数量' + five] + ',' + ['仕入単位' + five] + ',' + ['仕入単価' + five] + ',' + ['仕入金額' + five] + ',' + ['データ状況' + five] + ',' + ['データ状況名' + five] 
            	   + ',' + ['仕入合計金額'] + ',' + ['荷数'] + ',' + ['摘要' + one] + ',' + ['摘要' + two] + ',' + ['摘要' + three] + ',' + ['社員NO'] + ',' + ['社員名'] + ',' + ['予備'] + ',' + ['税率表記'] + ',' + ['摘要' + four] + ',' + ['仕入先事業者番号'] + ',' + ['消費税額'] + ',' + ['税込金額'] 
            	   + '\r\n';

            
                        
            
            // 保存検索
        	let searchType = "transaction";
        	let searchFilters =
				[
			      ["type","anyof","VendBill","VendCred"], 
			      "AND", 
			      ["taxline","is","F"], 
			      "AND", 
			      ["mainline","is","F"]
				];
        	let searchColumns =
				[
				    search.createColumn({name: "createdfrom", label: "作成元"}),
				    search.createColumn({name: "trandate", label: "日付"}),
				    search.createColumn({name: "createdby", label: "作成者"}),
				    search.createColumn({name: "entityid", join: "vendor", label: "仕入先コード"}),
				    search.createColumn({name: "billzipcode", join: "vendor", label: "仕入先郵便番号"}),
				    search.createColumn({name: "billaddress1", join: "vendor", label: "仕入先住所1"}),
				    search.createColumn({name: "billaddress2", join: "vendor", label: "仕入先住所2"}),
				    search.createColumn({name: "billaddress3", join: "vendor", label: "仕入先住所3"}),
				    search.createColumn({name: "altname", join: "vendor", label: "仕入先 : 名前"}),
				    search.createColumn({name: "billphone", join: "vendor", label: "仕入先 : 請求先電話番号"}),
				    search.createColumn({name: "fax", join: "vendor", label: "仕入先ＦＡＸ番号"}),
				    search.createColumn({name: "type", label: "種類"}),
				    search.createColumn({name: "expectedreceiptdate", label: "受領予定日"}),
				    search.createColumn({name: "internalid", join: "item", label: "商品区分"}),
				    search.createColumn({name: "itemid", join: "item", label: "商品区分名"}),
				    search.createColumn({name: "entityid", join: "employee", label: "担当者コード"}),
				    search.createColumn({name: "department", join: "employee", label: "部門コード"}),
				    search.createColumn({name: "altname", join: "employee", label: "担当者名"}),
				    search.createColumn({name: "custcol_received_confirmation_date", label: "入荷確定日"}),
				    search.createColumn({name: "line", label: "伝票行番号1"}),
				    search.createColumn({name: "custitem_category_number", join: "item", label: "類番1"}),
				    search.createColumn({name: "custitem_product_number", join: "item", label: "品番1"}),
				    search.createColumn({name: "name", join: "CUSTCOL_SIZE", label: "サイズコード1"}),
				    search.createColumn({name: "custcol_manufacturer_product_code", label: "メーカー商品ｺｰﾄﾞ1"}),
			        search.createColumn({name: "item", label: "商品名"}),
			        search.createColumn({name: "custcol_color", label: "カラー名"}),
			        search.createColumn({name: "custcol_size", label: "サイズ名"}),
			        search.createColumn({name: "quantity", label: "数量"}),
			        search.createColumn({name: "unit", label: "仕入単位"}),
			        search.createColumn({name: "rate", label: "仕入単価"}),
			        search.createColumn({name: "amount", label: "仕入金額"}),
				];
            
        	let transactionSearchObj = getSearchData(searchType, searchFilters, searchColumns);
        	if (transactionSearchObj && transactionSearchObj.length > 0) {
        		 for (let searchResult = 0; searchResult < transactionSearchObj.length; searchResult++) {
           			 let result = transactionSearchObj[searchResult];
           			 if (type == 'VendBill') { 											// 支払請求書の場合
               			 let slipId = "09";												// 伝票ＩＤ
               			 let slipName = "仕入";											// 伝票ＩＤ名
        				 let expectedreceiptdate = result.getValue("expectedreceiptdate");	    
        				 if (!isEmpty(expectedreceiptdate)) {
        					 let deliveryDate = new Date(expectedreceiptdate);
        					 let deliveryYear = deliveryDate.getFullYear();				// 商品納期（年）
        					 let deliveryMonth = deliveryDate.getMonth() + 1; 			// 商品納期（月）
        					 let deliveryDay = deliveryDate.getDate();					// 商品納期（日）
        				 }
           			 } else {															// 前払金/買掛金調整の場合
               			 let slipId = "26";												// 伝票ＩＤ
               			 let slipName = "返品";											// 伝票ＩＤ名
        				 let deliveryYear = "";											// 商品納期（年）
        				 let deliveryMonth = "";										// 商品納期（月）
        				 let deliveryDay = "";											// 商品納期（日）
           			 }
           			 let createdfrom = result.getValue("createdfrom"); 					// 作成元
           			 if (!isEmpty(createdfrom)) {
           				 let createdfromNumOne = "";
           				 let createdfromNumTwo = "";
           				 let createdfromNumThree = "";
           			 } else {
           				 let createdfromNumOne = "";									// 伝票番号1
               			 let createdfromNumTwo = "";									// 伝票番号2
               			 let createdfromNumThree = "";									// 伝票番号3
           			 }
           			 
        			 let trandate = result.getValue("trandate"); 						
        			 if (!isEmpty(trandate)) {
        				 let date = new Date(trandate);
        				 let year =  date.getFullYear();
        				 let yearStr = year.toString(); 								// 注文日（年）
        				 let yearFirst = parseInt(yearStr.substring(0, 2));				// 処理日付（年）1
        				 let yearTail = parseInt(yearStr.substring(2, 4)); 				// 処理日付（年）2
        				 let tranMonth = date.getMonth() + 1; 							// 処理日付（月） | 注文日（月）
        				 let tranDate =  date.getDate();								// 処理日付（日） | 注文日（日）
        				 let tranTime = "";												// 処理時間（時間）
        				 let tranMin = "";												// 処理時間（分）
        				 let tranSecond = "";											// 処理時間（秒）
        			 }
        			 let makeUser = result.getValue("createdby"); 						// 処理者社員No | 処理者社員名
        			 let terminalName = "";												// 処理端末名
        			 let vendorCode = result.getValue({name: "entityid", join: "vendor"}); // 仕入先コード
        			 let vendorZip = result.getValue({name: "billzipcode", join: "vendor"}); // 仕入先郵便番号
        			 let vendorAddress1 = result.getValue({name: "billaddress1", join: "vendor"}); 	// 仕入先住所1
        			 let vendorAddress2 = result.getValue({name: "billaddress2", join: "vendor"}); 	// 仕入先住所2
        			 let vendorAddress3 = result.getValue({name: "billaddress3", join: "vendor"}); 	// 仕入先住所3
        			 let vendorName2 = result.getValue({name: "altname", join: "vendor"}); 	// 仕入先名2
        			 if (!isEmpty(vendorName2)) {
        				 let vendorName1 = vendorName2.length;								// 仕入先名1
        			 }
        			 let vendorName3 = "";													// 仕入先名3
        			 let vendorPhone = result.getValue({name: "billphone", join: "vendor"}); 	//仕入先電話番号
        			 let vendorFax = result.getValue({name: "fax", join: "vendor"}); 			//仕入先ＦＡＸ番号
        			 let type = result.getValue("type");
//        			 let itemId = result.getValue({name: "internalid", join: "item"});  // 商品区分
//        			 let itemName = result.getValue({name: "itemid", join: "item"});    // 商品区分名
        			 let entityId = result.getValue({name: "entityid", join: "employee"});    // 担当者コード
        			 let entityDepartment = result.getValue({name: "department", join: "employee"});    // 部門コード
        			 let entityName = result.getValue({name: "altname", join: "employee"});    // 担当者名
        			 let confirDate = result.getValue("custcol_received_confirmation_date");
        			 if (!isEmpty(confirDate)) {
        				 let incomingDate = new Date(confirDate);
        				 let incomingYear = incomingDate.getFullYear();				    // 入荷日（年）
        				 let incomingMonth = incomingDate.getMonth() + 1; 				// 入荷日（月）
        				 let incomingDay = incomingDate.getDate();				        // 入荷日（日）
        			 }
        			 let line1 = result.getValue("line");														// 伝票行番号1
        			 let categoryNumber1 = result.getValue({name: "custitem_category_number", join: "item"});   // 類番1
        			 let productNumber1 = result.getValue({name: "custitem_product_number", join: "item"});     // 品番1
        			 let colorCode1 = result.getValue({name: "name", join: "CUSTCOL_SIZE"});     				// サイズコード1
        			 let productCode = result.getValue("custcol_manufacturer_product_code");	    			// メーカー商品ｺｰﾄ1
        			 let ak1 = "1";																				// AK1
        			 let itemName1 = result.getText("item");													// 商品名1
        			 let colorName1 = result.getValue("custcol_color");											// カラー名1
        			 let sizeName1 = result.getValue("custcol_size");											// サイズ名1
        			 let quantity1 = result.getValue("quantity");												// 数量1
        			 let unit1 = result.getText("unit");													    // 仕入単位1
        			 let rate1 = result.getValue("rate");													    // 仕入単価1
        			 let amount1 = result.getValue("amount");													// 仕入金額1
        			 let dateType = "";																			// データ状況1
        			 let dateTypeName = "";																		// データ状況名1
        		 }
        	}
        	
            
            
//            // CSV名前作成
            let filename = csvFileName + dateYYMMDD() + '.csv';
////            
////            // CSV保存
            let fileId = writeCsvFile(csvStr, filename, csvSaveFolder);
        }

        /**
         * CSV作成
         * @param buffer {String} CSV内容
         * @param filename {String} CSV名前
         * @param folder_id {String} CSV保存フォルダID
         * @returns
         */
        function writeCsvFile(buffer, filename, folder_id){
            let fileObj = file.create({
                name : filename,
                fileType : file.Type.CSV,
                contents : buffer
            });
            fileObj.folder = folder_id;
            fileObj.encoding = file.Encoding.UTF_8;

            fileId = fileObj.save();
            
            return fileId;
        }
        
        /**
         * マスタ / トランザクション取得
         * @param {Object|*} searchType 検索種類
         * @param {Object|*} searchFilters 検索条件
         * @param {Object|*} searchColumns 検索項目
         * @returns {Object} resultList 検索結果配列
         */
        const getSearchData = (searchType, searchFilters, searchColumns) => {
            let resultList = [];
            let resultIndex = 0;
            let resultStep = 1000;
            let results;
            let objSearch = search.create({
                type: searchType,
                filters: searchFilters,
                columns: searchColumns
            });
            let objResultSet = objSearch.run();

            do {
                results = objResultSet.getRange({
                    start: resultIndex,
                    end: resultIndex + resultStep
                });

                if (results.length > 0) {
                    resultList = resultList.concat(results);
                    resultIndex = resultIndex + resultStep;
                }
            } while (results.length > 0);

            return resultList;

        }
        
        /**
         * 日付取得
         * @returns {String} YYYYMMDDHHMMSS
         */
        function dateYYMMDD() {

            let fdate = getSystemDate();
            let year = fdate.getFullYear();
            let month = npad(fdate.getMonth() + 1);
            let day = npad(fdate.getDate());
            let hour = npad(fdate.getHours());
            let minute = npad(fdate.getMinutes());
            let seconds = npad(fdate.getSeconds());

            return '' + year + month + day + hour + minute + seconds;
        }

        /**
         * システム時間
         * @returns システム時間
         */
        function getSystemDate() {

            // システム時間
            let now = new Date();
            let offSet = now.getTimezoneOffset();
            let offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);

            return now;
        }
        
        
        /**
         * 空白チェック
         *
         * @param {Object} obj 文字列
         * @returns {Boolean}
         */
        function isEmpty(obj) {

            if (obj === undefined || obj == null || obj === '') {
                return true;
            }
            if (obj.length && obj.length > 0) {
                return false;
            }
            if (obj.length === 0) {
                return true;
            }
            for ( let key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }
            if (typeof (obj) == 'boolean') {
                return false;
            }
            if (typeof (obj) == 'number') {
                return false;
            }
            return true;

        }
        

        function npad(v) {
            if (v >= 10) {
                return v;
            } else {
                return '0' + v;
            }
        }
        
        return {
            execute: execute
        };
    });
