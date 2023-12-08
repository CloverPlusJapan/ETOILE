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
        	    
            // CSV���O
            let csvFileName = script.getParameter({name: "custscript_neoss_csv_name"});
                      
            // CSV�ۑ��t�H���_ID
            let csvSaveFolder = script.getParameter({name: "custscript_neoss_csv_folde"});
            
            // CSV
            let csvStr = '';
            const one = '\u2460' 	
            const two = '\u2461' 	
            const three = '\u2462'   
            const four = '\u2463'   
            const five = '\u2464'   
            //�w�b�_��
            csvStr += ['�`�[�h�c'] + ',' + ['�`�[�h�c��'] + ',' + ['�`�[�ԍ�' + one] + ',' + ['�`�[�ԍ�' + two] + ',' + ['�`�[��ANO'] + ',' + ['�������t�i�N�j' + one] + ',' + ['�������t�i�N�j' + two] + ',' + ['�������t�i���j'] + ',' + ['�������t�i���j'] + ',' + ['�������ԁi���ԁj'] + ',' + ['�������ԁi���j'] 
            	   + ',' + ['�������ԁi�b�j'] + ',' + ['�����ҎЈ�NO'] + ',' + ['�����ҎЈ���'] + ',' + ['�����[����'] + ',' + ['�d����R�[�h'] + ',' + ['�d����X�֔ԍ�'] + ',' + ['�d����Z��' + one] + ',' + ['�d����Z��' + two] + ',' + ['�d����Z��' + three] + ',' + ['�d���於' + one] 
                   + ',' + ['�d���於' + two] + ',' + ['�d���於' + three] + ',' + ['�d����d�b�ԍ�'] + ',' + ['�d����e�`�w�ԍ�'] + ',' + ['�������i�N�j'] + ',' + ['�������i���j'] + ',' + ['�������i���j'] + ',' + ['���i�[���i�N�j'] + ',' + ['���i�[���i���j'] + ',' + ['���i�[���i���j'] + ',' + ['���i�敪'] 
                   + ',' + ['���i�敪��'] + ',' + ['�[����敪'] + ',' + ['�[���於'] + ',' + ['�z�i���۱����'] + ',' + ['�z�i���ޯ������'] + ',' + ['�z�i�於'] + ',' + ['�S���҃R�[�h'] + ',' + ['����R�[�h'] + ',' + ['�S���Җ�'] + ',' + ['���ד��i�N�j'] + ',' + ['���ד��i���j'] + ',' + ['���ד��i���j'] 
                   + ',' + ['�`�[�s�ԍ�' + one] + ',' + ['�ޔ�' + one] + ',' + ['�i��' + one] + ',' + ['�J���[�R�[�h' + one] + ',' + ['�T�C�Y�R�[�h' + one] + ',' + ['���[�J�[���i����' + one] + ',' + ['�`�j' + one] + ',' + ['���i��' + one] + ',' + ['�J���[��' + one] + ',' + ['�T�C�Y��' + one] + ',' + ['����' + one] 
                   + ',' + ['�d���P��' + one] + ',' + ['�d���P��' + one] + ',' + ['�d�����z' + one] + ',' + ['�f�[�^��' + one] + ',' + ['�f�[�^�󋵖�' + one] + ',' + ['�`�[�s�ԍ�' + two] + ',' + ['�ޔ�' + two] + ',' + ['�i��' + two] + ',' + ['�J���[�R�[�h' + two] + ',' + ['�T�C�Y�R�[�h' + two] 
                   + ',' + ['Ұ�����i����' + two] + ',' + ['�`�j' + two] + ',' + ['���i��' + two] + ',' + ['�J���[��' + two] + ',' + ['�T�C�Y��' + two] + ',' + ['����' + two] + ',' + ['�d���P��' + two] + ',' + ['�d���P��' + two] + ',' + ['�d�����z' + two] + ',' + ['�f�[�^��' + two]
            	   + ',' + ['�f�[�^�󋵖�' + two] + ',' + ['�`�[�s�ԍ�' + three] + ',' + ['�ޔ�' + three] + ',' + ['�i��' + three] + ',' + ['�J���[�R�[�h' + three] + ',' + ['�T�C�Y�R�[�h' + three] + ',' + ['Ұ�����i����' + three] + ',' + ['�`�j' + three] + ',' + ['���i��' + three] + ',' + ['�J���[��' + three] 
                   + ',' + ['�T�C�Y��' + three] + ',' + ['����' + three] + ',' + ['�d���P��' + three] + ',' + ['�d���P��' + three] + ',' + ['�d�����z' + three] + ',' + ['�f�[�^��' + three] + ',' + ['�f�[�^�󋵖�' + three] + ',' + ['�`�[�s�ԍ�' + four] + ',' + ['�ޔ�' + four] + ',' + ['�i��' + four] 
            	   + ',' + ['�J���[�R�[�h' + four] + ',' + ['�T�C�Y�R�[�h' + four] + ',' + ['Ұ�����i����' + four] + ',' + ['�`�j' + four] + ',' + ['���i��' + four] + ',' + ['�J���[��' + four] + ',' + ['�T�C�Y��' + four] + ',' + ['����' + four] + ',' + ['�d���P��' + four] + ',' + ['�d���P��' + four] 
                   + ',' + ['�d�����z' + four] + ',' + ['�f�[�^��' + four] + ',' + ['�f�[�^�󋵖�' + four] + ',' + ['�`�[�s�ԍ�' + five] + ',' + ['�ޔ�' + five] + ',' + ['�i��' + five] + ',' + ['�J���[�R�[�h' + five] + ',' + ['�T�C�Y�R�[�h' + five] + ',' + ['Ұ�����i���' + five] + ',' + ['�`�j' + five] 
            	   + ',' + ['���i��' + five] + ',' + ['�J���[��' + five] + ',' + ['�T�C�Y��' + five] + ',' + ['����' + five] + ',' + ['�d���P��' + five] + ',' + ['�d���P��' + five] + ',' + ['�d�����z' + five] + ',' + ['�f�[�^��' + five] + ',' + ['�f�[�^�󋵖�' + five] 
            	   + ',' + ['�d�����v���z'] + ',' + ['�א�'] + ',' + ['�E�v' + one] + ',' + ['�E�v' + two] + ',' + ['�E�v' + three] + ',' + ['�Ј�NO'] + ',' + ['�Ј���'] + ',' + ['�\��'] + ',' + ['�ŗ��\�L'] + ',' + ['�E�v' + four] + ',' + ['�d���掖�ƎҔԍ�'] + ',' + ['����Ŋz'] + ',' + ['�ō����z'] 
            	   + '\r\n';

            
                        
            
            // �ۑ�����
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
				    search.createColumn({name: "createdfrom", label: "�쐬��"}),
				    search.createColumn({name: "trandate", label: "���t"}),
				    search.createColumn({name: "createdby", label: "�쐬��"}),
				    search.createColumn({name: "entityid", join: "vendor", label: "�d����R�[�h"}),
				    search.createColumn({name: "billzipcode", join: "vendor", label: "�d����X�֔ԍ�"}),
				    search.createColumn({name: "billaddress1", join: "vendor", label: "�d����Z��1"}),
				    search.createColumn({name: "billaddress2", join: "vendor", label: "�d����Z��2"}),
				    search.createColumn({name: "billaddress3", join: "vendor", label: "�d����Z��3"}),
				    search.createColumn({name: "altname", join: "vendor", label: "�d���� : ���O"}),
				    search.createColumn({name: "billphone", join: "vendor", label: "�d���� : ������d�b�ԍ�"}),
				    search.createColumn({name: "fax", join: "vendor", label: "�d����e�`�w�ԍ�"}),
				    search.createColumn({name: "type", label: "���"}),
				    search.createColumn({name: "expectedreceiptdate", label: "��̗\���"}),
				    search.createColumn({name: "internalid", join: "item", label: "���i�敪"}),
				    search.createColumn({name: "itemid", join: "item", label: "���i�敪��"}),
				    search.createColumn({name: "entityid", join: "employee", label: "�S���҃R�[�h"}),
				    search.createColumn({name: "department", join: "employee", label: "����R�[�h"}),
				    search.createColumn({name: "altname", join: "employee", label: "�S���Җ�"}),
				    search.createColumn({name: "custcol_received_confirmation_date", label: "���׊m���"}),
				    search.createColumn({name: "line", label: "�`�[�s�ԍ�1"}),
				    search.createColumn({name: "custitem_category_number", join: "item", label: "�ޔ�1"}),
				    search.createColumn({name: "custitem_product_number", join: "item", label: "�i��1"}),
				    search.createColumn({name: "name", join: "CUSTCOL_SIZE", label: "�T�C�Y�R�[�h1"}),
				    search.createColumn({name: "custcol_manufacturer_product_code", label: "���[�J�[���i����1"}),
			        search.createColumn({name: "item", label: "���i��"}),
			        search.createColumn({name: "custcol_color", label: "�J���[��"}),
			        search.createColumn({name: "custcol_size", label: "�T�C�Y��"}),
			        search.createColumn({name: "quantity", label: "����"}),
			        search.createColumn({name: "unit", label: "�d���P��"}),
			        search.createColumn({name: "rate", label: "�d���P��"}),
			        search.createColumn({name: "amount", label: "�d�����z"}),
				];
            
        	let transactionSearchObj = getSearchData(searchType, searchFilters, searchColumns);
        	if (transactionSearchObj && transactionSearchObj.length > 0) {
        		 for (let searchResult = 0; searchResult < transactionSearchObj.length; searchResult++) {
           			 let result = transactionSearchObj[searchResult];
           			 if (type == 'VendBill') { 											// �x���������̏ꍇ
               			 let slipId = "09";												// �`�[�h�c
               			 let slipName = "�d��";											// �`�[�h�c��
        				 let expectedreceiptdate = result.getValue("expectedreceiptdate");	    
        				 if (!isEmpty(expectedreceiptdate)) {
        					 let deliveryDate = new Date(expectedreceiptdate);
        					 let deliveryYear = deliveryDate.getFullYear();				// ���i�[���i�N�j
        					 let deliveryMonth = deliveryDate.getMonth() + 1; 			// ���i�[���i���j
        					 let deliveryDay = deliveryDate.getDate();					// ���i�[���i���j
        				 }
           			 } else {															// �O����/���|�������̏ꍇ
               			 let slipId = "26";												// �`�[�h�c
               			 let slipName = "�ԕi";											// �`�[�h�c��
        				 let deliveryYear = "";											// ���i�[���i�N�j
        				 let deliveryMonth = "";										// ���i�[���i���j
        				 let deliveryDay = "";											// ���i�[���i���j
           			 }
           			 let createdfrom = result.getValue("createdfrom"); 					// �쐬��
           			 if (!isEmpty(createdfrom)) {
           				 let createdfromNumOne = "";
           				 let createdfromNumTwo = "";
           				 let createdfromNumThree = "";
           			 } else {
           				 let createdfromNumOne = "";									// �`�[�ԍ�1
               			 let createdfromNumTwo = "";									// �`�[�ԍ�2
               			 let createdfromNumThree = "";									// �`�[�ԍ�3
           			 }
           			 
        			 let trandate = result.getValue("trandate"); 						
        			 if (!isEmpty(trandate)) {
        				 let date = new Date(trandate);
        				 let year =  date.getFullYear();
        				 let yearStr = year.toString(); 								// �������i�N�j
        				 let yearFirst = parseInt(yearStr.substring(0, 2));				// �������t�i�N�j1
        				 let yearTail = parseInt(yearStr.substring(2, 4)); 				// �������t�i�N�j2
        				 let tranMonth = date.getMonth() + 1; 							// �������t�i���j | �������i���j
        				 let tranDate =  date.getDate();								// �������t�i���j | �������i���j
        				 let tranTime = "";												// �������ԁi���ԁj
        				 let tranMin = "";												// �������ԁi���j
        				 let tranSecond = "";											// �������ԁi�b�j
        			 }
        			 let makeUser = result.getValue("createdby"); 						// �����ҎЈ�No | �����ҎЈ���
        			 let terminalName = "";												// �����[����
        			 let vendorCode = result.getValue({name: "entityid", join: "vendor"}); // �d����R�[�h
        			 let vendorZip = result.getValue({name: "billzipcode", join: "vendor"}); // �d����X�֔ԍ�
        			 let vendorAddress1 = result.getValue({name: "billaddress1", join: "vendor"}); 	// �d����Z��1
        			 let vendorAddress2 = result.getValue({name: "billaddress2", join: "vendor"}); 	// �d����Z��2
        			 let vendorAddress3 = result.getValue({name: "billaddress3", join: "vendor"}); 	// �d����Z��3
        			 let vendorName2 = result.getValue({name: "altname", join: "vendor"}); 	// �d���於2
        			 if (!isEmpty(vendorName2)) {
        				 let vendorName1 = vendorName2.length;								// �d���於1
        			 }
        			 let vendorName3 = "";													// �d���於3
        			 let vendorPhone = result.getValue({name: "billphone", join: "vendor"}); 	//�d����d�b�ԍ�
        			 let vendorFax = result.getValue({name: "fax", join: "vendor"}); 			//�d����e�`�w�ԍ�
        			 let type = result.getValue("type");
//        			 let itemId = result.getValue({name: "internalid", join: "item"});  // ���i�敪
//        			 let itemName = result.getValue({name: "itemid", join: "item"});    // ���i�敪��
        			 let entityId = result.getValue({name: "entityid", join: "employee"});    // �S���҃R�[�h
        			 let entityDepartment = result.getValue({name: "department", join: "employee"});    // ����R�[�h
        			 let entityName = result.getValue({name: "altname", join: "employee"});    // �S���Җ�
        			 let confirDate = result.getValue("custcol_received_confirmation_date");
        			 if (!isEmpty(confirDate)) {
        				 let incomingDate = new Date(confirDate);
        				 let incomingYear = incomingDate.getFullYear();				    // ���ד��i�N�j
        				 let incomingMonth = incomingDate.getMonth() + 1; 				// ���ד��i���j
        				 let incomingDay = incomingDate.getDate();				        // ���ד��i���j
        			 }
        			 let line1 = result.getValue("line");														// �`�[�s�ԍ�1
        			 let categoryNumber1 = result.getValue({name: "custitem_category_number", join: "item"});   // �ޔ�1
        			 let productNumber1 = result.getValue({name: "custitem_product_number", join: "item"});     // �i��1
        			 let colorCode1 = result.getValue({name: "name", join: "CUSTCOL_SIZE"});     				// �T�C�Y�R�[�h1
        			 let productCode = result.getValue("custcol_manufacturer_product_code");	    			// ���[�J�[���i���1
        			 let ak1 = "1";																				// AK1
        			 let itemName1 = result.getText("item");													// ���i��1
        			 let colorName1 = result.getValue("custcol_color");											// �J���[��1
        			 let sizeName1 = result.getValue("custcol_size");											// �T�C�Y��1
        			 let quantity1 = result.getValue("quantity");												// ����1
        			 let unit1 = result.getText("unit");													    // �d���P��1
        			 let rate1 = result.getValue("rate");													    // �d���P��1
        			 let amount1 = result.getValue("amount");													// �d�����z1
        			 let dateType = "";																			// �f�[�^��1
        			 let dateTypeName = "";																		// �f�[�^�󋵖�1
        		 }
        	}
        	
            
            
//            // CSV���O�쐬
            let filename = csvFileName + dateYYMMDD() + '.csv';
////            
////            // CSV�ۑ�
            let fileId = writeCsvFile(csvStr, filename, csvSaveFolder);
        }

        /**
         * CSV�쐬
         * @param buffer {String} CSV���e
         * @param filename {String} CSV���O
         * @param folder_id {String} CSV�ۑ��t�H���_ID
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
         * �}�X�^ / �g�����U�N�V�����擾
         * @param {Object|*} searchType �������
         * @param {Object|*} searchFilters ��������
         * @param {Object|*} searchColumns ��������
         * @returns {Object} resultList �������ʔz��
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
         * ���t�擾
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
         * �V�X�e������
         * @returns �V�X�e������
         */
        function getSystemDate() {

            // �V�X�e������
            let now = new Date();
            let offSet = now.getTimezoneOffset();
            let offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);

            return now;
        }
        
        
        /**
         * �󔒃`�F�b�N
         *
         * @param {Object} obj ������
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
