/**
 * �@�\: WMS_���טA�g_�v���O����
 * Author: CPC_�v
 * Date:2023/10/31
 * 
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['/SuiteScripts/LIBRARY/common_lib.js', 'N/file', 'N/record', 'N/search', 'N/format', "N/runtime", 'N/render' ],
	/**
	 * @param {runtime}
	 *            runtime
	 * @param {search}
	 *            search
	 * @param {format}
	 *            format
	 */
	(common_lib, file, record, search, format, runtime, render) => {
		/**
		 * ���̓f�[�^�𐶐�
		 * 
		 * @returns {array|Object|Search|File}
		 * 
		 * @governance 10,000
		 */
		function getInputData() {
			
			// �Ώۂ�CSV�t�@�C���̑��݃`�F�b�N
			let csvFile = '';
			let mapJson = [];
			
			// WMS��̃o�P�b�g�t�H���_�ɖ��A�g��CSV�t�@�C�������݂��Ȃ������ꍇ�A��̃��X�g��߂�l�ɐݒ肵�ď������I������
			if (common_lib.isEmpty(csvFile)) {
				return [];
			}
			
			// CSV�t�@�C���̃_�E�����[�h
			let csvFile = file.create({
	            name: 'csvName',
	            contents : JSON.stringify(poResults),
	            folder: param_csv_folder,
	            fileType: 'CSV',
	            encoding = file.Encoding.UTF_8
	        });
			
			let csvFileId = csvFile.save();
			
			// �t�@�C�������[�h����
			let csvFile = file.load({
                id : csvFileId,
                encoding : file.Encoding.SHIFT_JIS,
            });
			
			// �t�@�C�����e���擾����
            let csvFileContents = csvFile.getContents();
            
            // CSV�f�[�^��Array�ɕϊ�����
            let csvFileToArray = common_lib.csvToArray(csvFileContents);
            
            // CSV�f�[�^�����݂���ꍇ
            if (csvFileToArray.length > 0) {
            	
            	// �A�C�e���}�X�^�擾
                let infoDic = getItemJsonValue();
                
                // �z�����擾
                let fulDic = getIfNoJsonValue();
            	
                // CSV�f�[�^����
                let csvData = {};
                
            	for (let line = 0; line < csvFileToArray.length; line++) {
            		
            		if (!csvData.hasOwnProperty(csvFileToArray[line].keyNo)) {
            			// keyNo = �z��No
            			csvData[csvFileToArray[line].keyNo] = new Array();
            			csvData[csvFileToArray[line].keyNo].push(csvFileToArray[line]);
            		} else {
            			csvData[ifNo].push(csvFileToArray[line]);
            		}

            	}
            	// �}�X�^�`�F�b�N
            	// �z�����݃`�F�b�N
            	for ( let key in csvData) {
					
            		let itemFlag = false;
            		let ifFlag = false;
            		
            		let ifData = csvData[key];
            		// �ޔ�
            		let type = ifData[0];
            		// �i��
            		let num = ifData[1];
            		// �J���[
            		let color = ifData[2];
            		// �T�C�Y
            		let size = ifData[2];
            		
            		// �A�C�e���}�X�^���݃`�F�b�N  TODO:
            		if (check) {
            			itemFlag = true;
					}
            		// �z�����݃`�F�b�N TODO:
            		if (check) {
            			ifFlag = true;
					}
            		
            		if(itemFlag && ifFlag){
            			mapJson.push({
           					'itemFulNo' : csvData[key]
           				});
            		}
            		
				}
			
            }

            return mapJson;                    
		}

	    /**
	     * Executes when the reduce entry point is triggered and applies to each group.
	     * 
	     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
	     * @since 2015.1
	     */
		function reduce(context) { 
			// �L�[
			let ifNo = context.key;
			
			// �l
			let contextJson = JSON.parse(context.value);
			
			// �z�����C��
			let contItemFul = contextJson['itemFulNo'];
			
			// �z���w�b�_�쐬�@TODO�F
			
			// �z�����׍쐬�@TODO�F
		    
		}
		
		/**
		 * �֐��Ăяo�����Ƃ�1�����̃L�[�Ƃ���ɑΉ�����l������
		 * 
		 * @param {Object}
		 *            context
		 * @param {Date}
		 *            context.dateCreated �X�N���v�g�����s���J�n��������
		 * @param {number}
		 *            context.seconds �X�N���v�g�̏������Ɍo�߂����b��
		 * @param {Object}
		 *            context.inputSummary
		 * @param {Object}
		 *            context.mapSummary
		 * @param {Object}
		 *            context.reduceSummary
		 * @param context.output
		 * @returns {undefined}
		 * 
		 * @governance 10,000
		 */
		function summarize(context) {
			
			const script = runtime.getCurrentScript();
	    	const script_id = script.id;
//	    	const param_email_author = script.getParameter({name: "email_author_bl"});
//	    	const param_email_recipients = script.getParameter({name: "email_recipients"});
	    	
	    	var inputSummary = context.inputSummary;
	        var mapSummary = context.mapSummary;
	        var reduceSummary = context.reduceSummary;
	        
	        if (inputSummary.error) {
	        	//�@�G���[����
	        	common_lib.handleErrorIfAny(context);
	        	
	            var errorObj = error.create({
	                name: 'INPUT_STAGE_FAILED',
	                message: inputSummary.error,
	    		    notifyOff: false
	            });
	            throw errorObj;
	        }
	        
	        var errorName = '';
	        var errorMsg = [];
	        mapSummary.errors.iterator().each(function(key, value){
	            var msg = 'param key: ' + key + '. Error message: ' + JSON.parse(value).message + '\n';
	            errorMsg.push(msg);
	            errorName = 'MAP_TRANSFORM_FAILED'
	            return true;
	        });
	        
	        reduceSummary.errors.iterator().each(function(key, value){
	            var msg = 'param key: ' + key + '. Error message: ' + JSON.parse(value).message + '\n';
	            errorMsg.push(msg);
	            errorName = 'RECORD_TRANSFORM_FAILED'
	            return true;
	        });
	        
	        if (errorMsg.length > 0)
	        {
	        	//�@�G���[����
	        	common_lib.handleErrorIfAny(context);
	            var errorObj = error.create({
	                name: errorName,
	                message: JSON.stringify(errorMsg),
	    		    notifyOff: false
	            });
	            throw errorObj;
	        }
			
			
		}
		
		// �A�C�e���}�X�^�擾
		function getItemJsonValue() {
			let infoDic = {};
			let itemSearch = "item";
            let itemFilters = [];
            let itemSearchObj = [search.createColumn({
	            name : "internalid",
	            label : "����ID"
		    }),search.createColumn({
	            name : "",
	            label : "�ޔ�"
		    }),search.createColumn({
	            name : "",
	            label : "�i��"
		    }),search.createColumn({
	            name : "",
	            label : "�J���["
		    }),search.createColumn({
	            name : "",
	            label : "�T�C�Y"
		    })];
            let itemSearchResults = common_lib.getSearchdata(itemSearch, itemFilters, searchColumns);
            if (itemSearchResults && itemSearchResults.length > 0) {
            	 for (let i = 0; i < itemSearchResults.length; i++) {
            		 let tmpResult = itemSearchResults[i];
            		 let itemId = tmpResult.getValue(searchColumns[0]);
            		 let itemNum = tmpResult.getValue(searchColumns[1]);
            		 let ItemColor = tmpResult.getValue(searchColumns[2]);
            		 let itemTmp = tmpResult.getValue(searchColumns[3]);
            		 
	                 let itemArr = new Array();
	                 itemArr.push([itemNum],[ItemColor],[itemTmp]);
	                 infoDic[itemId] = new Array();
	                 infoDic[itemId].push(itemArr);
            		 
            	 }
            }
            
            return infoDic;
		
		}
		
		// ���������擾
		function getIfNoJsonValue() {
			let fulDic = {};
            let poSearch = "purchaseorder";
            let poFilters = [];
            poFilters.push(["type",'anyof',"purchaseorder"]);
            poFilters.push(["AND"]);
            poFilters.push(["trackingnumber","isnotempty",""]);
            let poSearchObj = [search.createColumn({
	            name : "trackingnumbers",
	            label : "������No"
		    }),search.createColumn({
	            name : "",
	            label : "�������s�ԍ�"
		    })];
            let poSearchResults = createSearch(poSearch, poFilters, searchColumns);
            if (poSearchResults && poSearchResults.length > 0) {
            	let fulDic = {};
            	for (let i = 0; i < poSearchResults.length; i++) {
            		 let fulResult = poSearchResults[i];
            		 let poNo = fulResult.getValue(searchColumns[0]);
            		 let poLine = fulResult.getValue(searchColumns[1]);
            		 
	                 let itemFulArr = new Array();
	                 itemFulArr.push([poLine]);
	                 fulDic[poNo] = new Array();
	                 fulDic[poNo].push(itemFulArr);
            		 
            	}
            }
            return fulDic;
            
		}
            
	    function isValidDateFormat(date) {
	        var regex = /^\d{4}-\d{2}-\d{2}$/;
	        return regex.test(date);
	    }
        
		return {
		    getInputData: getInputData,
		    reduce: reduce,
	        summarize: summarize
		}
	}
);
