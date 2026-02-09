using System;
using System.Text;

namespace ExcelTool
{
    public class ExcelHelper
    {
        #region properties
        private string tableStyle = "";
        public string TableStyle
        {
            get { return (tableStyle); }
            set { tableStyle = value; }
        }
        private string name = "Лист1";
        public string Name
        {
            get { return (name); }
            set { name = value; }
        }
        #endregion

        public override string ToString()
        {
            return (Document().ToString());
        }
        protected StringBuilder Document()
        {
            StringBuilder st = new StringBuilder();
            st.Append("" +
                        "<HTML xmlns:o=\"urn:schemas-microsoft-com:office:office\" " +
                        "		xmlns:x=\"urn:schemas-microsoft-com:office:excel\" " +
                        "		xmlns=\"http://www.w3.org/TR/REC-html40\"> " +
                        "	<HEAD> " +
                        "		<xml> " +
                        "		<x:ExcelWorkbook> " +
                        "		<x:ExcelWorksheets> " +
                        "		<x:ExcelWorksheet> " +
                        "			<x:Name>" + this.name + "</x:Name> " +
                        "			<x:WorksheetOptions> " +
                        "			<x:Selected/> " +
                        "           <x:DoNotDisplayGridlines/>" +
                        "			<x:Panes> " +
                        "			</x:Panes> " +
                        "			<x:ProtectContents>False</x:ProtectContents> " +
                        "			<x:ProtectObjects>False</x:ProtectObjects> " +
                        "			<x:ProtectScenarios>False</x:ProtectScenarios> " +
                        "			</x:WorksheetOptions> " +
                        "		</x:ExcelWorksheet> " +
                        "		</x:ExcelWorksheets> " +
                        "		<x:WindowHeight>12660</x:WindowHeight> " +
                        "		<x:WindowWidth>15180</x:WindowWidth> " +
                        "		<x:WindowTopX>480</x:WindowTopX> " +
                        "		<x:WindowTopY>120</x:WindowTopY> " +
                        "		<x:ProtectStructure>False</x:ProtectStructure> " +
                        "		<x:ProtectWindows>False</x:ProtectWindows> " +
                        "		</x:ExcelWorkbook> " +
                        "		</xml> " +
                        "	</HEAD> " +
                        "	<BODY> " +
                            Table() +
                        "	</BODY> " +
                        "</HTML> ");

            return (st);
        }
        protected virtual string Table()
        {
            return @"	<TABLE border=1> " +
                        Head().ToString() +
                        Body().ToString() +
                        "	</TABLE> ";
        }
        protected virtual StringBuilder Head()
        {
            return (new StringBuilder());
        }
        protected virtual StringBuilder Body()
        {
            return (new StringBuilder());
        }
        protected virtual string GetTD(string value)
        {
            return ("<TD>" + value + "</TD>");
        }
        protected virtual string GetTH(string value)
        {
            return ("<TH style=\"background-color: #F1F2F4;\">" + value + "</TH>");
        }

        public char[] GetChars()
        {
            return this.ToString().ToCharArray();
        }
        public byte[] GetBytes()
        {
            Encoding encoding = Encoding.UTF8;
            char[] chars = GetChars();
            byte[] bytes = new byte[encoding.GetByteCount(chars) + 3];
            bytes[0] = 0xEF;
            bytes[1] = 0xBB;
            bytes[2] = 0xBF;
            encoding.GetBytes(chars, 0, chars.Length, bytes, 3);
            return bytes;
        }
    }
}