/**
 *   �v�Z���쐬
 *  Author: �v����
 *  Date : 2023/11/27
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/email', 'N/log', 'N/render', 'N/runtime', 'N/format', 'N/record', 'N/file'],
    function (search, email, log, render, runtime, format, record, file) {

        const TEMPLATE_ID = 118;	//������PDF�e���v���[�g�i�A�h�o���X�gPDF�e���v���[�gID�j
        const TEMPLATE_ID_CM = 119;	//Protea �N���W�b�g�����i�A�h�o���X�gPDF�e���v���[�gID�j
        const STATEMENT_ID = 256;	//������ꗗ�\	�i�J�X�^���t�H�[���j
        function getInputData() {
            //�ۑ�����
            let statementSearch = runtime.getCurrentScript().getParameter({
                name: 'custscript_statement_search'
            });

            let customerSearchObj = search.load({
                id: statementSearch
            });
            return customerSearchObj;
        }

        function map(context) {
            try {
                let mapData = JSON.parse(context.value);
                let mapDataValues = mapData.values;
                let mapEntityId = mapData.id

                //�J�n��
                let startDate = runtime.getCurrentScript().getParameter({
                    name: 'custscript_start_date'
                });
                //�v�Z�����t
                let statementDate = runtime.getCurrentScript().getParameter({
                    name: 'custscript_statement_date'
                });
                //�t�H���_
                let statementFolder = runtime.getCurrentScript().getParameter({
                    name: 'custscript_statement_folder'
                });

                //�g�����U�N�V�����c���`�F�b�N
                let balSearch = search.load({
                    id: 'customsearch_balance_search'	///�ڋq�c������ Script
                });

                let filtersBal = balSearch.filters; //reference Search.filters object to a new variable

                filtersBal.push(search.createFilter({ //create new filter
                    name: 'entity',
                    operator: search.Operator.ANYOF,
                    values: mapEntityId	//�ڋq: map_entityId
                }));

                filtersBal.push(search.createFilter({ //create new filter
                    name: 'trandate',
                    operator: search.Operator.ONORBEFORE,
                    values: statementDate	//���t: �I�����ȑO
                }));

                let srchRes1 = getItems(balSearch); //run search


                //�g�����U�N�V�������Ȃ��ꍇ�� return
                if (srchRes1.length == 0) return;

                //�c�����擾
                let value = srchRes1[0].getValue({name: 'amount', summary: search.Summary.SUM}); 	//���z

                //�c����0�̏ꍇ
                if (value == 0) {
                    //�����g�����U�N�V��������
                    let tranSearchObj = search.load({
                        id: 'customsearch_balance_search'	//�ڋq�c������ Script
                    });

                    let filtersTran = tranSearchObj.filters;

                    filtersTran.push(search.createFilter({ //create new filter
                        name: 'entity',
                        operator: search.Operator.ANYOF,
                        values: mapEntityId	//�ڋq: map_entityId
                    }));

                    filtersTran.push(search.createFilter({ //create new filter
                        name: 'trandate',
                        operator: search.Operator.WITHIN,
                        values: [startDate, statementDate]	//���t: �J�n��~�I���� start_date / statement_date
                    }));

                    let srchRes2 = getItems(tranSearchObj); //run search

                    //�����̃g�����U�N�V�������Ȃ��ꍇ�� return
                    if (srchRes2.length == 0) return;
                }

                // 2023.05.30 F.Saito add start ***
                // �ڋqID �擾
                let customId = mapDataValues.entityid;
                let dateString = statementDate;
                let dateParts = dateString.split('/');
                let year = dateParts[0];
                let month = dateParts[1];
                let day = dateParts[2];
                let statementDateFormat = String(year) + String(month) + String(day);

                //�t�H���_�����[���F�@20230220_0031958S
                let csv_save_file_id = createFolder(statementFolder, statementDateFormat, customId);
                log.debug({title: 'map', details: 'csv_save_file_id = ' + csv_save_file_id});
                // 2023.05.30 F.Saito add end   ***

                //�v�Z���̍쐬
                let transactionFile = render.statement({
                    entityId: parseInt(mapEntityId),
                    formId: STATEMENT_ID, //�������ꗗ�\
                    printMode: render.PrintMode.PDF,
                    startDate: startDate,
                    statementDate: statementDate,
                    openTransactionsOnly: false,
                    consolidateStatements: false,
                    inCustLocale: true,
                    subsidiaryId: 6
                });
                if (transactionFile) {
                    try {
                        transactionFile.folder = csv_save_file_id;
                        transactionFile.name = statementDateFormat + "_" + mapDataValues.altname +"_"+ "�l_�v�Z��" + ".pdf";
                        let fileID = transactionFile.save();
                    } catch (e) {
                        log.audit({title: 'A problem occurred whilst creating File', details: e.message})
                    }
                }

                 //�������쐬
                //���������o
                let invSearch = search.load({
                    id: 'customsearch_invoice_print'	//����Ώې��������� Script
                });

                let filtersInv = invSearch.filters; //reference Search.filters object to a new variable
                filtersInv.push(search.createFilter({ //create new filter
                    name: 'entity',
                    operator: search.Operator.ANYOF,
                    values: mapEntityId	//�ڋq: map_entityId
                }));
                filtersInv.push(search.createFilter({ //create new filter
                    name: 'trandate',
                    operator: search.Operator.WITHIN,
                    values: [startDate, statementDate]	//���t: �J�n��~�I���� start_date / statement_date
                }));
                let srchRes = getItems(invSearch); //run search

                //�g�����U�N�V�������Ȃ��ꍇ�� return
                if (srchRes.length == 0) return;

                //�������Ń��[�v
                let xml = '';
                for (let count = 0; count < srchRes.length; count++) {
                    let renderer = render.create();
                    let invoiceId = srchRes[count].getValue('internalid');
                    if (srchRes[count].recordType == 'creditmemo') {	//�N���W�b�g�����̏ꍇ
                        renderer.setTemplateById(TEMPLATE_ID_CM);
                        renderer.addRecord('record', record.load({type: record.Type.CREDIT_MEMO, id: invoiceId}));
                    } else {	//�������̏ꍇ
                        renderer.setTemplateById(TEMPLATE_ID);
                        renderer.addRecord('record', record.load({type: record.Type.INVOICE, id: invoiceId}));
                    }
                    if (count == 0) {	//1���ڂ̏ꍇ
                        xml += renderer.renderAsString();
                    } else {	//2���ڈȍ~�̐������̏ꍇ
                        //�O��xml�̍ŏI�s�폜
                        let xmlLines = xml.split('\n');
                        xmlLines.pop();

                        xml = xmlLines.join('\n');
                        //�擪����Q�s�폜
                        let inputString = renderer.renderAsString();

                        let StringLines = inputString.split('\n');
                        StringLines.shift();
                        StringLines.shift();

                        xml += StringLines.join('\n');
                    }
                }

                let filePDF = render.xmlToPdf({
                    xmlString: xml
                });

                //let filePDF = renderer.renderAsPdf();
                let base64 = filePDF.getContents();

                //�t�@�C�����@20230220_0031958S �����܃V�[�}�b�N�X�l_������
                let fileName = statementDateFormat + "_" + mapDataValues.altname + "�l_������" + ".pdf";

                try {
                    let fileObj = file.create({
                        name: fileName,
                        folder: csv_save_file_id,
                        fileType: file.Type.PDF,
                        contents: base64,
                    })
                    fileObj.save();
                } catch (e) {
                    log.audit("error", e.message);
                }
            } catch (e) {
                log.audit({title: 'A problem occurred whilst ', details: e.message})
                log.audit({title: 'e.stack', details: e.stack})
            }

        }

        /**
         * ���́FcreateFolder
         * �p�����[�^�F
         *   oyafolderId�F�e�t�H���_ID
         *   statementDate�F�v�Z�����t
         *   customId�F�ڋqID
         *  �����F
         *    �e�t�H���_�����ɁA�ڋqID + �v�Z�����t�̃t�H���_���쐬����
         */
        function createFolder(oyafolderId, statementDate, customId) {
            // �ڋqID + �v�Z�����t(�p�����[�^�Fcustscript_statement_date)
            let nameId = statementDate + "_" + isUndefined(customId);
            //�t�H���_���݃`�F�b�N
            let folderSearch = search.create({
                type: search.Type.FOLDER,
                filters: [
                    ['name', 'is', nameId],
                    'AND',
                    ['parent', 'anyof', oyafolderId],	//�e�t�H���_
                ]
            });

            let searchResult = folderSearch.run().getRange({
                start: 0,
                end: 1
            });

            //�����t�H���_�����݂���ꍇ�A
            if (searchResult.length > 0) {
                let folderId = searchResult[0].id;
                return folderId;
            } else {

                let folder = record.create({
                    type: record.Type.FOLDER
                });
                folder.setValue({
                    fieldId: 'parent',
                    value: oyafolderId
                });
                folder.setValue({
                    fieldId: 'name',
                    value: nameId
                });
                return folder.save();
            }
        }

        function getItems(objSearch) {
            let record = objSearch.run();
            let searchResults = [];
            if (record != null) {
                let resultIndex = 0;
                let resultStep = 1000;
                do {
                    var searchlinesResults = record.getRange({
                        start: resultIndex,
                        end: resultIndex + resultStep
                    });
                    if (searchlinesResults.length > 0) {
                        searchResults = searchResults.concat(searchlinesResults);
                        resultIndex = resultIndex + resultStep;
                    }
                } while (searchlinesResults.length > 0);
            }
            return searchResults;
        }

        function isUndefined(str){
            if (str) {
                return str
            }
            return "";
        }

        return {
            getInputData: getInputData,
            map: map
        };
    });
