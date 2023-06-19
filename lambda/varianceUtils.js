const { logger } = require("./logger");

function calculateVariance(
  firstYearValue = null,
  secondYearValue = null,
  thirdYearValue = null,
  currentValue,
  variancePercentage
) {
  logger.info("=== Calculating variance ===");
  // We might receive two past years instead of three
  let numberOfYearsProvided = 0;
  numberOfYearsProvided += firstYearValue ? 1 : 0;
  numberOfYearsProvided += secondYearValue ? 1 : 0;
  numberOfYearsProvided += thirdYearValue ? 1 : 0;
  logger.debug("Number of years provided:", numberOfYearsProvided);

  // Get the average value across provided years
  const averageHistoricValue =
    ((firstYearValue ? firstYearValue : 0) +
      (secondYearValue ? secondYearValue : 0) +
      (thirdYearValue ? thirdYearValue : 0)) /
    numberOfYearsProvided;
  logger.debug("Average historic value:", averageHistoricValue);

  // Percentage change formula: (b-a)/b
  const percentageChange =
    (currentValue - averageHistoricValue) / averageHistoricValue;
  const percentageChangeAbs = Math.abs(percentageChange);
  logger.debug("Percentage change:", percentageChange);

  let varianceMessage = `Variance triggered: ${
    percentageChangeAbs >= 0 ? "+" : "-"
  }${String(percentageChangeAbs * 100)}%`;

  // Since percentage change is absolute, we can subtract from variance percentage
  // If negative, variance is triggered
  let varianceTriggered =
    variancePercentage - percentageChangeAbs < 0 ? true : false;
  logger.debug("Variance triggered?", varianceTriggered);

  const res = {
    varianceMessage: varianceMessage,
    varianceTriggered: varianceTriggered,
    percentageChange: percentageChange,
  };
  logger.info("Variance return obj:", res);
  logger.info("=== Variance calulation complete ===");
  return res;
}

module.exports = {
  calculateVariance,
};
