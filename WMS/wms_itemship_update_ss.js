/**
 * �@�\: WMS_�o�ɘA�g_�\��
 * Author: CPC_�v
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

            // �p�����[�^�擾
            let script = runtime.getCurrentScript();

            // CSV�ۑ��t�H���_ID
            let folderId = script.getParameter({name: "custscript_itemship_update_folder_id"});

            // ��M��
            let recipients = script.getParameter({name: "custscript_itemship_update_recipients"});

            // ���M��
            let author = script.getParameter({name: "custscript_itemship_update_author"});

            // SFTP�A�g���
            let connectInfoId = script.getParameter({name: "custscript_itemship_update_connectinfoid"});

            let mailJson = {
                author: author,
                recipients: recipients,
                body: [],
            }

            try {
                // �O���A�g�����擾
                // let csvFileId = common_server_lib.executeTrusted(connectInfoId);
//                let csvFileId = 9747; // �e�X�g
                // CSV�t�@�C�������݂���ꍇ
                if (csvFileId) {

                    // CSV�쐬����ID ����n
                    let saveFileId = common_server_lib.writeCsvFile('', 'CSV�t�@�C����_yyyyMMddhhmm.csv', folderId);

                    // CSV�쐬����ID �ُ�n
                    let errorFileId = common_server_lib.writeCsvFile('', '�ُ�_CSV�t�@�C����_yyyyMMddhhmm.csv', folderId);

                    try {

                        // MapReduce�������Ăяo��
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

                        // �G���[�쐬
                        let err_msg = e.message;

                        if (e.name == 'MAP_REDUCE_ALREADY_RUNNING') {
                            mailJson.body.push('�o�ɘA�g����');
                            log.debug('WMS_�o�ɘA�g_�v���O���� - �G���[ :', '�o�ɘA�g���������s���̂��߁A���΂炭���Ă���A�ēx���s���Ă��������B');
                            common_lib.sendMail(mailJson, 'MAP_REDUCE_ALREADY_RUNNING');
                        } else {
                            err_msg = '�o�ɘA�g�Ɏ��s���܂����A�V�X�e���Ǘ��҂ɘA�����Ă��������B' + err_msg;
                            mailJson.body.push('�o�ɘA�g�Ɏ��s���܂����A');
                            mailJson.body.push(err_msg);

                            log.debug('WMS_�o�ɘA�g_�v���O���� - �G���[ :', err_msg);
                            common_lib.sendMail(mailJson, 'MAP_REDUCE_TASK_ERROR');
                        }
                    }
                }
            } catch (e) {
                mailJson.body.push(e.message);
                log.debug('WMS_�o�ɘA�g_�v���O���� - �G���[ :', e.message);
                common_lib.sendMail(mailJson, 'SFTPTRUSTED');
            }
        }

        return {execute}

    });