export const useExportToCSV = (data, filename = "data.csv") => {
  const csvContent = [
    Object.keys(data[0]).join(","), // header row
    ...data.map((row) => Object.values(row).join(",")), // data rows
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};
