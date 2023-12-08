/**
 * Ê©üË?Ω: CM_ÈÖçÈ?ÅË?™Âãï‰ΩúÊ??
 * Author: CPC_ÂÆ?
 * Date:2023/11/06
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['/SuiteScripts/LIBRARY/common_lib.js', 'N/file', 'N/record', 'N/search', 'N/format', "N/runtime", 'N/render'],
    /**
     * @param {runtime}
     *            runtime
     * @param {search}
     *            search
     * @param {format}
     *            format
     */
    (common_lib, file, record, search, format, runtime, render) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */
        const getInputData = (inputContext) => {
            // Ê≥®Êñ?Êõ∏ÊÉ?Â†±ÂèñÂæ?
            let infoDic = {};
            let soSearch = "item";
            let soFilters = [];
            let soIdArr = new Array();
            // Êù°‰ª∂
            soFilters.push(["type", 'anyof', "SalesOrd"]);
            soFilters.push(["AND"]);
            soFilters.push(["trackingnumber", "isnotempty", ""]);
            soFilters.push(["AND"]);
            soFilters.push(["mainline", "is", "T"]);
            let soSearchObj = [search.createColumn({
                name: "internalid",
                label: "ÂÜ?ÈÉ®ID"
            })];
            let soSearchResults = common_lib.getSearchData(soSearch, soFilters, searchColumns);
            if (soSearchResults && soSearchResults.length > 0) {
                soSearchResults.run().each(function (result) {
                    mapJson.push({
                        //Ê≥®Êñ?Êõ∏ÂÜ?ÈÉ®ID
                        'soId': result.getValue({name: 'internalid'})
                    });
                });
            } else {
                return [];
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reducereduceContext) => {

            // ÂÄ§
            let contextJson = JSON.parse(context.value);

            // Ê≥®Êñ?Êõ∏ÂÜ?ÈÉ®ID
            let soId = contextJson['soId'];

            // ÈÖçÈ?Å‰ΩúÊ??
            if (!isEmpty(soId)) {
                let itemFul = record.transform({
                    fromType: record.Type.SalesOrd,
                    fromId: soId,
                    toType: record.Type.itemfulfillment,
                    isDynamic: true,
                });
            }
        }

        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summarysummaryContext) => {
            // „Éë„É©„É°„Éº„ÇøÂèñÂæ?
            let script = runtime.getCurrentScript();

            // CSV‰ΩúÊ?êÂ??ÈÉ®ID Ê≠£Â∏∏Á≥ª
            let saveFileId = script.getParameter({name: "custscript_save_update_fileid"});

            // CSV‰ΩúÊ?êÂ??ÈÉ®ID Áï∞Â∏∏Á≥ª
            let errorFileId = script.getParameter({name: "custscript_error_update_fileid"});

            // „Çπ„ÇØ„É™„Éó„ÉàID
            let script_id = script.id;

            // Âèó‰ø°ËÄ?
            let param_email_author = script.getParameter({name: "email_author_bl"});
            let param_email_recipients = script.getParameter({name: "email_recipients"});

            let inputSummary = summaryContext.inputSummary;
            let mapSummary = summaryContext.mapSummary;
            let reduceSummary = summaryContext.reduceSummary;


            let errorObj = common_lib.summarizeError(saveFileId, errorFileId, inputSummary, mapSummary, reduceSummary, summaryContext);
            if (!common_lib.isEmpty(errorObj)) {
                throw errorObj;
            }
        }

        return {
            getInputData: getInputData,
            reduce: reduce,
            summarize: summarize
        }
    }
);