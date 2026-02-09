using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections;
using System.Data;

namespace DA
{
    public enum DataType { Int, VarChar, Date, Xml };
    public class DataParameterCollection : ICollection
    {
        private NpgsqlCommand command = null;
        public DataParameterCollection(NpgsqlCommand command)
        {
            this.command = command;
        }

        public DataParameter this[string index]
        {
            get
            {
                index = GetFormattedParameterName(index);
                return new DataParameter(command, index, command.Parameters[index].Value);
            }
            set { command.Parameters[GetFormattedParameterName(index)] = new NpgsqlParameter(value.Name, value.Value); }
        }
        public void AddRange(DataParameter[] values)
        {
            foreach (DataParameter parameter in values)
            {
                NpgsqlParameter param = new NpgsqlParameter(GetFormattedParameterName(parameter.Name), parameter.Value);
                command.Parameters.Add(param);
                parameter.Command = command;
            }
        }
        public void AddWithValue(string parameterName, object value)
        {
            NpgsqlParameter param = new NpgsqlParameter(GetFormattedParameterName(parameterName), value);
            command.Parameters.Add(param);
        }
        public void Add(string parameterName, DataType dataType)
        {
            command.Parameters.Add(GetFormattedParameterName(parameterName), GetType(dataType));
        }
        public void Add(string parameterName, DataType dataType, int size)
        {
            command.Parameters.Add(GetFormattedParameterName(parameterName), GetType(dataType), size);
        }
        public void Add(string parameterName, DataType dataType, object val, ParameterDirection direction)
        {
            command.Parameters.Add(new NpgsqlParameter(GetFormattedParameterName(parameterName), GetType(dataType))
            {
                Value = val,
                Direction = direction
            }
                );
        }
        public void Add(string parameterName, DataType dataType, int size, object val, ParameterDirection direction)
        {
            command.Parameters.Add(new NpgsqlParameter(GetFormattedParameterName(parameterName), GetType(dataType), size)
            {
                Value = val,
                Direction = direction
            }
                );
        }
        private string GetFormattedParameterName(string parameterName)
        {
            foreach (var name in Enum.GetNames(typeof(ParameterSign)))
            {
                ParameterSign sign = (ParameterSign)Enum.Parse(typeof(ParameterSign), name);
                if ((char)sign != (char)DataParameter.Sign)
                    parameterName = parameterName.Replace((char)sign, (char)DataParameter.Sign);
            }
            return parameterName;
        }
        private NpgsqlDbType GetType(DataType type)
        {
            switch (type)
            {
                case DataType.Int:
                    return NpgsqlDbType.Integer;
                case DataType.VarChar:
                    return NpgsqlDbType.Varchar;
                case DataType.Date:
                    return NpgsqlDbType.Date;
                case DataType.Xml:
                    return NpgsqlDbType.Xml;
            }
            return NpgsqlDbType.Varchar;
        }
        public void CopyTo(Array array, int index)
        {
            command.Parameters.CopyTo(array, index);
        }

        public int Count
        {
            get { return command.Parameters.Count; }
        }

        public bool IsSynchronized
        {
            get { return command.Parameters.IsSynchronized; }
        }

        public object SyncRoot
        {
            get { return command.Parameters.SyncRoot; }
        }

        public IEnumerator GetEnumerator()
        {
            return command.Parameters.GetEnumerator();
        }
    }
}
