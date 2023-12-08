/**
 * �v�Z���쐬
 *  Author: �v����
 *  Date : 2023/11/27
 *
 * �v�Z���쐬
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/record', 'N/task'],

function(search,record,task) {

    /**
     * Function definition to be triggered before record is loaded.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

        try {
            let newRecord = scriptContext.newRecord;
            let inactive = newRecord.getValue({fieldId : 'isinactive'});//����
		  if(inactive == true) return;
			//�v�Z���쐬�����擾
			let startdate = newRecord.getValue({fieldId: 'custrecord_737_start_date'});	//�J�n��
			let statementdate = newRecord.getValue({fieldId: 'custrecord_737_statement_date'});	//�v�Z�����t
			let search = newRecord.getValue({fieldId: 'custrecord_737_customer_search'});	//�Ώیڋq�ۑ�����
			let folder = newRecord.getValue({fieldId: 'custrecord_737_folder'});	//�t�H���_����ID
			let consolidated = newRecord.getValue({fieldId: 'custrecord_737_consolidated'});	//�A���v�Z��
			// Map/Reduce�X�N���v�g�Ăяo��
			let mrTask = task.create({
				taskType : task.TaskType.MAP_REDUCE,   
				scriptId : 'customscript_prt_render_statement', //MR Render Statement
				deploymentId : 'customdeploy_prt_render_statement',
				params : {
					custscript_start_date : startdate,  //�J�n��	
					custscript_statement_date : statementdate,  //�v�Z�����t	
					custscript_statement_search : search,  //�Ώیڋq�ۑ�����	
					custscript_statement_folder : folder,  //�t�H���_����ID	
					custscript_consolidated_statement : consolidated,  //�A���v�Z��	
				}
			});
			mrTask.submit();
        } catch (e) {
            log.error(e.name, e.message);
            log.error(e.name, e.stack);
        }
    }
    return {
        afterSubmit : afterSubmit
    };

});
