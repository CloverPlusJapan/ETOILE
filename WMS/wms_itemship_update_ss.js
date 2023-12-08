/**
 * 機能: WMS_出庫連携_予定
 * Author: CPC_宋
 * Date:2023/11/14
 *
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['/SuiteScripts/LIBRARY/common_server_lib.js', '/SuiteScripts/LIBRARY/common_lib.js', "N/runtime", 'N/search', 'N/record', 'N/file', 'N/task', 'N/error', 'N/format'],
    /**
     * @param{action} action
     * @param{auth} auth
     * @param{certificateControl} certificateControl
     * @param{commerce} commerce
     * @param{config} config
     */
    (common_server_lib, common_lib, runtime, search, record, file, task, error, format) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {

            // パラメータ取得
            let script = runtime.getCurrentScript();

            // CSV保存フォルダID
            let folderId = script.getParameter({name: "custscript_itemship_update_folder_id"});

            // 受信者
            let recipients = script.getParameter({name: "custscript_itemship_update_recipients"});

            // 送信者
            let author = script.getParameter({name: "custscript_itemship_update_author"});

            // SFTP連携情報
            let connectInfoId = script.getParameter({name: "custscript_itemship_update_connectinfoid"});

            let mailJson = {
                author: author,
                recipients: recipients,
                body: [],
            }

            try {
                // 外部連携文書取得
                // let csvFileId = common_server_lib.executeTrusted(connectInfoId);
//                let csvFileId = 9747; // テスト
                // CSVファイルが存在する場合
                if (csvFileId) {

                    // CSV作成内部ID 正常系
                    let saveFileId = common_server_lib.writeCsvFile('', 'CSVファイル名_yyyyMMddhhmm.csv', folderId);

                    // CSV作成内部ID 異常系
                    let errorFileId = common_server_lib.writeCsvFile('', '異常_CSVファイル名_yyyyMMddhhmm.csv', folderId);

                    try {

                        // MapReduce処理を呼び出す
                        let mrScript = task.create({
                            taskType: task.TaskType.MAP_REDUCE
                        });

                        mrScript.scriptId = 'customscript_wms_itemship_update_mr';
                        mrScript.deploymentId = 'customdeploy_wms_itemship_update_mr';
                        mrScript.params = {
                            'custscript_itemship_update_csv_fileid': csvFileId,
                            'custscript_itemship_update_save_fileid': saveFileId,
                            'custscript_itemship_update_error_fileid': errorFileId,
                            'custscript_itemship_mail_recipients': recipients,
                            'custscript_itemship_mail_author': author
                        };

                        let taskId = mrScript.submit();

                    } catch (e) {

                        // エラー作成
                        let err_msg = e.message;

                        if (e.name == 'MAP_REDUCE_ALREADY_RUNNING') {
                            mailJson.body.push('出庫連携処理');
                            log.debug('WMS_出庫連携_プログラム - エラー :', '出庫連携処理が実行中のため、しばらくしてから、再度実行してください。');
                            common_lib.sendMail(mailJson, 'MAP_REDUCE_ALREADY_RUNNING');
                        } else {
                            err_msg = '出庫連携に失敗しました、システム管理者に連絡してください。' + err_msg;
                            mailJson.body.push('出庫連携に失敗しました、');
                            mailJson.body.push(err_msg);

                            log.debug('WMS_出庫連携_プログラム - エラー :', err_msg);
                            common_lib.sendMail(mailJson, 'MAP_REDUCE_TASK_ERROR');
                        }
                    }
                }
            } catch (e) {
                mailJson.body.push(e.message);
                log.debug('WMS_出庫連携_プログラム - エラー :', e.message);
                common_lib.sendMail(mailJson, 'SFTPTRUSTED');
            }
        }

        return {execute}

    });