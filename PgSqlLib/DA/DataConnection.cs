
using Npgsql;
using System.Data;

namespace DA
{
    public class DataConnection
    {
        NpgsqlConnection connection = null;
        public NpgsqlConnection Connection
        {
            get { return connection; }
        }
        public string Database
        {
            get { return connection.Database; }
        }
        public DataConnection(string connectionString)
        {
            connection = new NpgsqlConnection(connectionString);
        }
        public void Open()
        {
            connection.Open();
        }
        public ConnectionState State
        {
            get { return connection.State; }
        }
        public void Close()
        {
            connection.Close();
        }
    }
}
