using System;
using System.Data;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class CouncilListManager : BaseListManager
    {
        public CouncilListManager(FilterEntity filter) : base(filter)
        {
            filter.currentSort = string.IsNullOrEmpty(filter.currentSort) ? "Number" : filter.currentSort;
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("Number", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "б/н";
            if (column.Caption.Equals("Date", StringComparison.OrdinalIgnoreCase) && !String.IsNullOrEmpty(row[column].ToString()))
                return ValueManager.GetDateTime(row[column]).ToString("dd.MM.yyyy");
            return base.OnFormatValue(column, row);
        }
        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (ValueManager.GetLong(Filter["tbID"]) != 0)
                    query.Parameters.Add("id", ValueManager.GetLong(Filter["tbID"]), "council.id = @id");
                if (ValueManager.GetLong(Filter["tbNumber"]) != 0)
                    query.Parameters.Add("number", ValueManager.GetLong(Filter["tbNumber"]), "council.number = @number");
                if (ValueManager.GetDateTime(Filter["tbStartDate"]) != DateTime.MinValue)
                    query.Parameters.Add("sdate", ValueManager.GetDateTime(Filter["tbStartDate"]), "council.date >= @sdate");
                if (ValueManager.GetDateTime(Filter["tbEndDate"]) != DateTime.MinValue)
                    query.Parameters.Add("edate", ValueManager.GetDateTime(Filter["tbEndDate"]), "council.date <= @edate");
                if (!string.IsNullOrEmpty(Filter["tbAgenda"]))
                    query.Parameters.Add("agenda", string.Concat("%", Filter["tbAgenda"], "%"), "council_ussue.agenda ilike @agenda)");
                if (!string.IsNullOrEmpty(Filter["tbDecision"]))
                    query.Parameters.Add("decision", string.Concat("%", Filter["tbDecision"], "%"), "council_ussue.decision ilike @decision)");
                if (!string.IsNullOrEmpty(Filter["tbSpeaker"]))
                    query.Parameters.Add("speaker", string.Concat("%", Filter["tbSpeaker"], "%"), "council_ussue.speaker ilike @speaker)");
                if (!string.IsNullOrEmpty(Filter["tbDivision"]))
                    query.Parameters.Add("division", string.Concat("%", Filter["tbDivision"], "%"), "council_ussue.division ilike @division)");
                if (ValueManager.GetLong(Filter["tbSystemID"]) != 0)
                    query.Parameters.Add("systemid", ValueManager.GetLong(Filter["tbSystemID"]), "council_system.system_id = @systemid");
                if (!string.IsNullOrEmpty(Filter["tbSystemName"]))
                    query.Parameters.Add("systemname", string.Concat("%", Filter["tbSystemName"], "%"), "system.name ilike @systemname");

                return (query);
            }
        }
    }
}
