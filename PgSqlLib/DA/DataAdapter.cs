using Npgsql;
using System.Data;

namespace DA
{
    public class DataAdapter
    {
        NpgsqlDataAdapter adapter = null;
        public DataAdapter(DataCommand command)
        {
            //command.Command.Parameters.AddRange(command.Parameters.ToArray());
            adapter = new NpgsqlDataAdapter(command.Command);
        }
        public void Fill(DataTable table)
        {
            adapter.Fill(table);
        }
    }
}
