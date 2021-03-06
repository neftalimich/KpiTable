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
    $('<link rel="stylesheet" type="text/css" href="/extensions/KpiTable/css/font-awesome.css">').appendTo("head");
    var app = qlik.currApp();

    return {
        template: template,
        initialProperties: initProps,
        definition: props,
        support: {
            snapshot: function(layout) {
                return layout.props.snapshotEnabled;
            },
            export: true,
            exportData: true
        },
        paint: function () {
            //setup scope.table
            if (!this.$scope.table) {
                this.$scope.table = qlik.table(this);
            }
            return qlik.Promise.resolve();
        },
        controller: ['$scope', function ($scope) {
            $scope.kpiTableId = $scope.layout.qInfo.qId;

            // --------------------------- Watchers
            $scope.$watchCollection("layout.qHyperCube.qDataPages", function (newValue) {
                $scope.ReloadCube();
            });
            $scope.$watchCollection("layout.qHyperCube.qDimensionInfo", function (newValue) {
                $scope.GetColumnConfiguration();
            });
            $scope.$watchCollection("layout.qHyperCube.qMeasureInfo", function (newValue) {
                $scope.GetColumnConfiguration();
            });
            // ---------------------------
            $scope.$watchCollection("layout.props.categorize", function (newValue) {
                $scope.ReloadCube();
            });
            $scope.$watchCollection("layout.props.columnOrder", function (newValue) {
                $scope.PatchColumnOrder(newValue);
                $scope.GetColumnConfiguration();
            });
            // ---------------------------

            // --------------------------- Process Cube 1
            $scope.ReloadCube = function () {
                $scope.cubeGrouped = [];
                if ($scope.layout.qHyperCube.qDataPages[0].qMatrix[0].length > 2) {
                    if ($scope.layout.props.categorize) { // IsCategory
                        let qMatrixCopy = []; //JSON.parse(JSON.stringify($scope.layout.qHyperCube.qDataPages[0].qMatrix));

                        angular.forEach($scope.layout.qHyperCube.qDataPages, function (qDataPage, key) {
                            qMatrixCopy.push.apply(qMatrixCopy, JSON.parse(JSON.stringify(qDataPage.qMatrix)));
                        });

                        let categories = qMatrixCopy.reduce(function (obj, item, index) {
                            obj[item[1].qText] = obj[item[1].qText] || [];
                            obj[item[1].qText].push({ index: index, item: item });
                            return obj;
                        }, {});
                        $scope.cubeIsGrouped = true;

                        $scope.cubeGrouped = Object.keys(categories).map(function (key) {
                            return { category: key, data: categories[key], idxAux: [] };
                        });
                        // ---------------- Index
                        let idxAux = 0;
                        angular.forEach($scope.cubeGrouped, function (group, key) {
                            angular.forEach(group.data, function (value, key) {
                                group.idxAux.push(idxAux);
                                idxAux += 1;
                            });
                        });
                        // ---------------- Index END
                    } else {
                        $scope.cubeIsGrouped = false;
                        $scope.cubeGrouped.push({ category: "", data: [], idxAux: [] });
                        let qMatrixCopy = [];
                        angular.forEach($scope.layout.qHyperCube.qDataPages, function (qDataPage, key) {
                            qMatrixCopy.push.apply(qMatrixCopy, JSON.parse(JSON.stringify(qDataPage.qMatrix)));
                        });
                        for (let i = 0; i < qMatrixCopy.length; i++) {
                            $scope.cubeGrouped[0].data.push({ index: i, item: qMatrixCopy[i] });
                            $scope.cubeGrouped[0].idxAux.push(i);
                        }
                    }
                }
            };
            // ---------------------------
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
            // ---------------------------
            $scope.GetColumnConfiguration = function () {
                $scope.columnConfiguration = [];
                angular.forEach($scope.layout.qHyperCube.qColumnOrder, function (value, key) {
                    let indexAux = value;
                    if (indexAux < $scope.layout.qHyperCube.qDimensionInfo.length) {
                        $scope.columnConfiguration.push({
                            textClass: $scope.layout.qHyperCube.qDimensionInfo[indexAux].textClass,
                            isSubtitle: $scope.layout.qHyperCube.qDimensionInfo[indexAux].isSubtitle,
                            textAlign: $scope.layout.qHyperCube.qDimensionInfo[indexAux].textAlign,
                            type: $scope.layout.qHyperCube.qDimensionInfo[indexAux].type,
                            iconClass: $scope.layout.qHyperCube.qDimensionInfo[indexAux].iconClass,
                            showHelpIcon: $scope.layout.qHyperCube.qDimensionInfo[indexAux].showHelpIcon,
                            columnSize: $scope.layout.qHyperCube.qDimensionInfo[indexAux].columnSize,
                            textSize: $scope.layout.qHyperCube.qDimensionInfo[indexAux].textSize
                        });
                    } else {
                        indexAux = indexAux - $scope.layout.qHyperCube.qDimensionInfo.length;
                        $scope.columnConfiguration.push({
                            textClass: $scope.layout.qHyperCube.qMeasureInfo[indexAux].textClass,
                            isSubtitle: $scope.layout.qHyperCube.qMeasureInfo[indexAux].isSubtitle,
                            textAlign: $scope.layout.qHyperCube.qMeasureInfo[indexAux].textAlign,
                            type: $scope.layout.qHyperCube.qMeasureInfo[indexAux].type,
                            iconClass: $scope.layout.qHyperCube.qMeasureInfo[indexAux].iconClass,
                            showHelpIcon: $scope.layout.qHyperCube.qMeasureInfo[indexAux].showHelpIcon,
                            columnSize: $scope.layout.qHyperCube.qMeasureInfo[indexAux].columnSize,
                            textSize: $scope.layout.qHyperCube.qMeasureInfo[indexAux].textSize
                        });
                    }
                });
            };
            // ---------------------------

            // --------------------------- Extra
            $scope.GoUrl = function (id) {
                //alert(id);
                if (id.length > 0) {
                    app.field($scope.layout.props.chartfield).selectMatch(id, !1);
                    qlik.navigation.gotoSheet($scope.layout.props.selectedSheet);
                    //var win = window.open($scope.layout.props.urlChart + id, '_blank');
                    //win.focus();
                    //window.location.href = $scope.layout.props.urlChart + id;
                }
            };
            // --------------------------- iFrame
            $scope.sFrame = false;
            $scope.origin = document.location.origin;
            $scope.protocol = document.location.protocol;
            $scope.ShowFrame = function (id) {
                $scope.sFrame = true;

                //$scope.idk = $scope.origin + $scope.layout.props.urlIframe + id;

                app.field("KPI_ID").selectMatch(id, !1);

                app.visualization.get('DmEgZQe').then(function (vis) {
                    vis.show("QV01" + $scope.kpiTableId);
                });
                app.visualization.get('JPGG').then(function (vis) {
                    vis.show("QV02" + $scope.kpiTableId);
                });
                app.visualization.get('mwCjpFF').then(function (vis) {
                    vis.show("QV03" + $scope.kpiTableId);
                });
                app.visualization.get('Mjkjwcr').then(function (vis) {
                    vis.show("QV04" + $scope.kpiTableId);
                });
                app.visualization.get('SjjZWsE').then(function (vis) {
                    vis.show("QV05" + $scope.kpiTableId);
                });
                app.visualization.get('adaAmT').then(function (vis) {
                    vis.show("QV06" + $scope.kpiTableId);
                });
                app.visualization.get('USYtzd').then(function (vis) {
                    vis.show("QV07" + $scope.kpiTableId);
                });
                app.visualization.get('EbZfLZT').then(function (vis) {
                    vis.show("QV08" + $scope.kpiTableId);
                });
                app.visualization.get('DPGLNAd').then(function (vis) {
                    vis.show("QV09" + $scope.kpiTableId);
                });
                app.visualization.get('JTMxZMZ').then(function (vis) {
                    vis.show("QV11" + $scope.kpiTableId);
                });
                app.visualization.get('hKzwRPz').then(function (vis) {
                    vis.show("QV12" + $scope.kpiTableId);
                });
                app.visualization.get('wzqLmCR').then(function (vis) {
                    vis.show("QV13" + $scope.kpiTableId);
                });
                app.visualization.get('Pppvm').then(function (vis) {
                    vis.show("QV14" + $scope.kpiTableId);
                });
                app.visualization.get('CGzSJqk').then(function (vis) {
                    vis.show("QV15" + $scope.kpiTableId);
                });
                app.visualization.get('uEEjd').then(function (vis) {
                    vis.show("QV16" + $scope.kpiTableId);
                });
                app.visualization.get('JbEZRf').then(function (vis) {
                    vis.show("QV17" + $scope.kpiTableId);
                });
                app.visualization.get('BgLJ').then(function (vis) {
                    vis.show("QV18" + $scope.kpiTableId);
                });
                app.visualization.get('pzFnee').then(function (vis) {
                    vis.show("QV19" + $scope.kpiTableId);
                });
				app.visualization.get('rkQusU').then(function (vis) {
                    vis.show("QV20" + $scope.kpiTableId);
                });
            };
            // ---------------------------

            // --------------------------- More Data
            $scope.loading = false;
            $scope.GetMoreData = function (table) {
                if (table.rowCount > table.rows.length) {
                    $scope.loading = true;
                    table.getMoreData()
                        .then(val => {
                        })
                        .catch(err => {
                            $scope.table = null;
                        })
                        .finally(f => {
                            $scope.loading = false;
                            $scope.ReloadCube();
                            $scope.NextPageCube2();
                        });

                }
               
                return true;
            };
            $scope.RefreshHeader = function () {
                let clone_table = $("#clone");
                clone_table.remove();

                clone_table = $("#maintable").clone();
                clone_table.attr('id', 'clone');
                clone_table.css({
                    position: 'fixed',
                    'pointer-events': 'none',
                    top: $("#kpitable-container").offset().top
                });
                clone_table.width($("#maintable").width());
                $("#table-container").append(clone_table);
                $("#clone").css({ visibility: 'hidden' });
                $("#clone thead").css({ visibility: 'visible' });
            };
            // ---------------------------

            // --------------------------- CUBE2
            var qDimensionTemplate = {
                qDef: {
                    qGrouping: "N",
                    qFieldDefs: "CHANGE_ME",
                    qFieldLabels: [""],
                    autoSort: false,
                    qSortCriterias: [
                        {
                            qSortByAscii: 0,
                            qSortByNumeric: 1
                        }
                    ]
                },
                qNullSuppression: true
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
            // ---------------------------

            // --------------------------- Watchers
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
                    $scope.LoadCharts();
                });
            });
            $scope.$watchCollection("layout.cube2.qHyperCube.qDataPages", function (newVal) {
                angular.element(document).ready(function () {
                    $scope.qDataPagesCube2[0] = JSON.parse(JSON.stringify($scope.layout.cube2.qHyperCube.qDataPages[0]));
                    $scope.GroupDataChart();
                    $scope.LoadCharts();
                });
            });
            $scope.$watchCollection("layout.props.chartLineWidth", function (newVal) {
                angular.element(document).ready(function () {
                    $scope.LoadCharts();
                });
            });
            $scope.$watchCollection("layout.props.chartPointRadius", function (newVal) {
                angular.element(document).ready(function () {
                    $scope.LoadCharts();
                });
            });
            // ---------------------------

            // --------------------------- CHART
            angular.element(document).ready(function () {
                if ($scope.qDataPagesCube2.length == 0) {
                    $scope.qDataPagesCube2.push(JSON.parse(JSON.stringify($scope.layout.cube2.qHyperCube.qDataPages[0])));
                }
                $scope.GroupDataChart();
                $scope.LoadCharts();
            });
            // ---------------------------
            $scope.currentPage = 1;
            $scope.qDataPagesCube2 = [];
            $scope.NextPageCube2 = function () {
                let requestPage = [{
                    qTop: $scope.layout.cube2.qHyperCube.qDataPages[0].qArea.qHeight * $scope.currentPage,
                    qLeft: 0,
                    qWidth: $scope.layout.cube2.qHyperCube.qDataPages[0].qArea.qWidth,
                    qHeight: $scope.layout.cube2.qHyperCube.qDataPages[0].qArea.qHeight
                }];

                $scope.ext.model.getHyperCubeData('/cube2/qHyperCubeDef', requestPage).then(function (value) {
                    if ($scope.qDataPagesCube2.length == $scope.currentPage) {
                        $scope.qDataPagesCube2.push(value[0]);
                    } else {
                        $scope.qDataPagesCube2[$scope.currentPage] = value[0];
                    }
                    $scope.currentPage += 1;
                    $scope.GroupDataChart();
                    $scope.LoadCharts();
                });
            };
            // ---------------------------

            // --------------------------- Group Chart
            $scope.GroupDataChart = function () {
                if ($scope.layout.cube2.qHyperCube.qDimensionInfo.length > 0) {
                    if ($scope.qDataPagesCube2[0].qMatrix[0].length > 2) {
                        let qMatrixCopy = [];
                        angular.forEach($scope.qDataPagesCube2, function (qDataPage, key) {
                            qMatrixCopy.push.apply(qMatrixCopy, JSON.parse(JSON.stringify(qDataPage.qMatrix)));
                        });
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
                }
            };
            var charts = [];
            var canvas = [];
            // ---------------------------
            $scope.ClearCharts = function () {
                angular.forEach(charts, function (chart, key) {
                    let ctx = canvas[key][0].getContext('2d');
                    ctx.clearRect(0, 0, 0, 0);
                    chart.destroy();
                });
            };
            // ---------------------------
            $scope.LoadCharts = function () {
                $scope.ClearCharts();
                let dimLength = $scope.layout.cube2.qHyperCube.qDimensionInfo.length;
                let meaLength = $scope.layout.cube2.qHyperCube.qMeasureInfo.length;

                angular.forEach($scope.dataGrouped, function (value, key) {
                    let canva = $("#chart-" + value.name);
                    if (canva.length) {
                        let datasetAux = [];
                        let labelsAux = [];

                        datasetAux.push({
                            data: [],
                            pointBackgroundColor: [],
                            pointBorderColor: [],
                            borderWidth: $scope.layout.props.chartLineWidth,
                            label: value.name,
                            borderColor: $scope.layout.props.chartLineColor ? $scope.layout.props.chartLineColor : "#3e95cd",
                            fill: false
                        });

                        for (let i = 0; i < value.data.length; i++) {
                            datasetAux[0].data.push(parseFloat(value.data[i][dimLength].qText));
                            if (meaLength > 1) {
                                datasetAux[0].pointBackgroundColor.push(value.data[i][dimLength + 1].qText);
                                if (meaLength > 2) {
                                    datasetAux[0].pointBorderColor.push(value.data[i][dimLength + 2].qText);
                                }
                            }
                            labelsAux.push(value.data[i][1].qText);
                        }

                        let myLineChart = new Chart(canva, {
                            type: 'line',
                            data: {
                                labels: labelsAux,
                                datasets: datasetAux
                            },
                            options: {
                                legend: { display: false },
                                title: { display: false },
                                elements: {
                                    point: {
                                        radius: $scope.layout.props.chartPointRadius,
                                        hoverRadius: $scope.layout.props.chartPointHoverRadius
                                    }
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
                                        left: $scope.layout.props.chartPointHoverRadius + 3,
                                        right: $scope.layout.props.chartPointHoverRadius + 3,
                                        top: $scope.layout.props.chartPointHoverRadius,
                                        bottom: $scope.layout.props.chartPointHoverRadius
                                    }
                                },
                                responsive: true,
                                maintainAspectRatio: false,
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
                        canvas[key] = canvas[key] || [];
                        canvas[key] = canva;
                    }
                });
                $scope.RefreshHeader();
            };
            // ---------------------------
        }]
    };
});