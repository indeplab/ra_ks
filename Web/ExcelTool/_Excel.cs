using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using Aspose.Cells;

namespace ExcelTool
{
    public class _Excel
    {
        public List<List<string>> Rows = new List<List<string>>();

        public static DataTable GetDataTableFromStream(Stream stream){
            DataTable result = new DataTable();

            var workbook = new Workbook(stream);
            if (workbook.Worksheets.Count == 0)
                return result;

            var worksheet = workbook.Worksheets[0];
            int rows = worksheet.Cells.MaxDataRow;
            int cols = worksheet.Cells.MaxDataColumn;

            if (rows == 0)
                return result;

            // Заголовок
            for (int j = 0; j < cols; j++)
                result.Columns.Add(worksheet.Cells[0, j].Value.ToString(), typeof(string));

            // Данные
            for (int i = 1; i < rows; i++)
            {
                var row = result.NewRow();
                for (int j = 0; j < cols; j++)
                    row[j] = worksheet.Cells[i, j].Value.ToString();
                result.Rows.Add(row);
            }
            return result;
        }
        public void Open(Stream stream)
        {
            var workbook = new Workbook(stream);
            if (workbook.Worksheets.Count == 0)
                throw new ApplicationException("Файл Excel не содержит ни одного листа");

            var worksheet = workbook.Worksheets[1];
            int rows = worksheet.Cells.MaxDataRow;
            int cols = worksheet.Cells.MaxDataColumn;

            for (int i = 0; i < rows; i++)
            {
                Rows.Add(new List<string>());
                for (int j = 0; j < cols; j++)
                    Rows[Rows.Count - 1].Add(worksheet.Cells[i, j].Value.ToString());
            }

        }
        public void FromDataTable(DataTable data)
        {
            if (data != null)
            {
                string[] r = new string[data.Columns.Count];
                for (int i = 0; i < r.Length; i++)
                    r[i] = data.Columns[i].ColumnName;
                AddRow(r);
                foreach (DataRow row in data.Rows)
                {
                    r = new string[data.Columns.Count];
                    for (int i = 0; i < r.Length; i++)
                        r[i] = row[i].ToString();
                    AddRow(r);
                }
            }
        }

		public DataTable ToDataTable()
        {
            if (Rows.Count == 0)
                return null;

            DataTable result = new DataTable();

            // Заголовок
            foreach (string value in Rows[0])
                result.Columns.Add(value, typeof(string));

            // Данные
            for (int rowIndex = 1; rowIndex < Rows.Count; rowIndex++)
            {
                var currRow = Rows[rowIndex];
                DataRow newRow = result.NewRow();

                for (int columnIndex = 0; columnIndex < currRow.Count; columnIndex++)
                {
                    newRow[columnIndex] = currRow[columnIndex];
                }

                result.Rows.Add(newRow);
            }

            return result;
        }

        public void FileSave(string path, string sheetName = "Лист1")
        {
            CreateDirIfNotExist(path, true);

            using (Workbook wb = new Workbook())
            {
                FillWorkbook(wb, sheetName);
                if (File.Exists(path))
                    File.Delete(path);
                wb.Save(path);
            }
        }
        public static FileStream GetStreamFromDataTable(DataTable data)
        {
            FileStream stream = new FileStream("output.xlsx", FileMode.CreateNew);
            {
                using (Workbook wb = new Workbook())
                {
                    var workSheet = wb.Worksheets.Add(data.TableName);
                    for(int col=0; col<data.Columns.Count;col++)
                        workSheet.Cells[0, col].Value = data.Columns[col].ColumnName;

                    for (int row = 0; row < data.Rows.Count; row++)
                    {
                        for (int col = 0; col < data.Columns.Count; col++)
                            workSheet.Cells[row, col].Value = data.Rows[row][col];
                    }
                    wb.Save(stream, SaveFormat.Xlsx);
                    stream.Position = 0;
                }
            }
            return stream;
        }
        private void FillWorkbook(Workbook wb, string sheetName = "Sample Sheet")
        {
            var workSheet = wb.Worksheets.Add(sheetName);

            for (int row = 0; row < Rows.Count; row++)
            {
                for (int col = 0; col < Rows[row].Count; col++)
                {
                    if (Rows[row][col].StartsWith("="))
                    {
                        workSheet.Cells[row, col].Formula = Rows[row][col];
                    }
                    else
                    {
                        workSheet.Cells[row, col].Value = Rows[row][col];
                    }
                }
            }
        }
        public void AddRow(params string[] cells)
        {
            Rows.Add(cells.ToList());
        }

        public static string GetExcelPos(int row, int cell)
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

        private void CreateDirIfNotExist(string dirPath, bool removeFilename = false)
        {
            if (removeFilename)
            {
                dirPath = Directory.GetParent(dirPath).FullName;
            }

            if (!Directory.Exists(dirPath))
            {
                Directory.CreateDirectory(dirPath);
            }
        }
    }
}