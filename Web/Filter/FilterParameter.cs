using System;

namespace Web.UI
{
    [Serializable]
    public class FilterParameter
    {
        private string _columnName = null;

        private object _value = null;

        private string _format = null;

        private bool _useInQuery = true;

        public FilterParameter(string columnName, object value)
        {
            _columnName = columnName;
            _value = value;
        }

        public FilterParameter(string columnName, object value, bool useInQuery)
        {
            _columnName = columnName;
            _value = value;
            _useInQuery = useInQuery;
        }

        public FilterParameter(string value)
        {
            _columnName = null;
            _value = value;
        }

        public FilterParameter(string columnName, object value, string format)
        {
            _columnName = columnName;
            _value = value;
            _format = format;
        }

        public string ColumnName
        {
            get { return _columnName; }
            set { _columnName = value; }
        }

        public object Value
        {
            get { return (_value); }
        }

        public string Format
        {
            get { return _format; }
            set { _format = value; }
        }

        public bool UseInQuery
        {
            get { return _useInQuery; }
            set { _useInQuery = value; }
        }

        public override string ToString()
        {
            if (UseInQuery)
            {
                if (ColumnName == null)
                    return Value.ToString();

                if (_format == null)
                    return ColumnName + " = " + GetDataParameterName();

                return _format
                    .Replace("{" + ColumnName + "}", GetDataParameterName());
            }
            return string.Empty;
        }

        public string GetDataParameterName()
        {
            return "@" + ColumnName
                             .Replace(".", string.Empty)
                             .Replace("[", string.Empty)
                             .Replace("]", string.Empty);
        }
    }
}