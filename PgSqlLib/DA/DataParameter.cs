using Npgsql;

namespace DA
{
    public enum ParameterSign { MSSQL = '@', Oracle = ':', Postgees = ':' }
    public class DataParameter
    {
        public const ParameterSign Sign = ParameterSign.Postgees;
        private NpgsqlCommand command = null;
        public NpgsqlCommand Command
        {
            get { return command; }
            set { command = value; }
        }
        private string name = string.Empty;
        public string Name
        {
            get { return name; }
            set { name = value; }
        }
        private object value =  string.Empty;
        public object Value
        {
            get
            {
                if (command != null)
                    return command.Parameters[name].Value;
                return this.value;
            }
            set
            {
                if (command != null)
                    command.Parameters[name].Value = value;
                this.value = value;
            }
        }
        public DataParameter(string name, object value)
        {
            this.name = name;
            this.value = value;
        }
        public DataParameter(NpgsqlCommand command, string name, object value)
        {
            this.command = command;
            this.name = name;
            this.value = value;
        }
    }
}
