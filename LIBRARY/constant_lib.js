/**
 * @NApiVersion 2.1
*/
define([],
    function () {

        /** Bank Details �����^�C�v */
        const ENTITY_BANK_TYPE = {
            PRIMARY: "1",//�v���C�}������
            SUB: "2",//������
        }

        /** �ړ��`�[�X�e�[�^�X */
        const INV_TRAN_STATUS = {
            PRE_APPROVE: "TrnfrOrd:A",//���F�҂�
        }

        /** ���[���A�h���X */
        const EMAIL_ADDRESS = {
            //TODO�F�V�X�e���Ǘ��Ҍ��莟��C��
            SYS_ADOMINISTRATOR: "m.sawada@four-brains.com",//�V�X�e���Ǘ���
        }

        /** �t�@�C���L���r�l�b�g */
        const CABINET = {
            FORDER: {
            //TODO�F�t�H���_�\�����܂莟��C��
            ETONET_ERROR_INFO_CSV: "1227",//ETONET�A�g�G���[�ڍ׃t�H���_
            }
        }
        /** CM_�A�C�e�����i�����ύX*/
        const ITEM_TYPE = {
            "OthCharge" : "otherchargeitem", // ���̑��̎萔��
            "Markup" : "markupitem", // �}�[�N�A�b�v
            "Kit" : "kititem",// �L�b�g/�p�b�P�[�W
            "InvtPart" :  "inventoryitem",// �݌ɃA�C�e��
            "Discount" : "discountitem", // �f�B�X�J�E���g
            "Service" : "serviceitem", // �T�[�r�X
            "Assembly" : "assemblyitem",// �A�Z���u��
            "NonInvtPart" : "noninventoryitem"// ��݌ɃA�C�e��
        } // �A�C�e���^�C�v�}�b�s���O

        return {
            ENTITY_BANK_TYPE: ENTITY_BANK_TYPE,
            INV_TRAN_STATUS: INV_TRAN_STATUS,
            EMAIL_ADDRESS: EMAIL_ADDRESS,
            CABINET: CABINET,
            ITEM_TYPE:ITEM_TYPE
        }
    }
);