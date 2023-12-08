define(['N/record', 'N/error'], function (record, error) {
  function checkPurchaseOrderLineCount() {
    var currentRecord = record.currentRecord; // 現在のPurchase Orderレコードを取�?
    var lineCount = currentRecord.getLineCount({ sublistId: 'item' }); // アイ�?�?ラインの数を取�?

    if (lineCount > 5) {
      throw error.create({
        name: 'ITEM_LINE_COUNT_EXCEEDED',
        message: 'Purchase Orderのアイ�?�?ライン数は5行を�?えることはできません�?',
        notifyOff: true // 通知を抑制し�?�エラーのみを表示
      });
    }
  }

  // Purchase Order保存前のトリガーを設�?
  function beforeSubmit(context) {
    if (context.newRecord.type === record.Type.PURCHASE_ORDER) {
      checkPurchaseOrderLineCount();
    }
  }

  return {
    beforeSubmit: beforeSubmit
  };
});
