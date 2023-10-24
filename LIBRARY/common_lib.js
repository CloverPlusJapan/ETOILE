/**
 * �J���S�̋��ʂ̃��C�u�����֐����L�ڂ���
 * 
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', "N/ui/dialog", "N/format", 'N/error', 'N/email', 'N/runtime', 'N/query', "require", "exports", "N/log", "N/sftp"],
  
  function(search, record, dialog, format, error, email, runtime, query, require, exports, log, sftp) {
	
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
		"use strict";
	    Object.defineProperty(exports, "__esModule", { value: true });
	    exports.execute = void 0;
	    var NS_TEST_FOLDER = 12308; //12303; WMStoERP Copy
	    var execute = function (ctx) {
	        try {
	            var conn_1 = sftp.createConnection({
	                username: 'ftpuser',
	                //passwordGuid: 'custsecret_hunter_test_sftp',
	                passwordGuid: 'custsecret_hunter_sftp',
	                url: '153.120.20.66',
	                port: 22,
	                //directory: '/home/ftpuser/to_ns', ///home/ftpuser/ARCHIVE
	                directory: '/home/ftpuser/WMStoERP', // 
	                hostKey: 'AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBJgP0r0WZ7YtiS6npu+5DYgalatLx6tWmcKcDMC1NENddyYCCRY+kEKnA9o4t6RMguj2ztLxjc/LfDDOmYTwFhw=',
	            });
	            var rtn_1 = conn_1.list({ path: '/', sort: sftp.Sort.DATE_DESC });
	            Object.keys(rtn_1).map(function (idx) {
	                var _a = rtn_1[idx], directory = _a.directory, name = _a.name, size = _a.size, lastModified = _a.lastModified;
	                if (!directory) {
	                    var f = conn_1.download({ filename: "".concat(name) });
	                    log.debug('file', f);
	                    f.folder = NS_TEST_FOLDER;
	                    f.save();
	                }
	            });
	        }
	        catch (e) {
	            log.error('CPC:MISCS:SFTP:SKD', { e: e });
	        }
	    };
	    exports.execute = execute;
	}
	
	/**
	 * SFTP�t�@�C�����M
	 */
	function execute() {
		"use strict";
	    Object.defineProperty(exports, "__esModule", { value: true });
	    exports.execute = void 0;
	    var NS_TEST_FOLDER = 2400633;
	    var NS_TEST_DONE_FOLDER = 18082457;
	    var SFTP_HOST = '59.106.211.127';
	    var SFTP_USER_NAME = 'ftpuser';
	    var SFTP_PASS_WORD = 'aGWb6oVb';
	    var SFTP_PASS_WORD_GUID = 'custsecret_microport_test_sftp';
	    var SFTP_TARGET_FOLDER = '/home/ftpuser/SEND/SFTP_TEST';
	    var SFTP_HOST_KEY = 'AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBLxt8e251AohnU9ARtt7RWsmNCMG4N/LHphh1nlpu62HjlhLgy04RpztGf27Yg1xMN9oJY1woVrPDFOtq468oY0=';
	    var execute = function (ctx) {
	        var file_id_list = [];
	        search
	            .create({
	            type: 'file',
	            filters: [{ name: 'folder', operator: search.Operator.ANYOF, values: NS_TEST_FOLDER }],
	        })
	            .run()
	            .each(function (rec) {
	            file_id_list.push(rec.id);
	            return true;
	        });
	        try {
	            var conn_1 = sftp.createConnection({
	                username: SFTP_USER_NAME,
	                passwordGuid: SFTP_PASS_WORD_GUID,
	                url: SFTP_HOST,
	                port: 22,
	                directory: SFTP_TARGET_FOLDER,
	                hostKey: SFTP_HOST_KEY,
	            });
	            file_id_list.map(function (fid) {
	                var f = file.load({ id: fid });
	                var contents = f.getContents();
	                var rtn = conn_1.upload({ file: f });
	                f.folder = NS_TEST_DONE_FOLDER;
	                f.save();
	            });
	            // const rtn = conn.list({ path: '/', sort: sftp.Sort.DATE_DESC })
	            // Object.keys(rtn).map((idx) => {
	            //   const { directory, name, size, lastModified } = rtn[idx]
	            //   if (!directory) {
	            //     const f = conn.download({ filename: `${name}` })
	            //     log.debug('file', f)
	            //     f.folder = NS_TEST_FOLDER
	            //     f.save()
	            //   }
	            // })
	        }
	        catch (e) {
	            log.error('CPC:MISCS:SFTP:SKD', { e: e });
	        }
	    };
	    exports.execute = execute;
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
	function proError(e, sendEmailFlag) {
		log.error(' �G���[�@���b�Z�[�W�@�F', e.message);
		
		if(sendEmailFlag){
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
	function dataExists(searchType, searchFilters) {
		
		let resultList = [];
        let resultIndex = 0;
        let resultStep = 1000;

        let objSearch = search.create({
            type : searchType,
            filters : searchFilters,
            columns: [
                      search.createColumn({name: "internalid"})
                     ]
        });
        
        let searchResultCount = objSearch.runPaged().count;
        
        searchResultCount == 0 ? return false : return true;
	
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