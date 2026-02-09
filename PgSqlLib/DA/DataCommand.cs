using Npgsql;
using System;

namespace DA
{
    public class DataCommand
    {
        NpgsqlCommand command = null;
        DataParameterCollection parameters = null;
        public NpgsqlCommand Command
        {
            get { return command; }
        }
        public string CommandText
        {
            get { return command.CommandText; }
            set { command.CommandText = GetFormattedCommand(value); }
        }
        public DataCommand(string commandText, DataConnection connection)
        {
            command = new NpgsqlCommand(GetFormattedCommand(commandText), connection.Connection);
            parameters = new DataParameterCollection(command);
        }
        private string GetFormattedCommand(string command)
        {
            /*foreach (var name in Enum.GetNames(typeof(ParameterSign)))
            {
                ParameterSign sign = (ParameterSign)Enum.Parse(typeof(ParameterSign), name);
                if ((char)sign != (char)DataParameter.Sign)
                    command = command.Replace((char)sign, (char)DataParameter.Sign);
            }*/
            return command;
        }
        public DataParameterCollection Parameters
        {
            get { return parameters; }
        }
        public int CommandTimeout
        {
            get { return command.CommandTimeout; }
            set { command.CommandTimeout = value; }
        }
        public DataReader ExecuteReader()
        {
            //command.Parameters.AddRange(parameters.ToArray());
            return new DataReader(command.ExecuteReader());
        }
        public object ExecuteScalar()
        {
            //command.Parameters.AddRange(parameters.ToArray());
            return command.ExecuteScalar();
        }
        public int ExecuteNonQuery()
        {
            //command.Parameters.AddRange(parameters.ToArray());
            return command.ExecuteNonQuery();
        }
    }
}
