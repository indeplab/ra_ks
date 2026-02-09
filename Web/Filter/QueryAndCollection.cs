using System;
using DA;

namespace Web.UI
{
    public class QueryAndCollection
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
            return (parameters.ToString("", "and"));
        }
        public string ToStringWhere()
        {
            return (parameters.ToString("where", "and"));
        }
        public string ToStringWhere(string init)
        {
            parameters.Add(init);
            return (parameters.ToString("where", "and"));
        }

    }
}