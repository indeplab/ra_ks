using Web;
using System;
using System.Collections.Generic;
using System.Data;

namespace DA
{
    public class DataManager : IDisposable
    {
        private DataConnection sql_context = null;

        void IDisposable.Dispose()
        {
            if (sql_context != null && sql_context.State != ConnectionState.Closed)
            {
                sql_context.Close();
                sql_context = null;
            }
        }
        public DataCommand CreateCommand()
        {
            return CreateCommand(string.Empty);
        }
        public DataCommand CreateCommand(string command, params DataParameter[] parameters)
        {
            OpenConnect();
            DataCommand cmd = new DataCommand(command, sql_context);
            cmd.Parameters.AddRange(parameters);
            cmd.CommandTimeout = 600;
            return cmd;
        }
        public DataCommand CreateCommand(string command, List<DataParameter> parameters)
        {
            return CreateCommand(command, parameters.ToArray());
        }
        public DataAdapter CreateDataAdapter()
        {
            return CreateDataAdapter(string.Empty);
        }
        public DataAdapter CreateDataAdapter(string command, params DataParameter[] parameters)
        {
            OpenConnect();
            DataCommand cmd = new DataCommand(command, sql_context);
            cmd.Parameters.AddRange(parameters);
            cmd.CommandTimeout = 600;
            DataAdapter adapter = new DataAdapter(cmd);
            return adapter;
        }
        public DataAdapter CreateDataAdapter(string command, List<DataParameter> parameters)
        {
            return CreateDataAdapter(command, parameters.ToArray());
        }
        public DataTable GetDataTable(string command, params DataParameter[] parameters)
        {

            DataTable result = new DataTable();
            DataCommand cmd = CreateCommand(command, parameters);
            DataAdapter da = new DataAdapter(cmd);
            da.Fill(result);

            return result;
        }
        public DataTable GetDataTable(string command, List<DataParameter> parameters)
        {
            return GetDataTable(command, parameters.ToArray());
        }
        public DataTable GetDataTable(DataCommand command)
        {
            DataAdapter da = new DataAdapter(command);
            DataTable dt = new DataTable();
            da.Fill(dt);
            return (dt);
        }

        public object ExecuteScalar(string command, params DataParameter[] parameters)
        {
            DataCommand cmd = CreateCommand(command, parameters);
            return (cmd.ExecuteScalar());
        }
        public object ExecuteScalar(string command, List<DataParameter> parameters)
        {
            return ExecuteScalar(command, parameters.ToArray());
        }
        public object ExecuteScalar(DataCommand command)
        {
            return (command.ExecuteScalar());
        }

        public void ExecuteNonQuery(string command, params DataParameter[] parameters)
        {
            DataCommand cmd = CreateCommand(command, parameters);
            cmd.ExecuteNonQuery();
        }
        public void ExecuteNonQuery(string command, List<DataParameter> parameters)
        {
            ExecuteNonQuery(command, parameters.ToArray());
        }
        public void ExecuteNonQuery(DataCommand command)
        {
            command.ExecuteNonQuery();
        }

        public DataReader ExecuteReader(string command, params DataParameter[] parameters)
        {
            DataCommand cmd = CreateCommand(command);
            cmd.Parameters.AddRange(parameters);
            return cmd.ExecuteReader();
        }
        public DataReader ExecuteReader(string command, List<DataParameter> parameters)
        {
            return ExecuteReader(command, parameters.ToArray());
        }
        public DataReader ExecuteReader(DataCommand command)
        {
            return (command.ExecuteReader());
        }

        private void OpenConnect()
        {
            try
            {
                if (sql_context == null)
                    sql_context = new DataConnection(Startup.Configuration["SqlConnection:DefaultConnection"]);
                if (sql_context.State != ConnectionState.Open)
                {
                    sql_context.Open();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}