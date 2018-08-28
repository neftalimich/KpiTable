define([], function () {
    "use strict";
    return {
        qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInitialDataFetch: [{
                qWidth: 15,
                qHeight: 20
            }]
        },
        cube2: {
            qHyperCubeDef: {
                qInitialDataFetch: [
                    {
                        qHeight: 2000,
                        qWidth: 5
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