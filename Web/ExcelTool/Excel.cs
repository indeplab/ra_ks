using System.Data;
using System.IO;
using ClosedXML.Excel;
using DA;

namespace ExcelTool
{
    public class Excel
    {
        public static DataTable GetDataTableFromStream(Stream stream){
            DataTable result = new DataTable();

            using(var workbook = new XLWorkbook(stream)){
                
                if (workbook.Worksheets.Count == 0)
                    return result;

                var worksheet = workbook.Worksheet(1);
                // Get the dimensions of the worksheet
                var range = worksheet.RangeUsed();
                int rowCount = range.RowCount();
                int colCount = range.ColumnCount();

                // Заголовок
                for (int j = 1; j <= colCount; j++)
                    result.Columns.Add(worksheet.Cell(1, j).Value.ToString(), typeof(string));

                // Read data from the worksheet
                for (int row = 2; row <= rowCount; row++)
                {
                    var newRow = result.NewRow();
                    for (int col = 1; col <= colCount; col++)
                        newRow[col-1] = worksheet.Cell(row, col).Value;
                    result.Rows.Add(newRow);
                }                
            }
            return result;
        }
        public static MemoryStream GetStreamFromDataTable(DataTable data)
        {
            MemoryStream stream = new MemoryStream();
            using (XLWorkbook wb = new XLWorkbook())
            {
                var workSheet = wb.Worksheets.Add(string.IsNullOrEmpty(data.TableName)?"Лист1":data.TableName);
                for(int col=0; col<data.Columns.Count;col++){
                    var cellAdress = GetExcelPos(0, col);
                    workSheet.Cell(cellAdress).Value = data.Columns[col].ColumnName;
                }

                for (int row = 0; row < data.Rows.Count; row++)
                {
                    for (int col = 0; col < data.Columns.Count; col++){
                        var cellAdress = GetExcelPos(row, col);
                        workSheet.Cell(cellAdress).Value = ValueManager.GetString(data.Rows[row][col]);
                    }
                }
                wb.SaveAs(stream);
                stream.Position = 0;
            }

            return stream;
        }
        private static string GetExcelPos(int row, int cell)
        {
            char[] alph = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToCharArray();

            int count = cell / 26;
            string alphResult = string.Empty;

            if (count > 0)
            {
                alphResult = alph[count - 1] + alph[cell % 26].ToString();
            }
            else
            {
                alphResult = alph[cell].ToString();
            }

            return alphResult + (row + 1);
        }
    }
}