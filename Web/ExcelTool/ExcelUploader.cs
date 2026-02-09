using System.Text;
using System.Data;
using DA;


namespace ExcelTool
{
    /// <summary>
    /// Summary description for ReportXLS.
    /// </summary>
    /// 
    public class ExcelDocument : ExcelHelper
    {
        private bool showHeader = true;
        public bool ShowHeader
        {
            get { return (showHeader); }
            set { showHeader = value; }
        }
        private DataTable data = null;
        public ExcelDocument(DataTable data)
        {
            this.data = data;
        }
        public ExcelDocument(StringBuilder table)
        {
            this.table = table;
        }

        private StringBuilder table = null;
        protected override string Table()
        {
            if (table != null)
                return table.ToString();
            return base.Table();
        }
        protected override StringBuilder Head()
        {
            StringBuilder head = new StringBuilder();
            if (showHeader)
            {
                head.Append("<TR>");
                foreach (DataColumn column in data.Columns)
                    head.Append(GetTH(column.ColumnName));
                head.Append("</TR>");
            }
            return (head);
        }
        protected override StringBuilder Body()
        {
            StringBuilder body = new StringBuilder();
            foreach (DataRow row in data.Rows)
            {
                body.Append("<TR>");
                for (int i = 0; i < data.Columns.Count; i++)
                    body.Append(GetTD((row[i].GetType().Equals(typeof(System.DateTime)) ? ValueManager.GetDateTime(row[i]).ToString("dd.MM.yyyy") : ValueManager.GetString(row[i]))));
                body.Append("</TR>");
            }
            return (body);
        }
        protected override string GetTH(string value)
        {
            return ("<TH style=\"WIDTH:auto;text-align:center;background-color:Silver;\">" + value + "</TH>");
        }
        protected override string GetTD(string value)
        {
            return ("<TD style=\"WIDTH:auto;text-align:left\">" + value + "</TD>");
        }
    }
}