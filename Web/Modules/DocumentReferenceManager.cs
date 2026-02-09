using System;
using System.Data;
using DA;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class DocumentReferenceManager : BaseListManager{

        public DocumentReferenceManager(FilterEntity filter):base(filter){
            filter.currentSort=string.IsNullOrEmpty(filter.currentSort)?"Name":filter.currentSort;
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("Name", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "<нет>";
            if (column.Caption.Equals("Date", StringComparison.OrdinalIgnoreCase) && !String.IsNullOrEmpty(row[column].ToString()))
                return ValueManager.GetDateTime(row[column]).ToString("dd.MM.yyyy");
            return base.OnFormatValue(column, row);
        }

        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (!string.IsNullOrEmpty(Filter["sid"]))
                    query.Parameters.Add("sid", ValueManager.GetInt(Filter["sid"]), "doc.id in (select doc_id from doc_link where doc_link.type='system' and doc_link.ref_id = @sid)");
                if (!string.IsNullOrEmpty(Filter["fid"]))
                    query.Parameters.Add("fid", ValueManager.GetInt(Filter["fid"]), "doc.id in (select doc_id from doc_link where doc_link.type='function' and doc_link.ref_id = @fid)");
                if (!string.IsNullOrEmpty(Filter["lid"]))
                    query.Parameters.Add("lid", ValueManager.GetInt(Filter["lid"]), "doc.id in (select doc_id from doc_link where doc_link.type='interface' and doc_link.ref_id = @lid)");
                if (!string.IsNullOrEmpty(Filter["did"]))
                    query.Parameters.Add("did", ValueManager.GetInt(Filter["did"]), "doc.id in (select doc_id from doc_link where doc_link.type='data' and doc_link.ref_id = @did)");
                if (!string.IsNullOrEmpty(Filter["zid"]))
                    query.Parameters.Add("zid", ValueManager.GetInt(Filter["zid"]), "doc.id in (select doc_id from doc_link where doc_link.type='netzone' and doc_link.ref_id = @zid)");
                if (!string.IsNullOrEmpty(Filter["nid"]))
                    query.Parameters.Add("nid", ValueManager.GetInt(Filter["nid"]), "doc.id in (select doc_id from doc_link where doc_link.type='netobject' and doc_link.ref_id = @nid)");
                if (!string.IsNullOrEmpty(Filter["tbDocName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbDocName"], "%"), "(doc.name ilike @name or doc.type ilike @name or doc.project ilike @name or doc.author ilike @name or doc_state.name ilike @name)");

                return (query);
            }
        }
    }
}
