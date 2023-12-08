/**
 * ETONET_�\��E�o�וۗ��A�g
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @Version 1.0
 * @CreatedBy Mariya Sawada
 * @CreatedDate 2023/11/22
 */

define([
    "../LIBRARY/constant_lib.js",
    "../LIBRARY/common_lib.js",
    'N/email'
], function (
    constLib,
    common,
    email
) {
    /** �t�B�[���hID */
    const FIELD_ID = {
        /** �o�b�N�E�I�[�_�[ */
        BACKORDERED: 'backordered',
        /** �`�[��� */
        TRAN_TYPE: 'custbody_etonet_tran_type',
        /** ETONET�ԍ� */
        ETONET_NUMBER: 'custbody_etonet_so_number',
    }

    // TODO:���ʊ֐�����̃G���[���[�����M�ɗv�C��
    /** ���̑��G���[���[����� */
    const ERROR_MAIL_INFO = {
        SUBJECT: "�yNetSuite�zETONET�\��E�o�וۗ��A�g�����G���[",
        BODY: "ETONET�A�g�̗\��E�o�וۗ��A�g�����ɂāA�\��ԍ�{etonetNo}�Ƀo�b�N�I�[�_�[�`�F�b�N�G���[���������܂����B"
    }

    function afterSubmit(context) {
        let currentRec = context.newRecord; // ���M���̃��R�[�h���擾

        // 1.�Ώۂ̔���
        // �T�u���X�g�u�A�C�e���v�̍s���擾
        const itemLines = currentRec.getLineCount('item');
        // ���R�[�h�̎��
        const recType = currentRec.type;
        // �g�����U�N�V�����̎�ނ��u�������v�ȊO�̏ꍇ�A�������I��
        if (recType != "SALES_ORDER") {
            return;
        }
        // �`�[���
        const salesType = currentRec.getValue(FIELD_ID.TRAN_TYPE);
        // �`�[��ނ��uETONET�\��o�וۗ��v�ȊO�̏ꍇ�A�������I��
        if (salesType != "ETONET�\��o�וۗ�") {
            return;
        }
        // ETONET�ԍ����擾
        const etonetNo = currentRec.getValue(FIELD_ID.ETONET_NUMBER);
        // ETONET�ԍ��̓�������"R"�����R�[�h�^�C�v���V�K�쐬�̏ꍇ�A�������I��
        if (etonetNo.startWith('R') && context.type === context.UserEventType.CREATE) {
            return;
        }


        // 2.�o�b�N�I�[�_�[�`�F�b�N
        // �A�C�e�����C���̃��[�v
        for (let itemLine = 0; i < itemLines; itemLine++) {
            // ���ځu�o�b�N�I�[�_�[�v��0���傫���ꍇ
            let backOrder = currentRec.getSublistValue({
                sublistId: 'item',
                line: itemLine,
                fieldId: FIELD_ID.BACKORDERED
            });
            if (backOrder > 0){
                // ���[�����M��̃A�h���X�擾
                let sendTo = constLib.EMAIL_ADDRESS.SYS_ADOMINISTRATOR;
                let mailSubject = ERROR_MAIL_INFO.SUBJECT
                let mailBody = ERROR_MAIL_INFO.BODY.replace("{etonetNo}", etonetNo);
            
                // TODO:���ʊ֐�����̃G���[���[�����M�ɗv�C��
                // �G���[���[���𑗐M
                email.send({
                    author: sendTo,
                    subject: mailSubject,
                    body: mailBody,
                    recipients: sendTo,
                    attachments: existError ? [errorFile] : null
                });
                return;
            }
        }
    }
    return {
        afterSubmit: afterSubmit
    }

});