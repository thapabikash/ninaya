function getCurrentDate(val) {
  // val is date with timestamp
  const date = val || new Date();
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const fecha = y + "-" + m + "-" + d;
  return fecha;
}

module.exports = getCurrentDate;
