export function getDefaultPassword(fullName, nik) {
  if (!fullName || !nik) return "";

  const namePart = fullName.split(" ")[0].substring(0, 3).toUpperCase(); // 3 huruf pertama, uppercase
  const nikPart = nik.slice(-3); // ambil 3 digit terakhir
  return `${namePart}_${nikPart}`; // format: ASE_971
}
