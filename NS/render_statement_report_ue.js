/**
 * 計算書作成
 *  Author: 宋金来
 *  Date : 2023/11/27
 *
 * 計算書作成
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
            let inactive = newRecord.getValue({fieldId : 'isinactive'});//無効
		  if(inactive == true) return;
			//計算書作成情報を取得
			let startdate = newRecord.getValue({fieldId: 'custrecord_737_start_date'});	//開始日
			let statementdate = newRecord.getValue({fieldId: 'custrecord_737_statement_date'});	//計算書日付
			let search = newRecord.getValue({fieldId: 'custrecord_737_customer_search'});	//対象顧客保存検索
			let folder = newRecord.getValue({fieldId: 'custrecord_737_folder'});	//フォルダ内部ID
			let consolidated = newRecord.getValue({fieldId: 'custrecord_737_consolidated'});	//連結計算書
			// Map/Reduceスクリプト呼び出し
			let mrTask = task.create({
				taskType : task.TaskType.MAP_REDUCE,   
				scriptId : 'customscript_prt_render_statement', //MR Render Statement
				deploymentId : 'customdeploy_prt_render_statement',
				params : {
					custscript_start_date : startdate,  //開始日	
					custscript_statement_date : statementdate,  //計算書日付	
					custscript_statement_search : search,  //対象顧客保存検索	
					custscript_statement_folder : folder,  //フォルダ内部ID	
					custscript_consolidated_statement : consolidated,  //連結計算書	
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
