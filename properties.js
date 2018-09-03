define([
    "qlik",
    'ng!$q'
], function (qlik, $q) {
    "use strict";

    var app = qlik.currApp();
    var getSheetList = function () {
        var defer = $q.defer();
        app.getAppObjectList(function (data) {
            var sheets = [];
            var sortedData = _.sortBy(data.qAppObjectList.qItems, function (item) {
                return item.qData.rank;
            });
            _.each(sortedData, function (item) {
                sheets.push({
                    value: item.qInfo.qId,
                    label: item.qMeta.title
                });
            });
            return defer.resolve(sheets);
        });

        return defer.promise;
    };

    return {
        type: "items",
        component: "accordion",
        items: {
            dimensions: {
                uses: "dimensions",
                min: 3,
                items: {
                    textAlign: {
                        type: "string",
                        component: "dropdown",
                        label: "Text Align",
                        ref: "qDef.textAlign",
                        options: [
                            {
                                value: "text-left",
                                label: "Izquierda"
                            },
                            {
                                value: "text-center",
                                label: "Centro"
                            }, {
                                value: "text-right",
                                label: "Derecha"
                            }
                        ],
                        defaultValue: "text-left"
                    },
                    textClass: {
                        type: "string",
                        label: "Text Class",
                        ref: "qDef.textClass",
                        defaultValue: ""
                    },
                    subtitle: {
                        type: "boolean",
                        ref: "qDef.isSubtitle",
                        label: "Subtitle",
                        defaultValue: false
                    },
                    icon: {
                        type: "boolean",
                        ref: "qDef.showHelpIcon",
                        label: "Show Help Icon",
                        defaultValue: false
                    },
                    columnSize: {
                        type: "string",
                        ref: "qDef.columnSize",
                        label: "Column Size (px & %)",
                        defaultValue: ""
                    }
                }
            },
            measures: {
                uses: "measures",
                min: 1,
                items: {
                    textAlign: {
                        type: "string",
                        component: "dropdown",
                        label: "Alinear",
                        ref: "qDef.textAlign",
                        options: [
                            {
                                value: "text-left",
                                label: "Izquierda"
                            },
                            {
                                value: "text-center",
                                label: "Centro"
                            }, {
                                value: "text-right",
                                label: "Derecha"
                            }
                        ],
                        defaultValue: "text-left"
                    },
                    textClass: {
                        type: "string",
                        label: "Text Class",
                        ref: "qDef.textClass",
                        defaultValue: ""
                    },
                    subtitle: {
                        type: "boolean",
                        ref: "qDef.isSubtitle",
                        label: "Subtitle",
                        defaultValue: false
                    },
                    isIconClass: {
                        type: "boolean",
                        ref: "qDef.isIconClass",
                        label: "Transform value to Icon",
                        defaultValue: false
                    },
                    arrow: {
                        type: "boolean",
                        ref: "qDef.isArrow",
                        label: "Flecha",
                        defaultValue: false
                    },
                    iconClass: {
                        type: "string",
                        ref: "qDef.iconClass",
                        label: "Add Icon (class name)",
                        defaultValue: ""
                    },
                    columnSize: {
                        type: "number",
                        ref: "qDef.columnSize",
                        label: "Column Size",
                        defaultValue: 0
                    }
                }
            },
            sorting: {
                uses: "sorting"
            },
            cube2props: {
                label: "Cubo 2",
                type: "items",
                items: {
                    Dimensions: {
                        type: "array",
                        ref: "cube2Dimensions",
                        label: "List of Dimensions",
                        itemTitleRef: "label",
                        allowAdd: true,
                        allowRemove: true,
                        addTranslation: "Add Dimension",
                        items: {
                            label: {
                                type: "string",
                                ref: "label",
                                label: "Label",
                                expression: "optional"
                            },
                            dimension: {
                                type: "string",
                                ref: "dimension",
                                label: "Dimension Expression",
                                expression: "always",
                                expressionType: "dimension"
                            }
                        }
                    },
                    Measures: {
                        type: "array",
                        ref: "cube2Measures",
                        label: "List of Measures",
                        itemTitleRef: "label",
                        allowAdd: true,
                        allowRemove: true,
                        addTranslation: "Add Measure",
                        items: {
                            label: {
                                type: "string",
                                ref: "label",
                                label: "Label",
                                expression: "optional"
                            },
                            measure: {
                                type: "string",
                                ref: "measure",
                                label: "Measure Expression",
                                expression: "always",
                                expressionType: "measure"
                            },
                            qType: {
                                type: "string",
                                ref: "qType",
                                label: "qType",
                                defaultValue: "F"
                            },
                            qFmt: {
                                type: "string",
                                ref: "qFmt",
                                label: "qFmt",
                                defaultValue: "#,##0.00"
                            },
                            qnDec: {
                                type: "integer",
                                ref: "qnDec",
                                label: "qnDec",
                                defaultValue: 2
                            }
                        }
                    }
                }
            },
            settings: {
                uses: "settings",
                items: {
                    initFetch: {
                        type: "items",
                        label: "Intial Fetch",
                        items: {
                            initFetchRows: {
                                ref: "qHyperCubeDef.qInitialDataFetch.0.qHeight",
                                label: "Cube 1 - Initial fetch rows",
                                type: "number",
                                defaultValue: 50
                            },
                            initFetchCols: {
                                ref: "qHyperCubeDef.qInitialDataFetch.0.qWidth",
                                label: "Cube 1 - Initial fetch cols",
                                type: "number",
                                defaultValue: 15
                            },
                            initFetchRows2: {
                                ref: "cube2.qHyperCubeDef.qInitialDataFetch.0.qHeight",
                                label: "Cube 2 -Initial fetch rows",
                                type: "number",
                                defaultValue: 2000
                            },
                            initFetchCols2: {
                                ref: "cube2.qHyperCubeDef.qInitialDataFetch.0.qWidth",
                                label: "Cube 2 - Initial fetch cols",
                                type: "number",
                                defaultValue: 5
                            }
                        }
                    },
                    General: {
                        type: "items",
                        label: "Table Configuration",
                        items: {
                            categorize: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.categorize",
                                label: "Categorize",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: true
                            },
                            showGroupIndex: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.showGroupIndex",
                                label: "Show Group Index",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: true
                            },
                            columnOrder: {
                                type: "string",
                                ref: "props.columnOrder",
                                label: "Column Order",
                                defaultValue: "0,1,2"
                            },
                            url2: {
                                type: "string",
                                ref: "props.urlIframe",
                                label: "URL iFrame",
                                expression: "optional"
                            },
                            selectedSheet: {
                                type: "string",
                                component: "dropdown",
                                label: "Select Sheet",
                                ref: "props.selectedSheet",
                                options: function () {
                                    return getSheetList().then(function (items) {
                                        return items;
                                    });
                                }
                            },
                            chartfield: {
                                type: "string",
                                ref: "props.chartfield",
                                label: "Chart Field",
                                expression: "optional"
                            },
                            tableHeaderSize: {
                                type: "string",
                                ref: "props.headerSize",
                                label: "Header size",
                                defaultValue: "1vw"
                            },
                            tableTextSize: {
                                type: "string",
                                ref: "props.textSize",
                                label: "Text size",
                                defaultValue: "1vw"
                            }
                        }
                    },
                    Chart: {
                        type: "items",
                        label: "Chart Configuration",
                        items: {
                            showChart: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.showChart",
                                label: "Show Chart",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: true
                            },
                            chartHeight: {
                                type: "number",
                                ref: "props.chartHeight",
                                label: "Chart Height",
                                defaultValue: 40
                            },
                            chartWidth: {
                                type: "number",
                                ref: "props.chartWidth",
                                label: "Chart Width",
                                defaultValue: 150
                            },
                            chartLineColor: {
                                type: "string",
                                ref: "props.chartLineColor",
                                label: "Chart Line Color",
                                defaultValue: "#3e95cd"
                            },
                            chartLineWidth: {
                                type: "number",
                                ref: "props.chartLineWidth",
                                label: "Chart Line Border Width",
                                defaultValue: 1
                            },
                            chartPointRadius: {
                                type: "number",
                                ref: "props.chartPointRadius",
                                label: "Chart Point Radius",
                                defaultValue: 2
                            },
                            chartPointHoverRadius: {
                                type: "number",
                                ref: "props.chartPointHoverRadius",
                                label: "Chart Point Hover Radius",
                                defaultValue: 2
                            }
                        }
                    }
                }
            }
        }
    };
});