using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;
using System;
using System.Linq;
using DA;

namespace Web.UI
{
    [Serializable]
    public class FilterParameterCollection : List<FilterParameter>
    {
        public void Add(string value)
        {
            if(!string.IsNullOrEmpty(value))
                Add(new FilterParameter(value));
        }

        public void Add(string columnName, object value)
        {
            if(!this.Any(s=>s.ColumnName.Equals(columnName,StringComparison.OrdinalIgnoreCase)))
                Add(new FilterParameter(columnName, value));
        }

        public void Add(string columnName, object value, string format)
        {
            if(!this.Any(s=>s.ColumnName.Equals(columnName,StringComparison.OrdinalIgnoreCase)))
                Add(new FilterParameter(columnName, value, format));
        }

        public void AddFormat(string format, params object[] args)
        {
            Add(string.Format(format, args));
        }

        public DataParameter[] ToDataParameterArray()
        {
            DataParameter[] collection = new DataParameter[Count];
            for (int i = 0; i < Count; i++)
                collection[i] = new DataParameter(this[i].GetDataParameterName(), this[i].Value);
            return collection;
        }

        public override string ToString()
        {
            return ToString("WHERE");
        }

        public string ToString(string clause, string operand="and")
        {
            StringBuilder sb = new StringBuilder();
            foreach (FilterParameter param in this){
                string ps = param.ToString();
                if(param.UseInQuery && !string.IsNullOrEmpty(ps))
                    sb.AppendFormat("({0}) {1} ",ps, operand);
            }

            return (sb.Length > 0 ? " " + clause + " " + sb.ToString(0, sb.Length - (operand.Length+2)) : string.Empty);
        }
    }
}