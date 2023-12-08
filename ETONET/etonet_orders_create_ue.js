/**
 * ETONET_�󒍘A�g
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @Version 1.0
 * @CreatedBy Mariya Sawada
 * @CreatedDate 2023/11/13
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

    /** ���b�Z�[�WID */
    const MESSAGE_ID = {
        ORDERS_CREATE_UE: 'ETONET_OEDERS_CREATE_UE_ERROR'
    }

    function afterSubmit(context) {
        let currentRec = context.newRecord; // ���M���̃��R�[�h���擾

        // 1.�Ώۂ̔���
        // �T�u���X�g�u�A�C�e���v�̍s���擾
        const itemLines = currentRec.getLineCount('item');
        // ���R�[�h�̎��
        const recType = currentRec.type;
        // �g�����U�N�V�����̎�ނ��u�������v�ȊO�̏ꍇ�A�������I��
        if (recType != "SALES_ORDER"){
            return;
        }
        // �`�[���
        const salesType = currentRec.getValue(FIELD_ID.TRAN_TYPE);
        // �`�[��ނ��uETONET�󒍁v�ȊO�̏ꍇ�A�������I��
        if (salesType != "ETONET��"){
            return;
        }

        // 2.�o�b�N�I�[�_�[�`�F�b�N
        // ETONET�ԍ����擾
        const orderNo = currentRec.getValue(FIELD_ID.ETONET_NUMBER);
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
                // ���[�������i�[
                const mailContent = {};
                mailContent.author = sendTo;
                mailContent.recipients = sendTo;
                mailContent.attachments.push(existError ? [errorFile] : null);
                mailContent.body.push(orderNo);

                // �G���[���[���𑗐M
                common.sendMail(mailContent, MESSAGE_ID.ORDERS_CREATE_UE);
                return;
            }
        }
    }
    return {
        afterSubmit: afterSubmit
    }

});