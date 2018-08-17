define([
    "qlik",
    "jquery",
    "./initial-properties",
    "./properties",
    "text!./style.css",
    "text!./template.html",
    "./js/Chart"
], function (qlik, $, initProps, props, cssContent, template, chart) {
    'use strict';
    $("<style>").html(cssContent).appendTo("head");
    $('<link rel="stylesheet" type="text/css" href="/extensions/KpiTable/css/font-awesome.css">').html("").appendTo("head");

    return {
        template: template,
        initialProperties: initProps,
        definition: props,
        support: {
            snapshot: true,
            export: true,
            exportData: true
        },
        paint: function () {
            //setup scope.table
            //console.log("this", this);
            if (!this.$scope.table) {
                this.$scope.table = qlik.table(this);
                console.log("table", this.$scope.table);
            }
            return qlik.Promise.resolve();
        },
        controller: ['$scope', function ($scope) {
            console.log("layout", $scope.layout);

            $scope.$watchCollection("layout.qHyperCube.qDataPages", function (newValue) {
                $scope.ReloadCube();
            });

            $scope.$watchCollection("layout.qHyperCube.qDimensionInfo", function (newValue) {
                $scope.GetColumnConfiguration();
            });
            $scope.$watchCollection("layout.qHyperCube.qMeasureInfo", function (newValue) {
                $scope.GetColumnConfiguration();
            });

            $scope.$watchCollection("layout.props.categorize", function (newValue) {
                $scope.ReloadCube();
            });

            $scope.$watchCollection("layout.props.columnOrder", function (newValue) {
                $scope.PatchColumnOrder(newValue);
                $scope.GetColumnConfiguration();
            });

            $scope.ReloadCube = function () {
                //console.log("qMatrix", $scope.layout.qHyperCube.qDataPages[0].qMatrix);
                $scope.cubeGrouped = [];
                if ($scope.layout.qHyperCube.qDataPages[0].qMatrix[0].length > 2) {
                    if ($scope.layout.props.categorize) { // IsCategory
                        let qMatrixCopy = JSON.parse(JSON.stringify($scope.layout.qHyperCube.qDataPages[0].qMatrix));
                        let categories = qMatrixCopy.reduce(function (obj, item, index) {
                            obj[item[1].qText] = obj[item[1].qText] || [];
                            obj[item[1].qText].push(index);
                            return obj;
                        }, {});
                        //console.log("categories", categories);
                        $scope.cubeIsGrouped = true;
                        $scope.cubeGrouped = Object.keys(categories).map(function (key) {
                            return { category: key, data: categories[key] };
                        });
                    } else {
                        $scope.cubeIsGrouped = false;
                        $scope.cubeGrouped.push({ category: "", data: [] });
                        for (let i = 0; i < $scope.layout.qHyperCube.qDataPages[0].qMatrix.length; i++) {
                            $scope.cubeGrouped[0].data.push(i);
                        }
                    }
                    //console.log("cubeGrouped",$scope.cubeGrouped); //OSUSER()
                }
            };

            $scope.PatchColumnOrder = function (columnOrder) {
                let qColumnOrder = [];
                let orderAux = columnOrder.split(",");

                orderAux.forEach(function (currentValue, index, arr) {
                    let indexAux = parseInt(currentValue);
                    qColumnOrder.push(indexAux);
                });

                $scope.backendApi.applyPatches([
                    {
                        "qPath": "/qHyperCubeDef/qColumnOrder",
                        "qOp": "replace",
                        "qValue": JSON.stringify(qColumnOrder)
                    }
                ], false);
            };

            $scope.GetColumnConfiguration = function () {
                $scope.columnConfiguration = [];
                angular.forEach($scope.layout.qHyperCube.qColumnOrder, function (value, key) {
                    let indexAux = value;
                    if (indexAux < $scope.layout.qHyperCube.qDimensionInfo.length) {
                        $scope.columnConfiguration.push({
                            textClass: $scope.layout.qHyperCube.qDimensionInfo[indexAux].textClass,
                            isSubtitle: $scope.layout.qHyperCube.qDimensionInfo[indexAux].isSubtitle,
                            textAlign: $scope.layout.qHyperCube.qDimensionInfo[indexAux].textAlign,
                            isIconClass: $scope.layout.qHyperCube.qDimensionInfo[indexAux].isIconClass,
                            iconClass: $scope.layout.qHyperCube.qDimensionInfo[indexAux].iconClass,
                            showHelpIcon: $scope.layout.qHyperCube.qDimensionInfo[indexAux].showHelpIcon,
                            isArrow: $scope.layout.qHyperCube.qDimensionInfo[indexAux].isArrow
                        });
                    } else {
                        indexAux = indexAux - $scope.layout.qHyperCube.qDimensionInfo.length;
                        $scope.columnConfiguration.push({
                            textClass: $scope.layout.qHyperCube.qMeasureInfo[indexAux].textClass,
                            isSubtitle: $scope.layout.qHyperCube.qMeasureInfo[indexAux].isSubtitle,
                            textAlign: $scope.layout.qHyperCube.qMeasureInfo[indexAux].textAlign,
                            isIconClass: $scope.layout.qHyperCube.qMeasureInfo[indexAux].isIconClass,
                            iconClass: $scope.layout.qHyperCube.qMeasureInfo[indexAux].iconClass,
                            showHelpIcon: $scope.layout.qHyperCube.qMeasureInfo[indexAux].showHelpIcon,
                            isArrow: $scope.layout.qHyperCube.qMeasureInfo[indexAux].isArrow
                        });
                    }
                });
                //console.log("columnConfiguration", $scope.columnConfiguration);
            };

            $scope.GoUrl = function (id) {
                if (id.length > 0) {
                    //var win = window.open($scope.layout.props.urlChart + id, '_blank');
                    //win.focus();
                    window.location.href = $scope.layout.props.urlChart + id;
                }
            };

            $scope.sFrame = false;
            $scope.ShowFrame = function (id) {
                //console.log("id: ",  $scope.layout.props.urlIframe, id);
                $scope.sFrame = true;
                $scope.idk = $scope.layout.props.urlIframe + id;
            };


            // --------------------------- CUBE2
            var qDimensionTemplate = {
                qDef: {
                    qGrouping: "N",
                    qFieldDefs: "CHANGE_ME",
                    qFieldLabels: [""],
                    autoSort: false,
                    qSortCriterias: [
                        {
                            qSortByAscii: 0
                        }
                    ]
                },
                qNullSuppression: false
            };
            var qMeasureTemplate = {
                qDef: {
                    qLabel: "",
                    qDescription: "",
                    qTags: [""],
                    qGrouping: "N",
                    qDef: "CHANGE_ME",
                    qNumFormat: {
                        qDec: ".",
                        qFmt: "#,##0.00",
                        qThou: ",",
                        qType: "F",
                        qUseThou: 0,
                        qnDec: 2
                    },
                    autoSort: false
                },
                qSortBy: {
                    qSortByState: 0,
                    qSortByFrequency: 0,
                    qSortByNumeric: 0,
                    qSortByAscii: 0,
                    qSortByLoadOrder: 0,
                    qSortByExpression: 0,
                    qExpression: {
                        qv: ""
                    }
                }
            };

            $scope.$watchCollection("layout.cube2Dimensions", function (newVal) {
                let qDimensions = [];
                angular.forEach(newVal, function (value, key) {
                    if (value.dimension != "") {
                        let qDimAux = JSON.parse(JSON.stringify(qDimensionTemplate));
                        qDimAux.qDef.qLabel = [value.label];
                        qDimAux.qDef.qFieldDefs = [value.dimension];
                        qDimensions.push(qDimAux);
                    }
                });

                $scope.backendApi.applyPatches([
                    {
                        "qPath": "/cube2/qHyperCubeDef/qDimensions",
                        "qOp": "replace",
                        "qValue": JSON.stringify(qDimensions)
                    }
                ], false);
            });
            $scope.$watchCollection("layout.cube2Measures", function (newVal) {
                let qMeasures = [];
                angular.forEach(newVal, function (value, key) {
                    if (value.measure != "") {
                        let qMeasAux = JSON.parse(JSON.stringify(qMeasureTemplate));
                        qMeasAux.qDef.qLabel = value.label;
                        qMeasAux.qDef.qDef = value.measure;
                        qMeasAux.qDef.qNumFormat.qType = value.qType ? value.qType : "F";
                        qMeasAux.qDef.qNumFormat.qFmt = value.qFmt ? value.qFmt : "#,##0.00";
                        qMeasAux.qDef.qNumFormat.qnDec = value.qnDec ? value.qnDec : 2;
                        qMeasures.push(qMeasAux);
                    }
                });

                $scope.backendApi.applyPatches([
                    {
                        "qPath": "/cube2/qHyperCubeDef/qMeasures",
                        "qOp": "replace",
                        "qValue": JSON.stringify(qMeasures)
                    }
                ], false);
            });
            $scope.$watchCollection("layout.qHyperCube.qDataPages", function (newVal) {
                angular.element(document).ready(function () {
                    $scope.GroupDataChart();
                    $scope.LoadCharts();
                });
            });
            $scope.$watchCollection("layout.cube2.qHyperCube.qDataPages", function (newVal) {
                angular.element(document).ready(function () {
                    $scope.GroupDataChart();
                    $scope.LoadCharts();
                });
            });
            // --------------------------- CHART
            angular.element(document).ready(function () {
                $scope.GroupDataChart();
                $scope.LoadCharts();
            });

            $scope.GroupDataChart = function () {
                if ($scope.layout.cube2.qHyperCube.qDimensionInfo.length > 0) {
                    var qMatrixCopy = JSON.parse(JSON.stringify($scope.layout.cube2.qHyperCube.qDataPages[0].qMatrix));
                    if (qMatrixCopy[0].length > 2) {
                        var groups = qMatrixCopy.reduce(function (obj, item) {
                            obj[item[0].qText] = obj[item[0].qText] || [];
                            obj[item[0].qText].push(item);
                            return obj;
                        }, {});
                        $scope.dataGrouped = Object.keys(groups).map(function (key) {
                            return { name: key, data: groups[key] };
                        });

                        angular.forEach($scope.dataGrouped, function (value, key) {
                            value.data.sort(function compare(a, b) {
                                if (a[1].qNum < b[1].qNum)
                                    return -1;
                                if (a[1].qNum > b[1].qNum)
                                    return 1;
                                return 0;
                            });
                        });
                    }
                    //console.log($scope.dataGrouped);
                }
            };
            var charts = [];
            $scope.LoadCharts = function () {
                //console.log("charts",charts);
                //console.log("dataGrouped", $scope.dataGrouped);
                angular.forEach($scope.dataGrouped, function (value, key) {
                    let ctx = $("#chart-" + value.name);
                    if (ctx.length) {
                        //console.log("ctx", ctx);
                        let dataAux = [];
                        let labelsAux = [];

                        if (charts[key] != undefined || charts[key] != null) {
                            //console.log("Exist-charts[key]", charts[key]);
                            dataAux = charts[key].config.data.datasets[0].data;
                            labelsAux = charts[key].config.data.labels;
                            charts[key].destroy();
                            chart[key] = {};
                        } else {
                            for (let i = 0; i < value.data.length; i++) {
                                dataAux.push(parseFloat(value.data[i][2].qText));
                                labelsAux.push(value.data[i][1].qText);
                            }
                        }

                        let myLineChart = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: labelsAux,
                                datasets: [{
                                    data: dataAux,
                                    label: value.name,
                                    borderColor: "#3e95cd",
                                    fill: false
                                }]
                            },
                            options: {
                                legend: { display: false },
                                title: { display: false },
                                borderWidth: 1,
                                elements: {
                                    point: { radius: 3 },
                                    pointHoverRadius: { radius: 4 }
                                },
                                scales: {
                                    xAxes: [{
                                        display: false
                                    }],
                                    yAxes: [{
                                        display: false
                                    }]
                                },
                                layout: {
                                    padding: {
                                        left: 5,
                                        right: 5,
                                        top: 0,
                                        bottom: 0
                                    }
                                },
                                responsive: false,
                                tooltips: {
                                    enabled: false,
                                    displayColors: false,
                                    bodyFontSize: 16
                                },
                                animation: {
                                    duration: 0
                                }
                            }
                        });
                        charts[key] = charts[key] || [];
                        charts[key] = myLineChart;
                        //console.log("New-charts[key]", charts[key]);
                    }
                });
            };
            // ---------------------------
        }]
    };
});