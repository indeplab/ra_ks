using System;
using DA;

namespace Web.UI
{
    [Serializable]
    public class GridQuery
    {
        private FilterParameterCollection parameters = new FilterParameterCollection();
        private string order = "";

        public FilterParameterCollection Parameters
        {
            get { return (parameters); }
        }

        public bool IsEmpty
        {
            get { return (parameters == null || parameters.Count == 0); }
        }

        public string Order
        {
            get { return (order); }
            set { order = value; }
        }

        public DataParameter[] ToDataParameterArray()
        {
            return parameters.ToDataParameterArray();
        }
        public override string ToString()
        {
            return parameters.ToString(" WHERE ");
        }

        public string ToString(string clause, string operand)
        {
            return (parameters.ToString(clause, operand));
        }
        public string ToStringOr()
        {
            return (parameters.ToString("", "or"));
        }
        public string ToStringAnd()
        {
            return (parameters.ToString("", "and"));
        }
    }
}