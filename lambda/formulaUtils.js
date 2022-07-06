const gstPercent = 5;
const defaultDecimalPlaces = 1;

function isValidNumber(n) {
  if (!n) {
    if (n === 0) {
      return true;
    }
    return false;
  }
  return true;
}

function arraySum(arr) {
  let sum = 0;
  let nullArray = true;
  for (let num of arr) {
    if (isValidNumber(num) && typeof num === "number") {
      sum += num;
      nullArray = false;
    }
  }
  if (nullArray) {
    return undefined;
  }
  return sum;
}

function inversePercentage(value, percentage) {
  const result = (value * 100) / (100 + percentage)
  return result;
}

function formatMoney(amt) {
  if (isValidNumber(amt)) {
    return amt;
  }
  return "";
}

function formatDecimal(value, dPlaces) {
  if (!dPlaces) {
    dPlaces = defaultDecimalPlaces;
  }
  if (isValidNumber(value)) {
    value = Number(value.toFixed(dPlaces));
    return value;
  }
  return "";
}

exports.basicNetRevenue = function (revenues, customPercent) {
  let result = null;
  let percent = customPercent ? customPercent : gstPercent;
  const gross = arraySum(revenues);
  const net = inversePercentage(gross, percent);
  if (isValidNumber(gross)) {
    result = formatMoney(net);
  }
  let res = {
    result: result,
    formula: `Net revenue = Gross revenue - ${percent}% GST`,
  };
  return res;
};

function totalWithModifier(arr, mod) {
  let result = arraySum(arr);
  if (mod || mod === 0) {
    result *= mod;
  }
  return result;
}

function formatTotalWithModifier(arr, mod) {
  let result = undefined;
  let total = totalWithModifier(arr, mod);
  if (isValidNumber(total)) {
    result = formatDecimal(total);
  }
  return result;
}

exports.frontcountryCampingPartyAttendance = function (attendances, modifier) {
  let formula = `Total attendance = (Standard + Senior + SSFE + Long stay)`;
  if (modifier) {
    formula += ` x ${modifier}`;
  }
  return {
    result: formatTotalWithModifier(attendances, modifier),
    formula: formula,
  };
};

exports.frontcountryCampingSecondCarAttendance = function (attendances) {
  return {
    result: formatTotalWithModifier(attendances),
    formula: `Total attendance = (Standard + Senior + SSFE)`,
  };
};

exports.frontcountryCabinsPartiesAttendance = function (attendances, modifier) {
  let formula = `Total attendance = Parties`;
  if (modifier) {
    formula += ` x ${modifier}`;
  }
  return {
    result: formatTotalWithModifier(attendances, modifier),
    formula: formula
  };
};

exports.groupCampingStandardAttendance = function (attendances) {
  return {
    result: formatTotalWithModifier(attendances),
    formula: `Total people = (Adult + Youth + Children)`,
  };
};

exports.dayUseVehicleAttendance = function (
  trailCount,
  vehicles,
  buses,
  vehicleMod,
  busMod
) {
  let trailCountTotal = totalWithModifier(trailCount);
  let vehicleTotal = totalWithModifier(vehicles, vehicleMod);
  let busTotal = totalWithModifier(buses, busMod);
  let vehicleFormula = "Vehicles";
  let busFormula = "Bus count";
  if (vehicleMod) {
    vehicleFormula = `(Vehicles x ${vehicleMod})`;
  }
  if (busMod) {
    busFormula = `(Bus count x ${busMod})`;
  }
  return {
    result: formatTotalWithModifier([vehicleTotal, busTotal, trailCountTotal]),
    formula: `Vehicle attendance = ${vehicleFormula} + ${busFormula} + Trail count`,
  };
};

exports.backcountryCabinsAttendance = function (
  individuals,
  families,
  familyMod
) {
  let individualTotal = totalWithModifier(individuals);
  let familyTotal = totalWithModifier(families, familyMod);
  let familyFormula = "Family";
  if (familyMod) {
    familyFormula = `(Family x ${familyMod})`;
  }
  return {
    result: formatTotalWithModifier([individualTotal, familyTotal]),
    formula: `Total people = Adults + Children + ${familyFormula}`,
  };
};

exports.boatingAttendance = function (attendances, modifier) {
  let formula = `Boat attendance = (On dock + On buoys + Miscellaneous boats)`;
  if (modifier) {
    formula += ` x ${modifier}`;
  }
  return {
    result: formatTotalWithModifier(attendances, modifier),
    formula: formula,
  };
};
