define([], function () {
    "use strict";
    return {
        qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInitialDataFetch: [{
                qWidth: 10,
                qHeight: 50
            }]
        },
        cube2: {
            qHyperCubeDef: {
                qInitialDataFetch: [
                    {
                        qHeight: 1500,
                        qWidth: 3
                    }
                ],
                qDimensions: [],
                qMeasures: [],
                qSuppressZero: false,
                qSuppressMissing: false,
                qMode: "S",
                qColumnOrder: [],
                qInterColumnSortOrder: [],
                qStateName: "$"
            }
        }
    };
});