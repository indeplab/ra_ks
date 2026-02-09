using Npgsql;

namespace DA
{
    public class DataReader
    {
        NpgsqlDataReader reader = null;
        public DataReader(NpgsqlDataReader reader)
        {
            this.reader = reader;
        }
        public bool HasRows
        {
            get { return reader.HasRows; }
        }
        public bool Read()
        {
            return reader.Read();
        }
        public object this[string name]
        {
            get { return reader[name]; }
        }
        public object this[int ordinal]
        {
            get { return reader[ordinal]; }
        }
        public void Close()
        {
            reader.Close();
        }

    }
}
