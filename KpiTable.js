define([
    "qlik",
    "jquery",
    "./initial-properties",
    "./properties",
    "text!./style.css",
    "text!./template.html"
], function (qlik, $, initProps, props, cssContent, template) {
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

            $scope.$watchCollection("layout.props.categorize", function (newValue) {
                $scope.ReloadCube();
            });

            $scope.$watchCollection("layout.props.columnOrder", function (newValue) {
                $scope.PatchColumnOrder(newValue);
            });

            $scope.ReloadCube = function () {
                //console.log("qMatrix", $scope.layout.qHyperCube.qDataPages[0].qMatrix);
                $scope.cubeGrouped = [];
                if ($scope.layout.qHyperCube.qDataPages[0].qMatrix[0].length > 2) {
                    if ($scope.layout.props.categorize) { // IsCategory
                        let qMatrixCopy = JSON.parse(JSON.stringify($scope.layout.qHyperCube.qDataPages[0].qMatrix));
                        let categories = qMatrixCopy.reduce(function (obj, item,index) {
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

            $scope.IsSubtitle = function (index) {
                let indexAux = $scope.layout.qHyperCube.qColumnOrder[index];
                if (indexAux < $scope.layout.qHyperCube.qDimensionInfo.length) {
                    return $scope.layout.qHyperCube.qDimensionInfo[indexAux].isSubtitle;
                } else {
                    return $scope.layout.qHyperCube.qMeasureInfo[indexAux - $scope.layout.qHyperCube.qDimensionInfo.length].isSubtitle;
                }
            };
            $scope.AlignClass = function (index) {
                let indexAux = $scope.layout.qHyperCube.qColumnOrder[index];
                if (indexAux < $scope.layout.qHyperCube.qDimensionInfo.length) {
                    return $scope.layout.qHyperCube.qDimensionInfo[indexAux].textAlign;
                } else {
                    return $scope.layout.qHyperCube.qMeasureInfo[indexAux - $scope.layout.qHyperCube.qDimensionInfo.length].textAlign;
                }
            };
            $scope.IsIconClass = function (index) {
                let indexAux = $scope.layout.qHyperCube.qColumnOrder[index];
                if (indexAux < $scope.layout.qHyperCube.qDimensionInfo.length) {
                    return $scope.layout.qHyperCube.qDimensionInfo[indexAux].isIconClass;
                } else {
                    return $scope.layout.qHyperCube.qMeasureInfo[indexAux - $scope.layout.qHyperCube.qDimensionInfo.length].isIconClass;
                }
            };
            $scope.IconClass = function (index) {
                let indexAux = $scope.layout.qHyperCube.qColumnOrder[index];
                if (indexAux < $scope.layout.qHyperCube.qDimensionInfo.length) {
                    return "";
                } else {
                    return $scope.layout.qHyperCube.qMeasureInfo[indexAux - $scope.layout.qHyperCube.qDimensionInfo.length].iconClass;
                }
            };
            $scope.ShowHelp = function (index) {
                let indexAux = $scope.layout.qHyperCube.qColumnOrder[index];
                if (indexAux < $scope.layout.qHyperCube.qDimensionInfo.length) {
                    return $scope.layout.qHyperCube.qDimensionInfo[indexAux].haveIcon;
                } else {
                    return false;
                }
            };
            $scope.ShowArrow = function (index) {
                let indexAux = $scope.layout.qHyperCube.qColumnOrder[index];
                if (indexAux >= $scope.layout.qHyperCube.qDimensionInfo.length) {
                    return $scope.layout.qHyperCube.qMeasureInfo[indexAux - $scope.layout.qHyperCube.qDimensionInfo.length].isArrow;
                } else {
                    return false;
                }
            };
        }]
    };
});