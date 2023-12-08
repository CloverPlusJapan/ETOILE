/**
 * @NApiVersion 2.1
*/
define([
    'N/search',
    'N/record',
    'N/email',
    'N/format',
    '../LIBRARY/constant_lib.js'
], function (
    search,
    record,
    email,
    format,
    constLib
) {

        /** �t�H���_ */
        const FOLDER = {
            /** ������ */
            UNTREATED: {
                ORDER: '1242',// �󒍘A�g
                RESERVE_INDEX: '1246',//�\��o�וۗ��A�g
                CUSTOMER: '1250'// �ڋq�A�g 
            }
        }

        /** �ϊ���� */
        // TODO:�}�X�^�o�^��ɗv�C��
        const CONVERSION_INFO = {
            /** �f�[�^�敪 */
            DATA_CLASS: {
                1: "1",
                2: "2",
                3: "3",
                4: "4"
            },
            /** ���Z���@�敪 */
            PAY_TYPE: {
                20: "20",
                30: "30",
                31: "31",
                32: "32",
                40: "40",
                45: "45",
                50: "50",
                60: "60",
                97: "97",
                98: "98",
                99: "99"
            },
            /** ��n�敪 */
            DELIVER_TYPE: {
                1: "1",
                2: "2",
                3: "3",
                4: "4",
                5: "5"
            },
            /** �K�p����ŃR�[�h */
            APPLIED_TAX_CD: {
                '02': "11", // �y���ŗ�8%
                '03': "10", // 10%
                '05': "9" // ��ې�
            },
            /** �󒍌o�H�敪 */
            ORDER_ROUTE_TYPE: {
                '01': "01", // EC
                '02': "02", // �w������
                '03': "03", // �i�Ԏw��
                '04': "04", // ���C�ɓ���
                '09': "09" // �\��E�o�וۗ��E�㗝��
            },
            /** �����敪 */
            DISCOUNT_CATEGORY: {
                0: "0", // �ʏ�
                3: "3", // �Z�[���i�l�������j
                4: "4", // ���i�ύX
                5: "5", // �ڋq�ʊ���
                6: "6", // �ڋq�ʊ���
                7: "7", // �ڋq�ʊ���+�Z�[��
                8: "8", // �ڋq�ʊ���+�Z�[��
            },
            /** �����s�敪 */
            OPERATION_PROXY_TYPE: {
                0: "0", // �Ȃ�
                1: "1", // ����
            },
            /** �ڋq�ʉ��i�敪 */
            CUSTOMER_PRICE_TYPE: {
                0: "0", // �ʏ�
                3: "3", // �ڋq�ʊ���
                4: "4", // �ڋq�ʊ���
            },
            /** ���͂���S���Ҍh�� */
            MANGER_HONORIFIC_TITLE: {
                0: "0", // �h�̂Ȃ�
                1: "1", // Mr.
                2: "2", // Ms.
            },
            /** �̔��X�e�[�^�X */
            SALE_STATUS: {
                '01': "01", // ON
            },
            /** �f�ڃX�e�[�^�X */
            PUBLISH_STATUS: {
                '03': "03", // �f�ڍς�
            },
            /** �̔������敪 */
            LIMITED_SALES_CATEGORY: {
                0: "0", // �ʏ폤�i
                1: "1", // �̘H����̔����i
            },
            /** �W�v�敪 */
            AGGREGATION_CATEGORY: {
                1: "1", // ���i
                2: "2", // ���i�O
                3: "3", // ���v
            },
            /** �\��ԍ�1 */
            RESERVATION_NUMBER_1: {
                R: "R", // �\��
                T: "T", // �o�וۗ�
            },
            /** �D��x */
            ORDER_PRIORITY: {
                '2': "2", // ��
                '1': "1", // ��
                '0': "0", // ��
                '-1': "-1", // ��
            },
            /** ���ݏ�� */
            CURRENT_STATUS: {
                0: "0", // �����҂�
                1: "1", // �����ς�
                2: "2", // �����ς�
                3: "3", // ���
                4: "4", // �����؂�
            },
            /** �㗝�җ\��t���O */
            AGENCY_ORDER_FLG: {
                0: "0", // �Ȃ�
                1: "1", // ����
            },
            /** �X�V�敪 */
            UPDATE_CATEGORY: {
                1: "1", // �V�K
                2: "2", // �C��
                3: "3", // �폜
            },
            /** �Ή����� */
            SUPPORTED_LANGUAGE: {
                1: "1", // ���{��
                2: "2", // �p��
                3: "3", // �ɑ̎�
                4: "4", // �ȑ̎�
                5: "5", // �؍���
                6: "6", // ���̑�
            },
            /** ���[����M���� */
            MAIL_RECEIVING_LANGUAGE: {
                1: "1", // ���{��
                2: "2", // �p��
                3: "3", // �ɑ̎�
                4: "4", // �ȑ̎�
                5: "5", // �؍���
            },
            /** �{�x�X�敪 */
            HEAD_BRANCH_DIVISION: {
                1: "1", // �{�X
                2: "2", // �x�X
                3: "3", // �P�X
            },
            /** �N���敪 */
            NEW_YEARS_CARD_CD: {
                1: "1", // �r��
                2: "2", // �Ȃ�
            },
            /** �K��敪 */
            TERMS_AND_CONDITIONS: {
                0: "0", // �Ȃ�
                1: "1", // �˗���
                2: "2", // �󗝓�
            },
            /** �T�[�r�X����z */
            SERVICE_STANDARD_AMOUNT: {
                0: "0", // �펞�T�[�r�X
                1: "1", // 1���ȏ�T�[�r�X
                2: "2", // 2���ȏ�T�[�r�X
                3: "3", // 3���ȏ�T�[�r�X
                4: "4", // 4���ȏ�T�[�r�X
                5: "5", // 5���ȏ�T�[�r�X
            },
            /** ����ꏊ���L�`�� */
            SALES_PLACE: {
                1: "1", // ���ȏ��L
                2: "2", // �e�i���g
            },
            /** EK�𗘗p����ړI */
            PURPOSE_OF_USE: {
                1: "1", // ���X��V���Ɏn�߂邽��
                2: "2", // �V�K���i�̊J��,�����̂���
                3: "3", // ��������悩��d���ꂪ�ł��Ȃ��Ȃ�������
                4: "4", // �����W
                5: "5", // ���̑�
            },
            /** ���Ђ�m������������ */
            HOW_FOUND_OUR_CONPANY: {
                1: "1", // �C���^�[�l�b�g�Ō���
                2: "2", // �m�l�̏Љ�
                3: "3", // �G���A�V���A���ЂȂ�
                4: "4", // ���̑����ڍ�
            },
            /** ��Ȏ���� */
            MAJOR_TRADING_PARTNERS: {
                1: "1", // �l�b�g�d����
                2: "2", // ���[�J�[
                3: "3", // �≮
                4: "4", // ��古��
                5: "5", // ���̑�
            },
            /** ���{����̎d���� */
            SUPPLIERS_FROM_JAPAN: {
                1: "1", // ���[�J�[
                2: "2", // �����≮
                3: "3", // �l�b�g��
                4: "4", // ���̑�
            },
            /** �X�܂̃e�C�X�g�C���[�W */
            SHOP_TASTE_IMAGE: {
                1: "1", // ���_��
                2: "2", // �V���v��
                3: "3", // �i�`������
                4: "4", // �J�W���A��
                5: "5", // �|�b�v
            },
            /** ���╞���̃C���[�W */
            FASHION_IMAGE: {
                1: "1", // �N���V�b�N
                2: "2", // ���_��
                3: "3", // �}�j�b�V��
                4: "4", // �X�|�[�e�B�u
                5: "5", // �A�o���M�����h
            },
            /** �����Ă���C���e���A/�����G�݂̃C���[�W */
            INTERIOR_IMAGE: {
                1: "1", // �N���V�b�N
                2: "2", // ���_��
                3: "3", // �|�b�v
                4: "4", // �i�`������
                5: "5", // �A�o���M�����h
                6: "6", // �G�X�j�b�N
                7: "7", // �V���v��
                8: "8", // �G���K���g
                9: "9", // �J�W���A��
                10: "10", // ���̑�
            },
            /** �戵�����i(�A�p����)�̉��i�� */
            APPAREL_PLICE_RANGE: {
                1: "1", // 5000�~����
                2: "2", // 5000�~~10000�~����
                3: "3", // 10000�~~30000�~����
                4: "4", // 30000�~�ȏ�
            },
            /** �戵�����i(�G��)�̉��i�� */
            GOODS_PLICE_RANGE: {
                1: "1", // 500�~����
                2: "2", // 500�~~1000�~����
                3: "3", // 1000�~~5000�~����
                4: "4", // 5000�~�ȏ�
            },
            /** �̔��`�� */
            SALES_FORM: {
                1: "1", // ���X�܂̂�
                2: "2", // �l�b�g�̂�
                3: "3", // ���X�܁{�l�b�g
                4: "4", // ���̑�
            },
            /** ������ */
            MEMBERSHIP_TYPE: {
                1: "1", // �ʏ���
                2: "2", // ���ʕ֋X
                3: "3", // ���ԓo�^
                4: "4", // OBOG
                5: "5", // �Ј�
                6: "6", // �p�[�g
                7: "7", // �h��
                8: "8", // ����惁�[�J�[
                9: "9", // �Г��֋X�p
                10: "10", // ��s�Ǝ�
                11: "11", // �l���
                12: "12", // ��v�Ǘ��p
            },
            /** ����`�[�E�l���R�[�h */
            STYLE_CODE: {
                1: "1", // �`�F�[���X�g�A
                2: "2", // �S�ݓX
            },
            /** ����`�[�E���i�R�[�h�󎚈ʒu */
            PRODUCT_CD_PRINTING_POSITION: {
                1: "1", // �i������i�Ɉ�
                2: "2", // ���i�R�[�h���Ɉ�
            },
            /** ���d���f�[�^�E�����敪 */
            PROCESSING_DIVISION: {
                1: "1", // Mail71
                2: "2", // Mail9
                3: "3", // Mail91
                4: "4", // Edi6
                5: "5", // Mail10
            },
            /** ���d���f�[�^�E���M���@ */
            HOW_TO_SEND: {
                1: "1", // ���[��
                2: "2", // EDI
            },
            /** �U�֋敪 */
            TRANSFER_CLASS: {
                1: "1", // �s��
                2: "2", // �n��
                3: "3", // �X�֋�
            },
            /** ������ */
            WITHDRAWAL_DATE: {
                1: "1", // �k�C��
                2: "2", // �n��
                3: "3", // �X�֋�
                5: "5", // �肻��
                6: "6", // �݂���
                7: "7", // �O�HUFJ
            },
            /** �a���敪 */
            DEPOSIT_CLASS: {
                1: "1", // ����
                2: "2", // ����
            },
            /** �l���` */
            INDIVISUAL_NAME: {
                1: "1", // �l���`
                2: "2", // ��
            },
            /** �����敪 */
            CLOSING_DATE_CLASS: {
                1: "1", // 5��
                2: "2", // 10��
                3: "3", // 15��
                4: "4", // 20��
                5: "5", // 25��
                6: "6", // ��
            },
            /** ��敪 */
            ASSOCIATION_CLASS: {
                1: "1", // ���t��
                2: "2", // �o����
                3: "3", // �S����
            },
            /** �������@ */
            PAYMENT_METHOD: {
                1: "1", // �o������
                2: "2", // �ʐM����
                3: "3", // �U�֓���
                4: "4", // ��������
                5: "5", // ��s����
            },
            /** �萔���敪 */
            COMMISSION_CLASS: {
                1: "1", // ���Е��S
                2: "2", // ����敉�S
            },
            /** �@�l�E�l���Ǝ�敪 */
            BUSINESS_OWNER_CLASS: {
                1: "1", // �@�l
                2: "2", // �l
            },
            /** �ԍϕ��@ */
            REPAYMENT_METHOD: {
                1: "1", // �U��
                2: "2", // �����U��
            },
            /** �^���փR�[�h */
            TRANSPORT_CODE: {
                '02': "02", // ����}��
                '25': "25", // ���}�g�^�A
                '45': "45", // ���{�X��
            },
            /** ���� */
            GENDER: {
                0: "0", // �s��
                1: "1", // �j��
                2: "2", // ����
            },
        }

        /**
         * �󒍘A�g�w�b�_�̏��
         *  fieldid�ɂ���
         *   �E�����̃t�B�[���h���w�肷��ꍇ�̓J���}�ŋ�؂�
         *   �E�T�u���X�g(����)�̃t�B�[���h���w�肷��ꍇ�̓T�u���X�gID�ƃt�B�[���hID���R�����ŋ�؂�
         **/
        const HEADER_INFO = [
            {index:0,label:"�󒍓�",fieldid:"trandate",isRequired:true,isInteger:false,isDate:true,list:null},
            {index:1,label:"ETONET�ԍ�",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:2,label:"�f�[�^�敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DATA_CLASS),conversionInfo: CONVERSION_INFO.DATA_CLASS},
            {index:3,label:"�󒍎���",fieldid:"custbody_etonet_registration_time",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:4,label:"��M��",fieldid:"custbody_csv_receive_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:5,label:"��M����",fieldid:"custbody_csv_receive_time",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"���[�U�h�c",fieldid:"entity",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:7,label:"�X��",fieldid:"billaddress:addressee",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:8,label:"�X�֔ԍ�",fieldid:"billaddress:zip",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:9,label:"�Z���P",fieldid:"billaddress:state",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:10,label:"�Z���Q",fieldid:"billaddress:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:11,label:"�Z���R",fieldid:"billaddress:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:12,label:"�d�b�ԍ�",fieldid:"billaddress:addrphone",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:13,label:"���͂���?",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:14,label:"���͂���X��",fieldid:"addressee",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:15,label:"���͂���X�֔ԍ�",fieldid:"zip",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"���͂���Z���P",fieldid:"city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:17,label:"���͂���Z���Q",fieldid:"addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:18,label:"���͂���Z���R",fieldid:"addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:19,label:"���͂���Z���S",fieldid:"addr3",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:20,label:"���͂���S���Ҍh��",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.MANGER_HONORIFIC_TITLE),conversionInfo:CONVERSION_INFO.MANGER_HONORIFIC_TITLE},
            {index:21,label:"���͂���S���Җ�",fieldid:"attention",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:22,label:"���͂��捑�R�[�h",fieldid:"country",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:23,label:"���͂���d�b�ԍ�",fieldid:"addrphone",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:24,label:"���Z���@�敪",fieldid:"custbody_payment_method_kbn",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PAY_TYPE),conversionInfo: CONVERSION_INFO.PAY_TYPE},
            {index:25,label:"���Z�ꏊ�R�[�h",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:26,label:"�o�׊�]��",fieldid:"shipdate",isRequired:true,isInteger:false,isDate:true,list:null},
            {index:27,label:"�i�؎��Ή��敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:28,label:"�d�b��������",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:29,label:"�ۗ��i����",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:30,label:"�e�`�w��������",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:31,label:"�R�����g",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:32,label:"���i���z�v",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:33,label:"EC�T�C�g�l����",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:34,label:"�������z",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:35,label:"���v",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:36,label:"����Ŋz",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:37,label:"�󒍋��z���v",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:38,label:"�d����",fieldid:"custbody_purchase_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:39,label:"�o�ד�����敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:40,label:"���i���A���S���Җ�",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:41,label:"���i���A����",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:42,label:"��n�敪",fieldid:"custbody_delivery_type",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DELIVER_TYPE),conversionInfo: CONVERSION_INFO.DELIVER_TYPE},
            {index:43,label:"��n�敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:44,label:"��s�Ǝ҃���",fieldid:"custbody_proxy_operator",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:45,label:"�N���W�b�g��ЃR�[�h",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:46,label:"���Z�ڋq�R�[�h",fieldid:"custbody_payment_customer",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:47,label:"EC�T�C�g�l���z",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:48,label:"�����ӗl�l����_�ʏ�",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:49,label:"�����ӗl�l���z_�ʏ�",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:50,label:"�����ӗl�l����_�����",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:51,label:"�����ӗl�l���z_�����",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:52,label:"��ېŋ敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:53,label:"�ېŗ�",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:54,label:"����Ŋz_���i�v",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:55,label:"����",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:56,label:"�����T�[�r�X�z",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:57,label:"����萔���z",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:58,label:"����萔���T�[�r�X�z",fieldid:"item:amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:59,label:"���i�O�v",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:60,label:"����Ŋz_���i�O�v",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:61,label:"�l���������v�z",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:62,label:"�^����ЃR�[�h",fieldid:"custbody_transport_co",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:63,label:"�m�F���[�����M�挏��",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:64,label:"�T�[�`���[�W��",fieldid:null,isRequired:false,isInteger:true,isDate:false,list:null},
            {index:65,label:"�ی���",fieldid:null,isRequired:false,isInteger:true,isDate:false,list:null},
            {index:66,label:"���ID",fieldid:"custbody_transaction_id",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:67,label:"����p�X���[�h",fieldid:"custbody_transaction_pw",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:68,label:"������",fieldid:"custbody_transaction_status",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:69,label:"�����s�敪",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.OPERATION_PROXY_TYPE),conversionInfo:CONVERSION_INFO.OPERATION_PROXY_TYPE},
            {index:70,label:"�����s��",fieldid:"custbody_operation_proxy",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:71,label:"�Z��4",fieldid:"addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:72,label:"�Z��5",fieldid:"addr3",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:73,label:"���͂���Z��5",fieldid:"custrecord_addr4",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:74,label:"���͂���Z��6",fieldid:"custrecord_addr5",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:75,label:"�N�[�|���R�[�h",fieldid:"custbody_coupon_code",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:76,label:"�I�[�_�[ID",fieldid:"custbody_gmo_order_id",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:77,label:"�ʔ�",fieldid:"order_sequence_number",isRequired:false,isInteger:true,isDate:false,list:null},
        ];

        /**
         * �󒍘A�g���ׂ̏��
         *  fieldid�ɂ���
         *   �E�����̃t�B�[���h���w�肷��ꍇ�̓J���}�ŋ�؂�
         *   �E�T�u���X�g(����)�̃t�B�[���h���w�肷��ꍇ�̓T�u���X�gID�ƃt�B�[���hID���R�����ŋ�؂�
         **/
        const DETAIL_INFO = [
            {index:0,label:"�󒍓�",fieldid:null,isRequired:true,isInteger:false,isDate:true,list:null},
            {index:1,label:"ETONET�ԍ�",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:2,label:"�f�[�^�敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DATA_CLASS),conversionInfo: CONVERSION_INFO.DATA_CLASS},
            {index:3,label:"�s?",fieldid:"item:line",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:4,label:"�t���A�R�[�h",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:5,label:"�ޔ�",fieldid:"item:custcol_category_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"�i��",fieldid:"item:custcol_product_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:7,label:"CL",fieldid:"item:custcol_color",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:8,label:"SZ",fieldid:"item:custcol_size",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:9,label:"���i��",fieldid:"item:custcol_product_name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:10,label:"�ʏ퉵���i",fieldid:"item:custcol_normal_wholesale_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:11,label:"�̔������i",fieldid:"item:custcol_sales_wholesale_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:12,label:"����",fieldid:"item:quantity",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:13,label:"���z",fieldid:"item:amount",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:14,label:"�ڍ׃J���[��",fieldid:"item:custcol_detail_color",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:15,label:"�ڍ׃T�C�Y��",fieldid:"item:custcol_detail_size",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"�̔��X�e�[�^�X",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SALE_STATUS),conversionInfo:CONVERSION_INFO.SALE_STATUS},
            {index:17,label:"�f�ڃX�e�[�^�X",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PUBLISH_STATUS),conversionInfo:CONVERSION_INFO.PUBLISH_STATUS},
            {index:18,label:"�󒍌o�H�敪",fieldid:"item:custcol_order_route_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.ORDER_ROUTE_TYPE),conversionInfo:CONVERSION_INFO.ORDER_ROUTE_TYPE},
            {index:19,label:"�����敪",fieldid:"item:custcol_discount_type",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DISCOUNT_CATEGORY),conversionInfo:CONVERSION_INFO.DISCOUNT_CATEGORY},
            {index:20,label:"�ޕi�ԓo�^��",fieldid:"item:custcol_commodity_id_regist_date",isRequired:true,isInteger:false,isDate:true,list:null},
            {index:21,label:"�̔������敪",fieldid:"item:custcol_sales_dest_limit_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.LIMITED_SALES_CATEGORY),conversionInfo:CONVERSION_INFO.LIMITED_SALES_CATEGORY},
            {index:22,label:"�q���敪",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:23,label:"�������i",fieldid:"item:custcol_retail_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:24,label:"���l��",fieldid:"item:custcol_wholesale_rate",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:25,label:"���P��",fieldid:"item:custcol_wholesale_unit",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:26,label:"�ʏ퉵�P��",fieldid:"item:custcol_normal_wholesale_unit_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:27,label:"�̔����P��",fieldid:"item:custcol_sales_wholesale_price",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:28,label:"�����s�敪",fieldid:"item:custcol_operation_proxy_type",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.OPERATION_PROXY_TYPE),conversionInfo:CONVERSION_INFO.OPERATION_PROXY_TYPE},
            {index:29,label:"�����s��",fieldid:"item:custcol_operation_proxy",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:30,label:"�K�p����ŃR�[�h",fieldid:"item:custcol_applicable_consump_tax_cd",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.APPLIED_TAX_CD),conversionInfo:CONVERSION_INFO.APPLIED_TAX_CD},
            {index:31,label:"����ŗ��i�ېŗ��j",fieldid:null,isRequired:false,isInteger:true,isDate:false,list:null},
            {index:32,label:"�}�X�^�����i",fieldid:"item:custcol_master_wholesale_price",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:33,label:"�}�X�^���P��",fieldid:"item:custcol_master_wholesale_unit_price",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:34,label:"�ڋq�ʉ��i�敪",fieldid:"item:custcol_customer_price_type",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.CUSTOMER_PRICE_TYPE),conversionInfo:CONVERSION_INFO.CUSTOMER_PRICE_TYPE},
            {index:35,label:"�ڋq�ʉ��i��",fieldid:"item:custcol_customer_price_rate",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:36,label:"�ڋq�ʉ����i",fieldid:"item:custcol_customer_wholesale_price",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:37,label:"�ڋq�ʉ��P��",fieldid:"item:custcol_customer_wholesale_unit_price",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:38,label:"�]��",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
        ];

        /**
         * �󒍘A�g���[�����ׂ̏��
         *  fieldid�ɂ���
         *   �E�����̃t�B�[���h���w�肷��ꍇ�̓J���}�ŋ�؂�
         *   �E�T�u���X�g(����)�̃t�B�[���h���w�肷��ꍇ�̓T�u���X�gID�ƃt�B�[���hID���R�����ŋ�؂�
         **/
        const MAIL_INFO = [
            {index:0,label:"�󒍓�",fieldid:null,isRequired:true,isInteger:false,isDate:true,list:null},
            {index:1,label:"ETONET�ԍ�",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:2,label:"�f�[�^�敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DATA_CLASS),conversionInfo: CONVERSION_INFO.DATA_CLASS},
            {index:3,label:"�ʔ�",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:4,label:"���[���A�h���X",fieldid:"mail",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:5,label:"�]��",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
        ];

        /**
         * �󒍘A�g����Ŗ��ׂ̏��
         *  fieldid�ɂ���
         *   �E�����̃t�B�[���h���w�肷��ꍇ�̓J���}�ŋ�؂�
         *   �E�T�u���X�g(����)�̃t�B�[���h���w�肷��ꍇ�̓T�u���X�gID�ƃt�B�[���hID���R�����ŋ�؂�
         **/
        const TAX_INFO = [
            {index:0,label:"�󒍓�",fieldid:null,isRequired:true,isInteger:false,isDate:true,list:null},
            {index:1,label:"ETONET�ԍ�",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:2,label:"�f�[�^�敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DATA_CLASS),conversionInfo: CONVERSION_INFO.DATA_CLASS},
            {index:3,label:"�W�v�敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.AGGREGATION_CATEGORY),conversionInfo:CONVERSION_INFO.AGGREGATION_CATEGORY},
            {index:4,label:"�K�p����ŃR�[�h",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.APPLIED_TAX_CD),conversionInfo:CONVERSION_INFO.APPLIED_TAX_CD},
            {index:5,label:"����ŗ�",fieldid:null,isRequired:true,isInteger:true,isDate:false,list:null},
            {index:6,label:"����őΏۊz",fieldid:"custbody_etonet_nontaxable_amount",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:6,label:"����őΏۊz",fieldid:"custbody_etonet_taxable_amount_10",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:6,label:"����őΏۊz",fieldid:"custbody_etonet_taxable_amount_8",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:7,label:"����Ŋz",fieldid:"custbody_etonet_tax_amount_10",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:7,label:"����Ŋz",fieldid:"custbody_etonet_tax_amount_8",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:8,label:"�]��",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
        ];

        /**
         * �\��E�o�וۗ��A�g�̏��
         *  fieldid�ɂ���
         *   �E�����̃t�B�[���h���w�肷��ꍇ�̓J���}�ŋ�؂�
         *   �E�T�u���X�g(����)�̃t�B�[���h���w�肷��ꍇ�̓T�u���X�gID�ƃt�B�[���hID���R�����ŋ�؂�
         **/
        const RESERVE_INFO = [
            {index:0,label:"�\��ԍ��P",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.RESERVATION_NUMBER_1),conversionInfo:CONVERSION_INFO.RESERVATION_NUMBER_1},
            {index:1,label:"�\��ԍ��Q",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"�\��ԍ��R",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:3,label:"�\��ԍ��}��",fieldid:"custbody_etonet_so_number",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:4,label:"�\���",fieldid:"trandate",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:5,label:"�\�񎞊�",fieldid:"custbody_etonet_registration_time",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"����ԍ�",fieldid:"entity",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:7,label:"�ޔ�",fieldid:"item:custcol_category_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:8,label:"�i��",fieldid:"item:custcol_product_number",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:9,label:"CL",fieldid:"item:custcol_color",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:10,label:"SZ",fieldid:"item:custcol_size",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:11,label:"���i�o�^��",fieldid:"item:custcol_product_registration_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:12,label:"���i��",fieldid:"custcol_product_name",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:13,label:"�\��",fieldid:"item:quantity",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:14,label:"������",fieldid:"item:quantity",isRequired:true,isInteger:true,isDate:false,list:null},
            {index:15,label:"����������",fieldid:"item:custcol_allocation_completion_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"������������",fieldid:"item:custcol_allocation_completion_time",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:17,label:"�D��x",fieldid:"item:orderpriority",isRequired:true,isInteger:true,isDate:false,list:Object.keys(CONVERSION_INFO.OPERATION_PROXY_TYPE),conversionInfo:CONVERSION_INFO.ORDER_PRIORITY},
            {index:18,label:"���ݏ��",fieldid:"item:custcol_current_status",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.CURRENT_STATUS),conversionInfo:CONVERSION_INFO.CURRENT_STATUS},
            {index:19,label:"�󒍓�",fieldid:"item:custcol_order_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:20,label:"��?",fieldid:"item:custcol_etonet_order_number",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:21,label:"�㗝�\��t���O",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.AGENCY_ORDER_FLG),conversionInfo:CONVERSION_INFO.AGENCY_ORDER_FLG},
            {index:22,label:"�㗝�\��҃R�[�h",fieldid:"custbody_operation_proxy",isRequired:false,isInteger:false,isDate:false,list:null},
        ];

        /**
         * �ڋq�A�g�̌ڋq���
         *  fieldid�ɂ���
         *   �E�����̃t�B�[���h���w�肷��ꍇ�̓J���}�ŋ�؂�
         *   �E�T�u���X�g(����)�̃t�B�[���h���w�肷��ꍇ�̓T�u���X�gID�ƃt�B�[���hID���R�����ŋ�؂�
         **/
        // TODO:fieldid��""�̉ӏ��͗v�m�F�A����̃J�X�^���́ucustbody�v�����őO�ɂ��Ă���i�C���̉\������j
        const CUSTOMER_INFO = [
            {index:0,label:"�X�V�敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.UPDATE_CATEGORY),conversionInfo:CONVERSION_INFO.UPDATE_CATEGORY},
            {index:1,label:"����ԍ�",fieldid:"entityid",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"�@�l��",fieldid:"companyname",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:3,label:"�@�l���i�J�i�j",fieldid:"phoneticname",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:4,label:"���[���A�h���X",fieldid:"email",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:5,label:"�����}�K��M�ݒ�",fieldid:"custbody_mail_setting",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"�ڋq�C�O�敪",fieldid:"custbody_customer_overseas_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:7,label:"ETONET�o�^�敪",fieldid:"custbody_etonet_reg_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:8,label:"���E�n��",fieldid:"custbody_country_or_region",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:9,label:"�Ή�����i���C���j",fieldid:"custbody_main_lang_support",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPORTED_LANGUAGE),conversionInfo:CONVERSION_INFO.SUPPORTED_LANGUAGE},
            {index:10,label:"�Ή�����i�T�u�j",fieldid:"custbody_sub_lang_support",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPORTED_LANGUAGE),conversionInfo:CONVERSION_INFO.SUPPORTED_LANGUAGE},
            {index:11,label:"���[����M����",fieldid:"custbody_email_recept_lang",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.MAIL_RECEIVING_LANGUAGE),conversionInfo:CONVERSION_INFO.MAIL_RECEIVING_LANGUAGE},
            {index:12,label:"����K��m�F��",fieldid:"custbody_mem_agree_conf_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:13,label:"EC���p��~",fieldid:"custbody_ec_usage_suspend",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:14,label:"�{�x�X�敪",fieldid:"custbody_head_office_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.HEAD_BRANCH_DIVISION),conversionInfo:CONVERSION_INFO.HEAD_BRANCH_DIVISION},
            {index:15,label:"�{�X�R�[�h",fieldid:"parent",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"���э��Z�敪",fieldid:"custbody_perf_agg_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:17,label:"�{�X���Z�ꊇ�R�[�h",fieldid:"custbody_head_office_sett_bulk_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:18,label:"��������敪",fieldid:"custbody_mem_disc_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:19,label:"����\����",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:20,label:"����ؔ��s��",fieldid:"custbody_mem_card_issue_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:21,label:"����ؗL������",fieldid:"custbody_mem_card_valid_period",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:22,label:"����J�n��",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:23,label:"�S���t���A",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:24,label:"�v�Z�t���A�R�[�h",fieldid:"custbody_calc_floor_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:25,label:"��S���Ј��ԍ�1",fieldid:"custbody_main_resp_emp_no_1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:26,label:"��S���Ј��ԍ�2",fieldid:"custbody_main_resp_emp_no_2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:27,label:"������ʃR�[�h����������N",fieldid:"custbody_mem_ident_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:28,label:"������ދ敪",fieldid:"custbody_mem_classification_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:29,label:"���ʌŒ�敪",fieldid:"custbody_ident_fixed_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:30,label:"�c�l�`�F�b�N�R�[�h",fieldid:"custbody_dm_check_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:31,label:"�N���敪",fieldid:"custbody_ny_card_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.NEW_YEARS_CARD_CD),conversionInfo:CONVERSION_INFO.NEW_YEARS_CARD_CD},
            {index:32,label:"������~(�a�`�c)�R�[�h",fieldid:"custbody_txn_discon_bad_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:33,label:"������~�R�[�h���͓�",fieldid:"custbody_txn_discon_cd_input_date",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:34,label:"�����ʃR�[�h",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:35,label:"���L�R�[�h",fieldid:"custbody_note_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:36,label:"�X�V���~(�X)�R�[�h",fieldid:"custbody_update_stop_closure_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:37,label:"�X�܋敪�i���X�܃R�[�h�j",fieldid:"custbody_store_type_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:38,label:"��ʋK��敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TERMS_AND_CONDITIONS),conversionInfo:CONVERSION_INFO.TERMS_AND_CONDITIONS},
            {index:39,label:"��ʋK���",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:40,label:"���X�܋K��敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TERMS_AND_CONDITIONS),conversionInfo:CONVERSION_INFO.TERMS_AND_CONDITIONS},
            {index:41,label:"���X�܋K���",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:42,label:"�l�b�g�K��敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TERMS_AND_CONDITIONS),conversionInfo:CONVERSION_INFO.TERMS_AND_CONDITIONS},
            {index:43,label:"�l�b�g�K���",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:null},
            {index:44,label:"�T�[�r�X����z",fieldid:null,isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SERVICE_STANDARD_AMOUNT),conversionInfo:CONVERSION_INFO.SERVICE_STANDARD_AMOUNT},
            {index:45,label:"���l1",fieldid:"custbody_note_1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:46,label:"���l2",fieldid:"custbody_note_2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:47,label:"���l3",fieldid:"custbody_note_3",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:48,label:"���l4",fieldid:"custbody_note_4",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:49,label:"���l5",fieldid:"custbody_note_5",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:50,label:"���l6",fieldid:"custbody_note_6",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:51,label:"�����1",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:52,label:"����1",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:53,label:"�����2",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:54,label:"����2",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:55,label:"�����3",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:56,label:"����3",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:57,label:"�����4",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:58,label:"����4",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:59,label:"�����5",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:60,label:"����5",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:61,label:"�����6",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:62,label:"����6",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:63,label:"�����7",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:64,label:"����7",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:65,label:"�����8",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:66,label:"����8",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:67,label:"�����9",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:68,label:"����9",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:69,label:"�����10",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:70,label:"����10",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:71,label:"�����11",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:72,label:"����11",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:73,label:"�����12",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:74,label:"����12",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:75,label:"�����13",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:76,label:"����13",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:77,label:"�����14",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:78,label:"����14",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:79,label:"�����15",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:80,label:"����15",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:81,label:"�����16",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:82,label:"����16",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:83,label:"�����17",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:84,label:"����17",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:85,label:"�����18",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:86,label:"����18",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:87,label:"�����19",fieldid:"custrecord_history_date",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:88,label:"����19",fieldid:"custrecord_history",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:89,label:"��\���Z�敪",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:90,label:"���U�敪",fieldid:"",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:91,label:"�N���W�b�g�敪",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:92,label:"���|�敪",fieldid:"",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:93,label:"�X�}�[�g�v�����敪",fieldid:"custbody_smart_plan_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:94,label:"�X�֔ԍ�",fieldid:"addressbook:zip",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:95,label:"�Z���C�O�敪",fieldid:"addressbook:custbody_addr_over_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:96,label:"�s���{���R�[�h",fieldid:"addressbook:custbody_prefecture_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:97,label:"�s���{��",fieldid:"addressbook:state",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:98,label:"�s�撬��",fieldid:"addressbook:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:99,label:"���於",fieldid:"addressbook:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:100,label:"�Ԓn",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:101,label:"������",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:102,label:"�����敪",fieldid:"addressbook:custbody_island_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:103,label:"�u���b�N�R�[�h",fieldid:"addressbook:custbody_block_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:104,label:"�Z��(�J�i)",fieldid:"addressbook:custbody_addr_kana",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:105,label:"�X�ܖ�",fieldid:"addressbook:addressee",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:106,label:"�X��(�J�i)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:107,label:"�d�b�ԍ�",fieldid:"addressbook:addrphone",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:108,label:"FAX",fieldid:"addressbook:fax",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:109,label:"�X�܎ʐ^",fieldid:"custbody_store_photo",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:110,label:"�X�ܓ��ʐ^",fieldid:"custbody_interior_photo",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:111,label:"�c�Əؖ���",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:112,label:"���h",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:113,label:"����ꏊ�L�`��",fieldid:"custbody_store_own_form",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SALES_PLACE),conversionInfo:CONVERSION_INFO.SALES_PLACE},
            {index:114,label:"�����ʐ�",fieldid:"custbody_sales_area",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:115,label:"�x�X�L��",fieldid:"custbody_branch_presence",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:116,label:"�x�X��",fieldid:"custbody_num_of_branches",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:117,label:"�n�ƔN",fieldid:"custbody_founding_year",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:118,label:"��x���L��",fieldid:"custbody_reg_holiday_presence",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:119,label:"��x����",fieldid:"custbody_reg_holiday_mon",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:120,label:"��x����",fieldid:"custbody_reg_holiday_tue",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:121,label:"��x����",fieldid:"custbody_reg_holiday_wed",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:122,label:"��x����",fieldid:"custbody_reg_holiday_thu",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:123,label:"��x����",fieldid:"custbody_reg_holiday_fri",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:124,label:"��x���y",fieldid:"custbody_reg_holiday_sat",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:125,label:"��x����",fieldid:"custbody_reg_holiday_sun",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:126,label:"�c�Ǝ���",fieldid:"custbody_bus_hours",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:127,label:"�]�ƈ���",fieldid:"",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:128,label:"�N��",fieldid:"",isRequired:false,isInteger:true,isDate:false,list:null},
            {index:129,label:"EK�𗘗p����ړI",fieldid:"custbody_purpose_of_ek",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PURPOSE_OF_USE),conversionInfo:CONVERSION_INFO.PURPOSE_OF_USE},
            {index:130,label:"���Ђ�m������������",fieldid:"custbody_how_you_know_us",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.HOW_FOUND_OUR_CONPANY),conversionInfo:CONVERSION_INFO.HOW_FOUND_OUR_CONPANY},
            {index:131,label:"�l�b�g�V���b�v�̗L��",fieldid:"custbody_online_shop_presence",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:132,label:"�l�b�g�V���b�vURL",fieldid:"url",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:133,label:"�l�b�g�V���b�v�̓X�ܖ�",fieldid:"custbody_online_shop_store_name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:134,label:"��Ȏ����",fieldid:"custbody_major_customers",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.MAJOR_TRADING_PARTNERS),conversionInfo:CONVERSION_INFO.MAJOR_TRADING_PARTNERS},
            {index:135,label:"���{����̎d����",fieldid:"custbody_suppliers_from_jp",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPLIERS_FROM_JAPAN),conversionInfo:CONVERSION_INFO.SUPPLIERS_FROM_JAPAN},
            {index:136,label:"�k��5�������ɂ���{��(���n)����",fieldid:"custbody_walking_distance_5min_lo",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:137,label:"�Ǝ�R�[�h",fieldid:"custbody_industry_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:138,label:"�Ǝ�Q�R�[�h",fieldid:"custbody_industry_cd_2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:139,label:"�戵�����i1",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:140,label:"�戵�����i2",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:141,label:"�戵�����i3",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:142,label:"�戵�����i4",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:143,label:"�戵�����i5",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:144,label:"�戵�����i6",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:145,label:"�戵�����i7",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:146,label:"�戵�����i8",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:147,label:"�戵�����i9",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:148,label:"�戵�����i10",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:149,label:"�G�g���[���Ŏd���ꂽ�����i1",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:150,label:"�G�g���[���Ŏd���ꂽ�����i2",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:151,label:"�G�g���[���Ŏd���ꂽ�����i3",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:152,label:"�G�g���[���Ŏd���ꂽ�����i4",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:153,label:"�G�g���[���Ŏd���ꂽ�����i5",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:154,label:"�G�g���[���Ŏd���ꂽ�����i6",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:155,label:"�G�g���[���Ŏd���ꂽ�����i7",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:156,label:"�G�g���[���Ŏd���ꂽ�����i8",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:157,label:"�G�g���[���Ŏd���ꂽ�����i9",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:158,label:"�G�g���[���Ŏd���ꂽ�����i10",fieldid:"name",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:159,label:"�^�[�Q�b�g�̋q�w",fieldid:"custbody_target_customer_seg",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:160,label:"�X�܂̃e�C�X�g�C���[�W",fieldid:"custbody_store_taste_image",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SHOP_TASTE_IMAGE),conversionInfo:CONVERSION_INFO.SHOP_TASTE_IMAGE},
            {index:161,label:"�����Ă��镞�╞���G�݂̃C���[�W",fieldid:"custbody_apparel_accessories_impre",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.FASHION_IMAGE),conversionInfo:CONVERSION_INFO.FASHION_IMAGE},
            {index:162,label:"�����Ă���C���e���A/�����G�݂̃C���[�W",fieldid:"custbody_interior_living_goods_impre",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.INTERIOR_IMAGE),conversionInfo:CONVERSION_INFO.INTERIOR_IMAGE},
            {index:163,label:"�戵�����i(�A�p�����j�̉��i��",fieldid:"custbody_apparel_price_range",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.APPAREL_PLICE_RANGE),conversionInfo:CONVERSION_INFO.APPAREL_PLICE_RANGE},
            {index:164,label:"�戵�����i�i�G�݁j�̉��i��",fieldid:"custbody_misc_goods_price_range",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.GOODS_PLICE_RANGE),conversionInfo:CONVERSION_INFO.GOODS_PLICE_RANGE},
            {index:165,label:"�o�^��",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:166,label:"�o�^����",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:167,label:"�o�^��",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:168,label:"�X�V��",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:169,label:"�X�V����",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:170,label:"�X�V��",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:171,label:"��s�Ǝҋ敪",fieldid:"custbody_proxy_operator_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:172,label:"EC�A�o�敪",fieldid:"custbody_ec_export_kbn",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:173,label:"������",fieldid:"custbody_transaction_status",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:174,label:"�̔��`��",fieldid:"custbody_sales_form",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SALES_FORM),conversionInfo:CONVERSION_INFO.SALES_FORM},
            {index:175,label:"������",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.MEMBERSHIP_TYPE),conversionInfo:CONVERSION_INFO.MEMBERSHIP_TYPE},
            {index:176,label:"�T�[�r�X�����N",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:177,label:"�Z�O�����g",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:178,label:"����`�[�E�l���R�[�h",fieldid:"custbody_format_cd",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.STYLE_CODE),conversionInfo:CONVERSION_INFO.STYLE_CODE},
            {index:179,label:"����`�[�E�����R�[�h",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:180,label:"����`�[�E�`�[�敪�^����敪",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:181,label:"����`�[�E�ГX�R�[�h�^�X��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:182,label:"����`�[�E�[�i�ꏊ��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:183,label:"����`�[�E���i�R�[�h�󎚈ʒu",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PRODUCT_CD_PRINTING_POSITION),conversionInfo:CONVERSION_INFO.PRODUCT_CD_PRINTING_POSITION},
            {index:184,label:"����`�[�E�������i��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:185,label:"����`�[�E�o�^��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:186,label:"����`�[�E�X�V��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:187,label:"���d���f�[�^�E���W���͌ڋq�ԍ�",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:188,label:"���d���f�[�^�E�o�͂܂Ƃߐ�ڋq�ԍ�",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:189,label:"���d���f�[�^�E�f�[�^�o�͐�p�X��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:190,label:"���d���f�[�^�E�t�@�C����",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:191,label:"���d���f�[�^�E�����敪",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PROCESSING_DIVISION),conversionInfo:CONVERSION_INFO.PROCESSING_DIVISION},
            {index:192,label:"���d���f�[�^�E���M���@",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.HOW_TO_SEND),conversionInfo:CONVERSION_INFO.HOW_TO_SEND},
            {index:193,label:"���d���f�[�^�E�o�^��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:194,label:"���d���f�[�^�E�X�V��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:195,label:"�U�֋敪",fieldid:"custrecord_2663_change_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TRANSFER_CLASS),conversionInfo:CONVERSION_INFO.TRANSFER_CLASS},
            {index:196,label:"������",fieldid:"custrecord_2663_debit_date",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.WITHDRAWAL_DATE),conversionInfo:CONVERSION_INFO.WITHDRAWAL_DATE},
            {index:197,label:"���U�\�E�s�\",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:198,label:"���U�w����",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:199,label:"��s�R�[�h",fieldid:"custrecord_2663_entity_bank_code",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:200,label:"��s�x�X�R�[�h",fieldid:"custrecord_2663_bank_branch_cd",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:201,label:"�a���敪",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.DEPOSIT_CLASS),conversionInfo:CONVERSION_INFO.DEPOSIT_CLASS},
            {index:202,label:"�����ԍ�",fieldid:"custrecord_2663_entity_acct_no",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:203,label:"�a�����`(���p��)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:204,label:"���U���l",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:205,label:"�l���`",fieldid:"custrecord_2663_personal_name",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.INDIVISUAL_NAME),conversionInfo:CONVERSION_INFO.INDIVISUAL_NAME},
            {index:206,label:"���U�o�^��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:207,label:"���U�X�V��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:208,label:"�����敪",fieldid:"custbody_clothing_date_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.CLOSING_DATE_CLASS),conversionInfo:CONVERSION_INFO.CLOSING_DATE_CLASS},
            {index:209,label:"��敪",fieldid:"custbody_association_kbn",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.ASSOCIATION_CLASS),conversionInfo:CONVERSION_INFO.ASSOCIATION_CLASS},
            {index:210,label:"�������@",fieldid:"custbody_deposit_method",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.PAYMENT_METHOD),conversionInfo:CONVERSION_INFO.PAYMENT_METHOD},
            {index:211,label:"�����\���",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:212,label:"���|�\�E��~",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:213,label:"�萔���敪",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.COMMISSION_CLASS),conversionInfo:CONVERSION_INFO.COMMISSION_CLASS},
            {index:214,label:"���|���l",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:215,label:"���|�w����",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:216,label:"���|�o�^��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:217,label:"���|�X�V��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:218,label:"�@�l�E�l���Ǝ�敪",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.BUSINESS_OWNER_CLASS),conversionInfo:CONVERSION_INFO.BUSINESS_OWNER_CLASS},
            {index:219,label:"�@�l��/�_��Җ�",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:220,label:"�@�l/�_��� �X�֔ԍ�",fieldid:"addressbook:zip",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:221,label:"�@�l/�_��� �s���{��",fieldid:"addressbook:state",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:222,label:"�@�l/�_��� �s�撬��",fieldid:"addressbook:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:223,label:"�@�l/�_��� ���於",fieldid:"addressbook:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:224,label:"�@�l/�_��� �Ԓn",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:225,label:"�@�l/�_��� ������",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:226,label:"�@�l/�_��� �d�b�ԍ�(�n�C�t���Ȃ�)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:227,label:"�@�l��\��/�X�ܖ��E����",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:228,label:"������ �X�֔ԍ�",fieldid:"addressbook:zip",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:229,label:"������ �s���{��",fieldid:"addressbook:state",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:230,label:"������ �s�撬��",fieldid:"addressbook:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:231,label:"������ ���於",fieldid:"addressbook:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:232,label:"������ �Ԓn",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:233,label:"������ ������",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:234,label:"���������t��d�b�ԍ�(�n�C�t���Ȃ�)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:235,label:"���������t�戶��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:236,label:"�ԍϕ��@",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.REPAYMENT_METHOD),conversionInfo:CONVERSION_INFO.REPAYMENT_METHOD},
            {index:237,label:"�X�}�v���\�E��~",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:238,label:"�X�}�v�����l",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:239,label:"�X�}�v���w����",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:240,label:"�X�}�v���o�^��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:241,label:"�X�}�v���X�V��",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            

        ];

        /**
         * �ڋq�A�g�̌ڋq�Z�����
         *  fieldid�ɂ���
         *   �E�����̃t�B�[���h���w�肷��ꍇ�̓J���}�ŋ�؂�
         *   �E�T�u���X�g(����)�̃t�B�[���h���w�肷��ꍇ�̓T�u���X�gID�ƃt�B�[���hID���R�����ŋ�؂�
         **/
        // TODO:fieldid��""�̉ӏ��͗v�m�F�A����̃J�X�^���́ucustbody�v�����őO�ɂ��Ă���i�C���̉\������j
        const CUSTOMER_ADDRESS_INFO = [
            {index:0,label:"�ڋq�ԍ�",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:1,label:"�ʔ�",fieldid:"addressbook:label",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"�X�֔ԍ�",fieldid:"addressbook:zip",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:3,label:"�Z���C�O�敪",fieldid:"addressbook:custbody_addr_over_kbn",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:4,label:"�s���{���R�[�h",fieldid:"addressbook:custbody_prefecture_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:5,label:"�s���{��",fieldid:"addressbook:state",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:6,label:"�s�撬��",fieldid:"addressbook:city",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:7,label:"���於",fieldid:"addressbook:addr1",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:8,label:"�Ԓn",fieldid:"addressbook:addr2",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:9,label:"������",fieldid:"addressbook:addr3",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:10,label:"�����敪",fieldid:"addressbook:custbody_island_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:11,label:"�u���b�N�R�[�h",fieldid:"addressbook:custbody_block_cd",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:12,label:"���͐於(����)",fieldid:"addressbook:addressee",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:13,label:"���͐於(�J�i)",fieldid:"",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:14,label:"�d�b�ԍ�",fieldid:"addressbook:addrphone",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:15,label:"FAX",fieldid:"addressbook:fax",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:16,label:"�^���փR�[�h",fieldid:"addressbook:custbody_ship_service_cd",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.TRANSPORT_CODE),conversionInfo:CONVERSION_INFO.TRANSPORT_CODE},
            {index:17,label:"���l",fieldid:"addressbook:custbody_remarks",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:18,label:"�A���敪",fieldid:"addressbook:custbody_contact_cd",isRequired:true,isInteger:false,isDate:false,list:null},
        ];

        /**
         * �ڋq�A�g�̌ڋq�S���ҏ��
         *  fieldid�ɂ���
         *   �E�����̃t�B�[���h���w�肷��ꍇ�̓J���}�ŋ�؂�
         *   �E�T�u���X�g(����)�̃t�B�[���h���w�肷��ꍇ�̓T�u���X�gID�ƃt�B�[���hID���R�����ŋ�؂�
         **/
        // TODO:fieldid��""�̉ӏ��͗v�m�F�A����̃J�X�^���́ucustbody�v�����őO�ɂ��Ă���i�C���̉\������j
        const CUSTOMER_MANAGER_INFO = [
            {index:0,label:"�ڋq�ԍ�",fieldid:"company",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:1,label:"�ʔ�",fieldid:"custbody_tsuban",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"����",fieldid:"title",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:3,label:"����(����)",fieldid:"lastname",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:4,label:"����(�J�i)",fieldid:"phoneticname",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:5,label:"����",fieldid:"custbody_gender",isRequired:true,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.GENDER),conversionInfo:CONVERSION_INFO.GENDER},
            {index:6,label:"���N����",fieldid:"custbody_birthday",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:7,label:"��ʐ^",fieldid:"custbody_portrait",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:8,label:"�d�b�ԍ�",fieldid:"phone",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:9,label:"���[���A�h���X",fieldid:"email",isRequired:false,isInteger:false,isDate:false,list:null},
            {index:10,label:"�����}�K��M�ݒ�",fieldid:"custbody_mail_setting",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:11,label:"�Ή�����i���C���j",fieldid:"custbody_main_lang_support",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPORTED_LANGUAGE),conversionInfo:CONVERSION_INFO.SUPPORTED_LANGUAGE},
            {index:12,label:"�Ή�����i�T�u�j",fieldid:"custbody_sub_lang_support",isRequired:false,isInteger:false,isDate:false,list:Object.keys(CONVERSION_INFO.SUPPORTED_LANGUAGE),conversionInfo:CONVERSION_INFO.SUPPORTED_LANGUAGE},
        ];

        /**
         * �ڋq�A�g�̌ڋqSNS���
         *  fieldid�ɂ���
         *   �E�����̃t�B�[���h���w�肷��ꍇ�̓J���}�ŋ�؂�
         *   �E�T�u���X�g(����)�̃t�B�[���h���w�肷��ꍇ�̓T�u���X�gID�ƃt�B�[���hID���R�����ŋ�؂�
         **/
        // TODO:fieldid��""�̉ӏ��͗v�m�F�A����̃J�X�^���́ucustbody�v�����őO�ɂ��Ă���i�C���̉\������j
        const CUSTOMER_SNS_INFO = [
            {index:0,label:"�ڋq�ԍ�",fieldid:null,isRequired:true,isInteger:false,isDate:false,list:null},
            {index:1,label:"�ʔ�",fieldid:"custbody_tsuban",isRequired:true,isInteger:false,isDate:false,list:null},
            {index:2,label:"URL",fieldid:"name",isRequired:true,isInteger:false,isDate:false,list:null},
        ];

        /** �w�b�_�[�C���f�b�N�X��� */
        const HEADER_INDEX = {
            /** �f�[�^�敪 */
            DATA_PARTITION: 2,
            /** ETONET�ԍ� */
            ETONET_NUMBER: 1,
            /** ���[�UID */
            USER_ID: 6,
            /** �����s�� */
            OPERATION_PROXY: 70,
            /** �󒍓� */
            TRANDATE: 0,
            /** EC�T�C�g�l���z */
            EC_SITE_DISCOUNT: 7,
            /** �������z */
            POSTAGE: 34,
            /** �����T�[�r�X�z */
            POSTAGE_SERVICE: 56,
            /** ����萔�� */
            COD_CHARGE: 57,
            /** ����萔���T�[�r�X�z */
            COD_CHARGE_SERVICE: 58,
            /** ���v */
            SUBTOTAL: 35,
            /** ���i�O�v */
            EXTARNAL_TOTAL: 59,
            /** ����Ŋz */
            TAX_AMOUNT: 36,
        }

        /** ���׃C���f�b�N�X��� */
        const DETAIL_INDEX = {
            /** �f�[�^�敪 */
            DATA_PARTITION: 2,
            /** �ޔ� */
            CATEGORY_NUMBER: 5,
            /** �i�� */
            PRODUCT_NUMBER: 6,
            /** �J���[ */
            COLOR: 7,
            /** �T�C�Y */
            SIZE: 8,
            /** �ޕi�ԓo�^�� */
            COMMODITY_ID_REGIST_DATE: 20,
            /** ���� */
            QUANTITY: 12,
            /** �ڋq�ʉ��i�敪 */
            CUSTOMER_PRICE_TYPE: 34,
            /** �ڋq�ʉ����i */
            CUSTOMER_WHOLESALE_PRICE: 36,
            /** �}�X�^�����i */
            MASTER_WHOLESALE_PRICE: 32,
            /** �����敪 */
            DISCOUNT_TYPE: 19,
            /** �̔������i */
            SALES_WHOLESALE_PRICE: 11,
            /** �K�p����ŃR�[�h */
            TAX_CD: 30,
        }

        /** ���[�����׃C���f�b�N�X��� */
        const MAIL_INDEX = {
            /** ���[���A�h���X */
            MAIL_ADDRESS: 4,
        }

        /** ����Ŗ��׃C���f�b�N�X��� */
        const TAX_INDEX = {
            /** �K�p����ŃR�[�h */
            APPLIED_TAX_CD: 4,
            /** ����őΏۊz */
            TAXABLE_AMOUNT: 6,
            /** ����Ŋz */
            TAX_AMOUNT: 7,
        }

        /** �\��E�o�וۗ��C���f�b�N�X��� */
        const RESERVE_INDEX = {
            /** �\��ԍ�1 */
            RESERVATION_NUMBER_1: 0,
            /** �\��ԍ�2 */
            RESERVATION_NUMBER_2: 1,
            /** �\��ԍ�3 */
            RESERVATION_NUMBER_3: 2,
            /** �\��ԍ��}�� */
            RESERVATION_SUB_NUMBER: 3,
            /** ���ݏ�� */
            CURRENT_STATUS: 18,
            /** ������ */
            PROVISIONED_QUANTITY: 14,
            /** �\�� */
            RESERVE_QUANTITY: 13,
            /** ����ԍ� */
            MEMBERSHIP_NUMBER: 6,
            /** �ޔ� */
            CATEGORY_NUMBER: 7,
            /** �i�� */
            PRODUCT_NUMBER: 8,
            /** �J���[ */
            COLOR: 9,
            /** �T�C�Y */
            SIZE: 10,
            /** ���i�o�^�� */
            PRODUCT_REGISTRATION_DATE: 11,
        }

        /** �ڋq���C���f�b�N�X��� */
        const CUSTOMER_INFO_INDEX = {
            /** �X�V�敪 */
            UPDATE_CATEGORY: 0,
            /** �ڋq�ԍ� */
            CUSTOMER_NUMBER: 1,
            /** �Ԓn�i���x���uDM�v�j */
            DM_STREET_ADDRESS: 100,
            /** �������i���x���uDM�v�j */
            DM_BUILDING_NAME: 101,
            /** �Ԓn�i���x���u�_��ҁv�j */
            CONTRACTOR_STREET_ADDRESS: 224,
            /** �������i���x���u�_��ҁv�j */
            CONTRACTOR_BUILDING_NAME: 225,
            /** �Ԓn�i���x���u���׏����t�v�j */
            SENDING_STATEMENT_STREET_ADDRESS: 10,
            /** �������i���x���u���׏����t�v�j */
            SENDING_STATEMENT_BUILDING_NAME: 101,
            /** ������������J�n�ʒu */
            START_HISTORYS: 51,
            /** ������������I���ʒu */
            END_HISTORYS: 88,
            /** ���x���uDM�v�Z���J�n�ʒu */
            START_DM_ADDRESS: 94,
            /** ���x���uDM�v�Z���I���ʒu */
            END_DM_ADDRESS: 108,
            /** �戵�����i�J�n�ʒu */
            START_PRODUCTS_HUNDLED: 139,
            /** �戵�����i�I���ʒu */
            END_PRODUCTS_HUNDLED: 148,
            /** �G�g���[���Ŏd���ꂽ�����i�J�n�ʒu */
            START_EK_WANT_PRODUCTS: 149,
            /** �G�g���[���Ŏd���ꂽ�����i�I���ʒu */
            END_EK_WANT_PRODUCTS: 158,
            /** ���x���u�_��ҁv�Z���J�n�ʒu */
            START_CONTRACTOR_ADDRESS: 220,
            /** ���x���u�_��ҁv�Z���I���ʒu */
            END_CONTRACTOR_ADDRESS: 227,
            /** ���x���u���׏����t�v�Z���J�n�ʒu */
            START_SENDING_STATEMENT_ADDRESS: 228,
            /** ���x���u���׏����t�v�Z���I���ʒu */
            END_SENDING_STATEMENT_ADDRESS: 235,
            /** ��s�ڍ׊J�n�ʒu */
            START_BANK_DETAIL: 195,
            /** ��s�ڍ׏I���ʒu */
            END_BANK_DETAIL: 205,
        }

        /** �ڋq�Z�����C���f�b�N�X��� */
        const CUSTOMER_ADDRESS_INFO_INDEX = {
            /** �ڋq�ԍ� */
            CUSTOMER_NUMBER: 0,
        }
        /** �ڋq�S���ҏ��C���f�b�N�X��� */
        const CUSTOMER_MANAGER_INFO_INDEX = {
            /** �ڋq�ԍ� */
            CUSTOMER_NUMBER: 0,
        }
        /** �ڋqSNS���C���f�b�N�X��� */
        const CUSTOMER_SNS_INFO_INDEX = {
            /** �ڋq�ԍ� */
            CUSTOMER_NUMBER: 0,
        }

        /** �t�B�[���h�K�w�Z�p���[�^������ */
        const FIELD_SEPARATOR = ",";

        /** �t�B�[���h�K�w�Z�p���[�^������ */
        const FIELD_LEVEL_SEPARATOR = ":";

        /**
         * �C���f�b�N�X����w�b�_���𒊏o����
         * @param {*} index
         * @returns
         */
        function findHeaderByIndex(index) {
            return HEADER_INFO.find(val => val.index == index);
        }
        
        /**
         * �C���f�b�N�X���疾�׏��𒊏o����
         * @param {*} index
         * @returns
         */
        function findDetailByIndex(index) {
            return DETAIL_INFO.find(val => val.index == index);
        }
        
        /**
         * �C���f�b�N�X���烁�[�����𒊏o����
         * @param {*} index
         * @returns
         */
        function findMailByIndex(index) {
            return MAIL_INFO.find(val => val.index == index);
        }
        
        /**
         * �C���f�b�N�X�������ŏ��𒊏o����
         * @param {*} index
         * @returns
         */
        function findTaxByIndex(index) {
            return TAX_INFO.find(val => val.index == index);
        }
        
        /**
         * �C���f�b�N�X����\��o�וۗ����𒊏o����
         * @param {*} index
         * @returns
         */
        function findReserveByIndex(index) {
            return RESERVE_INFO.find(val => val.index == index);
        }
        
        /**
         * �C���f�b�N�X����ڋq���𒊏o����
         * @param {*} index
         * @returns
         */
        function findCustomerByIndex(index) {
            return CUSTOMER_INFO.find(val => val.index == index);
        }
        
        /**
         * ���x��������w�b�_���𒊏o����
         * @param {*} label
         * @returns
         */
        function findHeaderByLabel(label) {
            return HEADER_INFO.find(val => val.label == label);
        }

        /**
         * ���x�������疾�׏��𒊏o����
         * @param {*} label
         * @returns
         */
        function findDetailByLabel(label) {
            return DETAIL_INFO.find(val => val.label == label);
        }

        /**
         * ���x�������烁�[���A�h���X���𒊏o����
         * @param {*} label
         * @returns
         */
        function findMailByLabel(label) {
            return MAIL_INFO.find(val => val.label == label);
        }

        /**
         * ���x�����������ŏ��𒊏o����
         * @param {*} label
         * @returns
         */
        function findTaxByLabel(label) {
            return TAX_INFO.find(val => val.label == label);
        }

        /**
         * ���̓`�F�b�N
         * @param {*} dataInfo �f�[�^���
         * @param {*} value �l
         * @returns �G���[�^�C�v
         */
        function validationCheck(dataInfo, value) {
            let errorDetail = {
                errorResult: "����",// �G���[��������
                errorContent: ""// �G���[����
            };
            // 2.�K�{�`�F�b�N
            if (dataInfo.isRequired) {
                if (value == "") {
                    errorDetail.errorResult = "�K�{�`�F�b�N�G���[";
                    errorDetail.errorContent = dataInfo.label;
                    return errorDetail;
                }
            }
            else if (value == "") {
                // �K�{���ڈȊO�Œl����̏ꍇ�̓`�F�b�N�����A���퉞��
                return errorDetail;
            }

            // 3.���X�g�l�`�F�b�N
            if (dataInfo.list != null && dataInfo.list.indexOf(value) < 0) {
                errorDetail.errorResult = "���X�g�l�`�F�b�N�G���[";
                errorDetail.errorContent = dataInfo.label;
                return errorDetail;
        }

            // 4.���l�`�F�b�N
            if (dataInfo.isInteger && isNaN(value)) {
                errorDetail.errorResult = "���l�`�F�b�N�G���[";
                errorDetail.errorContent = dataInfo.label;
                return errorDetail;
        }
            // 5.���t�`�F�b�N
            if (dataInfo.isDate && isNaN(new Date(value).getTime())) {
                errorDetail.errorResult = "���t�`�F�b�N�G���[";
                errorDetail.errorContent = dataInfo.label;
                return errorDetail;
        }

            return errorDetail;
        }

        return {
            FOLDER: FOLDER,
            HEADER_INFO: HEADER_INFO,
            DETAIL_INFO: DETAIL_INFO,
            MAIL_INFO: MAIL_INFO,
            TAX_INFO: TAX_INFO,
            RESERVE_INFO: RESERVE_INFO,
            CUSTOMER_INFO: CUSTOMER_INFO,
            CUSTOMER_ADDRESS_INFO: CUSTOMER_ADDRESS_INFO,
            CUSTOMER_MANAGER_INFO: CUSTOMER_MANAGER_INFO,
            CUSTOMER_SNS_INFO: CUSTOMER_SNS_INFO,
            HEADER_INDEX: HEADER_INDEX,
            DETAIL_INDEX: DETAIL_INDEX,
            MAIL_INDEX: MAIL_INDEX,
            TAX_INDEX: TAX_INDEX,
            RESERVE_INDEX: RESERVE_INDEX,
            CUSTOMER_INFO_INDEX: CUSTOMER_INFO_INDEX,
            CUSTOMER_ADDRESS_INFO_INDEX: CUSTOMER_ADDRESS_INFO_INDEX,
            CUSTOMER_MANAGER_INFO_INDEX: CUSTOMER_MANAGER_INFO_INDEX,
            CUSTOMER_SNS_INFO_INDEX: CUSTOMER_SNS_INFO_INDEX,
            FIELD_SEPARATOR: FIELD_SEPARATOR,
            FIELD_LEVEL_SEPARATOR: FIELD_LEVEL_SEPARATOR,
            CONVERSION_INFO: CONVERSION_INFO,
            validationCheck: validationCheck,
            findHeaderByIndex: findHeaderByIndex,
            findDetailByIndex: findDetailByIndex,
            findMailByIndex: findMailByIndex,
            findTaxByIndex: findTaxByIndex,
            findReserveByIndex: findReserveByIndex,
            findCustomerByIndex: findCustomerByIndex,
            findDetailByLabel: findDetailByLabel,
            findHeaderByLabel: findHeaderByLabel,
            findMailByLabel: findMailByLabel,
            findTaxByLabel: findTaxByLabel
        }

});