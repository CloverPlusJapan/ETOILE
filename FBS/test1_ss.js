/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *@CreatedBy Hikari Tanaka
 *@CreatedDate 2023/05/25
 */
define([
    'N/search',
    'N/record',
], function (
    search,
    record,
) {
    /**
    * 1-2. �d�󒠃��C������
    * @param {JSON*} params
    * @param {String} params.record [���R�[�h]
    * @param {String} params.account [����Ȗ�]
    * @param {String} params.entity [���O]
    * @param {String} params.department [����]
    * @param {Boolean} params.class [�N���X]
    * @param {Boolean} params.location [�ꏊ]
    * @return {String}
    */

    function execute(context) {
        
        const inboundShip = record.load({
            type: record.Type.INBOUND_SHIPMENT,
            id: 9,
            isDynamic: true
        });

        log.debug('inboundShip',inboundShip)

        inboundShip.setValue({ fieldId: 'shipmentstatus', value: 'inTransit' });

        inboundShip.save();

    }

    return {
        execute: execute
    }
});