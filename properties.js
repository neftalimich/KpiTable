define([], function () {
    "use strict";
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
                            }
                        }
                    }
                }
            },
            settings: {
                uses: "settings",
                items: {
                    initFetchRows: {
                        ref: "qHyperCubeDef.qInitialDataFetch.0.qHeight",
                        label: "Initial fetch rows",
                        type: "number",
                        defaultValue: 50
                    },
                    General: {
                        type: "items",
                        label: "Configuration",
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
                            columnOrder: {
                                type: "string",
                                ref: "props.columnOrder",
                                label: "Ordenar Columnas",
                                defaultValue: "0,1,2"
                            },
                            url1: {
                                type: "string",
                                ref: "props.urlChart",
                                label: "URL Chart"
                            },
                            url2: {
                                type: "string",
                                ref: "props.urlIframe",
                                label: "URL iFrame"
                            }
                        }
                    }
                }
            }
        }
    };
});