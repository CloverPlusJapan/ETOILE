/**
 * �J���S�̋��ʂ̃��C�u�����֐����L�ڂ���
 * 
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', "N/ui/dialog", "N/format", 'N/error', 'N/email', 'N/runtime', 'N/query'],
  
  function(search, record, dialog, format, error, email, runtime, query) {
	
	/**
	 * �}�X�^ / �g�����U�N�V�����擾
	 * 
     * @param {Object} searchType �������
     * @param {Object} searchFilters ��������
     * @param {Object} searchColumns ��������
	 * @returns {Object} resultList �������ʔz��
	 */
	function getSearchdata(searchType, searchFilters, searchColumns) {
		
		let resultList = [];
        let resultIndex = 0;
        let resultStep = 1000;

        let objSearch = search.create({
            type : searchType,
            filters : searchFilters,
            columns : searchColumns
        });
        let objResultSet = objSearch.run();

        do {
            var results = objResultSet.getRange({
                start : resultIndex,
                end : resultIndex + resultStep
            });

            if (results.length > 0) {
                resultList = resultList.concat(results);
                resultIndex = resultIndex + resultStep;
            }
        } while (results.length > 0);

        return resultList;
        
	}
	
	/**
	 * ����`�F�b�N
	 * 
     * @param {String} date ���
     * @param {String} fh �t�H�[�}�b�g
	 * @returns {Boolean}
	 */
	function isDateFormat(date, fh) {
		
		if (!date) {
            return false;
        }
		
        let dateItems = date.split(fh);
        if (dateItems.length !== 3) {
            return false;
        }
        let pattern = new RegExp("[0-9]+");
        if (!pattern.test(dateItems[0]) || !pattern.test(dateItems[1]) || !pattern.test(dateItems[2])) {
            return false;
        }

        if (dateItems[0].length !== 4 || parseInt(dateItems[1]) > 12 || parseInt(dateItems[1]) <= 0 || parseInt(dateItems[2]) > 31
                || parseInt(dateItems[2]) <= 0) {
            return false;
        }

        return true;
        
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
	    for ( var key in obj) {
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
	
	/**
	 * SFTP�t�@�C����M
	 */
	function execute() {
		
	}
	
	/**
	 * SFTP�t�@�C�����M
	 */
	function execute() {
		
	}

	/**
	 * �t�@�C���폜
	 * 
	 * @param {String} fieldId �t�@�C��
	 * @param {String} path �t�@�C���p�X�͎w��
	 * @returns {Boolean}
	 */
	function delFile(fieldId, path) {
		
		try {
			
			if (fieldId) {
				record['delete']({
					type : record.Type.FOLDER,
					id : fieldId,
				});
				return true;
			}
			
		} catch (e) {
			
			log.debug(' DELETE ERROR : ', e.message);
			return false;
		}
	}
	
	/**
	 * ���[�����M
	 * 
	 * @param {Object} e ERROR���e
	 */
	function sendMail(e) {
		
		let script = runtime.getCurrentScript();
		let script_id = script.id;
        let paramEmailAuthor = script.getParameter({name: "custscript_sw_pay_author"});
		let paramErrRecipients = script.getParameter({name: "custscript_sw_pay_recipients"});
		let subjectContents = 'subject_contents';
        let bodyContents = 'An error occurred with the following information:\n' +
                   'Error code: ' + e.name + '\n' +
                   'Error msg: ' + e.message;

        email.send({
            author: paramEmailAuthor,
            recipients: paramErrRecipients,
            subject: subjectContents,
            body: bodyContents
        });
		
	}
	
	/**
	 * �G���[����
	 * 
	 * 
	 */
	function proError() {
		
	}
	
	/**
	 * �������擾
	 * 
	 * @param date
	 * @param {Date} date ���t
	 * @returns {String} ������
	 */
	function getEndOfMonth(date) {
		
		if (typeof (date) == 'string') return date;
        let year = date.getFullYear() + "";
        let month = (date.getMonth() + 1);
		let day = new Date(new Date(year,month).setDate(0)).getDate();
		return day;
		
	}
	
	/**
	 * �}�X�^ / �g�����U�N�V���� �f�[�^���݃`�F�b�N
	 * 
	 * @returns {Boolean}
	 */
	function dataExists() {
		
	}
	
	/**
	 * ���l�`�F�b�N
	 * 
	 * @param {String} data ������
	 * @returns {Boolean}
	 */
	function isNumber(data) {
		
		// ���l�`�F�b�N
		if (!isNaN(parseFloat(value)) && isFinite(value)) {
			return true;
		} else {
			return false;
		}	
	
	}
	
	/**
	 * �f�[�^�`���ϊ� (���t)
	 * 
	 * @param {String} str �ϊ��O������
	 * @returns {Date} �ϊ��t�H�[�}�b�g(���t)
	 */
	function strConvert(str) {
		
        if (typeof (str) == 'string') return str;
        let YYYY = str.getFullYear() + "";
        let MM = (str.getMonth() + 1)
        MM = MM < 10 ? "0" + MM : MM;
        let DS = date.getDate()
        DS = DS < 10 ? "0" + DS : DS;
        return YYYY +"/"+ MM +"/"+ DS
	
	}
	
	/**
	 * �����擾
	 * 
	 * @returns {Date} ����
	 */
	function getDuedate() {
		
		let now = new Date();
		let offSet = now.getTimezoneOffset();
		let offsetHours = 9 + (offSet / 60);
		now.setHours(now.getHours() + offsetHours);
		return now;
	
	}
	
	/**
	 * ����擾
	 * 
	 * @returns {String} �����̓���
	 */
	function getAfterDate() {
		
		let today = new Date();
		let tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		return tomorrow;
	
	}
	
	/**
	 * �N��擾
	 * 
	 * @returns {String} �N��擾
	 */
	function getAfterYear() {
		
		let dateTime = new Date().getFullYear();
		dateTime = new Date(new Date().setFullYear(dateTime + 1)).getFullYear();
		
		return dateTime;
		
	}
	
    return {
    	getSearchdata : getSearchdata,
    	isDateFormat : isDateFormat,
    	isEmpty : isEmpty,
    	execute : execute,
    	execute : execute,
    	delFile : delFile,
    	sendMail : sendMail,
    	proError : proError,
    	getEndOfMonth : getEndOfMonth,
    	dataExists : dataExists,
    	isNumber : isNumber,
    	strConvert : strConvert,
    	getDuedate : getDuedate,
    	getAfterDate : getAfterDate,
    	getAfterYear : getAfterYear,
    };
});