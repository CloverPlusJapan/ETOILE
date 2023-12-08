/**
 *  �@�\: �d���`�[�s����
 *  Author: �v����
 *  Date : 2023/10/26
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'],

     (record) => {
          /**
            * Defines the function definition that is executed before record is submitted.
            * @param {Object} scriptContext
            * @param {Record} scriptContext.newRecord - New record
            * @param {Record} scriptContext.oldRecord - Old record
            * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
            * @since 2015.2
            */
          const beforeSubmit = (scriptContext) => {
                let newRec = scriptContext.newRecord;
                let recordType = scriptContext.newRecord.type;
                let type = scriptContext.type;
                //�������ȊO�̏ꍇ�̓`�F�b�N�s�v
                if (recordType != record.Type.PURCHASE_ORDER) return;
                // �����̏ꍇ�̓`�F�b�N�s�v
                if (newRec.getValue({fieldId: "createdfrom"})) return;
                if (type == 'create') {
                     let count = newRec.getLineCount({sublistId: "item"});
                     for (let line = 0; line < count; line++) {
                          let itemType = newRec.getSublistValue({sublistId: "item", fieldId: "itemtype", line: line});
                          let location = newRec.getSublistValue({sublistId: "item", fieldId: "location", line: line});
                          //�݌ɃA�C�e���̏ꍇ�͑q�ɂ���͂���Ă��Ȃ��ꍇ�̓G���[�ɂ���
                          if (itemType == "InvtPart" && !location) {
                                throw "�݌ɕi�̏ꍇ�́A���ɂ���q�ɂ�I�����Ă�������";
                          }
                     }
                }
          }

          /**
            * Defines the function definition that is executed after record is submitted.
            * @param {Object} scriptContext
            * @param {Record} scriptContext.newRecord - New record
            * @param {Record} scriptContext.oldRecord - Old record
            * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
            * @since 2015.2
            */
          const afterSubmit = (scriptContext) => {
                let recordType = scriptContext.newRecord.type;
                let recordId = scriptContext.newRecord.id;
                let type = scriptContext.type;
                try {
                     // �������쐬�ACSV�C���|�[�g�A�����̎�
                     if (type == 'create' || type == 'dropship') {
                          let newRec = record.load({type: recordType, id: recordId, isDynamic: true});
                          let count = newRec.getLineCount({sublistId: "item"});
                          // ���׍s��5�s�ȉ��̏ꍇ�͏����I��
                          if (count <= 5) return;
                          let num = count % 5 !== 0 ? Math.floor(count / 5) : count / 5;
                          let line = 1;
                          // ���׍s��5�s�������ꍇ�́A�V�����������ɕ�����
                          for (let lineCount = 0; lineCount < num; lineCount++) {
                                let copyRec = record.copy({type: recordType, id: recordId, isDynamic: true});
                                let count = copyRec.getLineCount({sublistId: "item"});
                                for (let currentLine = count - 1; currentLine >= 0; currentLine--) {
                                     let lineStart = line * 5;
                                     let lineEnd = line * 5 + 4;
                                     if (lineStart > currentLine || lineEnd < currentLine) {
                                          copyRec.removeLine({sublistId: "item", line: currentLine});
                                     }
                                }
                                line++;
                                copyRec.save();
                          }
                          // ���̔������ɖ��׍s��5�s�܂ŕۗ�����
                          for (let soLine = count - 1; soLine >= 0; soLine--) {
                                if (soLine > 4) {
                                     newRec.removeLine({sublistId: "item", line: soLine})
                                }
                          }
                          newRec.save();
                     }
                } catch (e) {
                     log.audit("error", e);
                }
          }
          return {
                beforeSubmit:beforeSubmit,
                afterSubmit:afterSubmit
          }

     });
