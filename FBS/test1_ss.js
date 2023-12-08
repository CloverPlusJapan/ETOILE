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
    * 1-2. 仕訳帳ライン項目
    * @param {JSON*} params
    * @param {String} params.record [レコード]
    * @param {String} params.account [勘定科目]
    * @param {String} params.entity [名前]
    * @param {String} params.department [部門]
    * @param {Boolean} params.class [クラス]
    * @param {Boolean} params.location [場所]
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