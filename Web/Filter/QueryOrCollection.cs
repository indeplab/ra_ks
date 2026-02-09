using System;
using DA;

namespace Web.UI
{
    public class QueryOrCollection
    {
        private FilterParameterCollection parameters = new FilterParameterCollection();

        public FilterParameterCollection Parameters
        {
            get { return (parameters); }
        }

        public bool IsEmpty
        {
            get { return (parameters == null || parameters.Count == 0); }
        }

        public override string ToString()
        {
            return (parameters.ToString("", "or"));
        }
        public string ToStringWhere()
        {
            return (parameters.ToString("where", "or"));
        }

    }
}