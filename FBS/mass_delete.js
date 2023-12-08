/**
 * Mass delete script
 * WARNING: Deletes every record
 * @NApiVersion 2.0
 * @NScriptType MassUpdateScript
 */
define(['N/record'],
  function(record) {

    function each(params) {
      try {
        record.delete({
          type: params.type,
          id: params.id
        });
      }
      catch(e) {
        log.error({
          title: e.title,
          details: e.messages
        });
      }
    }

    return {
      each: each
    };
  });
