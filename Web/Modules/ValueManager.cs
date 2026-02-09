using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Serialization;

namespace DA
{
    public class ValueManager
    {
        #region data method

        public static object GetDefault(Type type)
        {
            if (
                type == typeof(decimal)
                || type == typeof(float)
                || type == typeof(double)
                || type == typeof(int)
                || type == typeof(long)
                || type == typeof(Single)
                )
                return Convert.ChangeType(0, type);
            if (type == typeof(DateTime))
                return DateTime.MinValue;
            if (type == typeof(string))
                return string.Empty;
            if (type == typeof(bool))
                return false;
            return null;
        }
        public enum TypeGroup { Неопределеный, Числовой, ДатаВремя, Текстовый, Логический };
        public static TypeGroup GetTypeGroup(Type type)
        {
            if (
                type == typeof(decimal)
                || type == typeof(float)
                || type == typeof(double)
                || type == typeof(int)
                || type == typeof(long)
                || type == typeof(Single)
                )
                return TypeGroup.Числовой;
            if (type == typeof(DateTime))
                return TypeGroup.ДатаВремя;
            if (type == typeof(string))
                return TypeGroup.Текстовый;
            if (type == typeof(bool))
                return TypeGroup.Логический;
            return TypeGroup.Неопределеный;
        }

        public static bool IsDBNullOrNull(object value)
        {
            if (value == null)
                return true;

            if (DBNull.Value.Equals(value))
                return true;

            return false;
        }

        public static bool IsEmpty(object value)
        {
            if (value == null)
                return true;

            if (DBNull.Value.Equals(value))
                return true;

            if (value.ToString().Length == 0)
                return true;

            return false;
        }

        public static T ChangeType<T>(object value)
        {
            T defaultValue = default(T);
            if (typeof(T) == typeof(string))
                defaultValue = (T)Convert.ChangeType(string.Empty, typeof(T));
            return ChangeType<T>(value, (T)defaultValue);
        }

        public static T ChangeType<T>(object value, T defaultValue)
        {
            if (IsDBNullOrNull(value))
                return defaultValue;

            //if (value is T)
            //  return (T)value;

            Type conversionType = (defaultValue == null ? typeof(T) : defaultValue.GetType());

            if (conversionType.IsGenericType &&
                conversionType.GetGenericTypeDefinition().Equals(typeof(Nullable<>)))
            {
                conversionType = Nullable.GetUnderlyingType(conversionType);
            }
            if (value.GetType() == typeof(string) &&
                conversionType == typeof(decimal)
                || conversionType == typeof(float)
                || conversionType == typeof(double)
                || conversionType == typeof(int)
                || conversionType == typeof(long)
                || conversionType == typeof(Single)
                )
            {
                string decimalSeparator = CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator;
                value = value.ToString().Replace(".", decimalSeparator).Replace(",", decimalSeparator);

                /*string decimalSeparator = CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator;
                string strValue = ((string)Convert.ChangeType(value, typeof(string)))
                    .Replace(",", decimalSeparator)
                    .Replace(".", decimalSeparator)
                    .Replace(" ", "").Trim();
                if (string.IsNullOrWhiteSpace(strValue) || strValue.Split(decimalSeparator[0]).Length > 2)
                    strValue = "0";

                double dblValue = 0;
                double.TryParse(strValue, out dblValue);
                dblValue = Math.Round(dblValue, 2, MidpointRounding.AwayFromZero);

                value = dblValue.ToString("############.##").Replace(".", decimalSeparator).Trim();*/
            }

            try
            {
                return (T)Convert.ChangeType(value, conversionType);
            }
            catch
            {
                return defaultValue;
            }
        }

        public static string GetString(object Object)
        {
            return ChangeType<string>(Object);
        }

        public static char GetChar(object Object)
        {
            return ChangeType(Object, ' ');
        }

        public static int GetInt(object Object)
        {
            return ChangeType<int>(Object);
        }

        public static decimal GetDecimal(object Object)
        {
            return ChangeType<decimal>(Object);
        }
        public static double GetDouble(object Object)
        {
            return ChangeType<double>(Object);
        }

        public static float GetFloat(object Object)
        {
            return ChangeType<float>(Object);
        }

        public static long GetLong(object Object)
        {
            return ChangeType<long>(Object);
        }

        public static DateTime GetDateTime(object Object)
        {
            return ChangeType<DateTime>(Object);
        }

        public static DateTime GetEQDateTime(object Object)
        {
            long eqdate = GetLong(Object);
            if (eqdate == 0)
                eqdate = 101; /*else*/
            eqdate += 19000000;

            string st = eqdate.ToString();
            st = st.Substring(6, 2) + "." + st.Substring(4, 2) + "." + st.Substring(0, 4);
            return Convert.ToDateTime(st);
        }

        public static DateTime GetEQDateTime(object date, object time)
        {
            long eqdate = GetLong(date);
            if (eqdate == 0)
                eqdate = 101;
            /*else*/
            eqdate += 19000000;
            string st = eqdate.ToString();
            st = st.Substring(6, 2) + "." + st.Substring(4, 2) + "." + st.Substring(0, 4);

            string eqtime = GetString(time);
            for (int i = eqtime.Length; i < 6; i++)
                eqtime = "0" + eqtime;
            eqtime = eqtime.Substring(0, 2) + ":" + eqtime.Substring(2, 2) + ":" +
                eqtime.Substring(4, 2);

            return Convert.ToDateTime(st + " " + eqtime);
        }

        public static bool GetBoolean(object Object)
        {
            return ChangeType<bool>(Object);
        }

        private static object GetObject(string xmldata, Type type)
        {
            object output = null;
            byte[] bytes = Encoding.UTF8.GetBytes(xmldata.ToCharArray());

            using (MemoryStream mem = new MemoryStream(bytes))
            {
                XmlSerializer formatter = new XmlSerializer(type);
                output = formatter.Deserialize(mem);
            }
            return (output);
        }

        public static object GetObject(object xmldata, Type type)
        {
            string st = GetString(xmldata);

            st = st.Replace("<XML>", "<" + type.Name + ">");
            st = st.Replace("</XML>", "</" + type.Name + ">");

            if (st.IndexOf("<?xml", StringComparison.OrdinalIgnoreCase) == -1)
                st = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n" + st;

            object ret = null;
            try
            {
                ret = GetObject(st, type);
            }
            catch //(Exception ex)
            {
            }
            if (ret == null)
            {
                ConstructorInfo constructor = type.GetConstructor(Type.EmptyTypes);
                ret = constructor.Invoke(new object[0]);
            }
            return (ret);
        }

        public static object GetXmlData(object data)
        {
            Type type = data.GetType();
            string output = string.Empty;
            byte[] bytes = null;
            using (MemoryStream mem = new MemoryStream())
            {
                XmlSerializer formatter = new XmlSerializer(type);
                formatter.Serialize(mem, data);
                mem.Flush();
                bytes = mem.ToArray();
            }
            if (bytes != null)
            {
                char[] chars = Encoding.UTF8.GetChars(bytes);
                output = new string(chars);
            }
            return output;
        }

        public static List<T> GetList<T>(DataTable table, string dataField)
        {
            List<T> result = new List<T>(table.Rows.Count);
            int filedIndex = table.Columns.IndexOf(dataField);
            foreach (DataRow row in table.Rows)
            {
                if (!row.IsNull(filedIndex))
                    result.Add(ChangeType<T>(row[filedIndex]));
            }
            return result;
        }

        public void SetDBValue<T>(object field, T value)
        {
            if (value == null || string.Empty.Equals(value) || DateTime.MinValue.Equals(value))
                field = DBNull.Value;
            else
                field = value;
        }

        public static object GetIntOrDBNull(object value)
        {
            if (value == null)
                return DBNull.Value;
            return ChangeType<int>(value);
        }
        public static object GetLongOrDBNull(object value)
        {
            if (value == null)
                return DBNull.Value;
            return ChangeType<long>(value);
        }
        public static object GetDateTimeOrDBNull(object value)
        {
            if (value == null)
                return DBNull.Value;
            return ChangeType<DateTime>(value);
        }

        public static object GetValueOrDBNull(object value)
        {
            if (value == null)
                return DBNull.Value;
            else if (value.GetType() == typeof(DateTime))
            {
                DateTime result = GetDateTime(value);
                if (result == DateTime.MinValue)
                    return DBNull.Value;
                else
                    return result;
            }
            else
                return value;
        }

        public static Uri GetUri(object Object)
        {
            if (!(Object is string))
            {
                return null;
            }
            string s = Object.ToString();

            if (String.IsNullOrEmpty(s))
            {
                return null;
            }

            return new Uri(s);
        }

        #endregion
        public static string CombineUrl(string url, string query)
        {
            if (!string.IsNullOrEmpty(query))
            {
                Hashtable nameCollection = new Hashtable();
                if (url.IndexOf('?') != -1)
                {
                    string[] q1 = url.Substring(url.IndexOf('?') + 1).Split('&');
                    foreach (string p1 in q1)
                    {
                        string[] n1 = p1.Split('=');
                        if (n1.Length == 2)
                            nameCollection[n1[0]] = n1[1];
                    }

                    url = url.Substring(0, url.IndexOf('?'));
                }
                string[] parts = query.Split('&');
                foreach (string part in parts)
                {
                    string[] names = part.Split('=');
                    if (names.Length == 2)
                        nameCollection[names[0]] = names[1];
                }
                bool isFirst = true;
                foreach (string key in nameCollection.Keys)
                {
                    url += (isFirst ? "?" : "&") + key + "=" + nameCollection[key].ToString();
                    isFirst = false;
                }
            }
            return url;
        }

        public static DateTime GetFirstWorkDate()
        {
            return GetFirstWorkDate(DateTime.Today);
        }
        public static DateTime GetFirstWorkDate(DateTime date)
        {
            switch (date.DayOfWeek)
            {
                case DayOfWeek.Saturday:
                    return date.AddDays(2);
                case DayOfWeek.Sunday:
                    return date.AddDays(1);
            }
            return date;
        }
        public static string GetUnescapeString(string name)
        {
            if (!string.IsNullOrWhiteSpace(name))
                return Uri.UnescapeDataString(name);
            return name;
        }

        public static string ToFormattedString(object value)
        {
            if (value == null)
                return string.Empty;
            if (value.GetType() == typeof(DateTime))
                return ((DateTime)value).ToString("dd.MM.yyyy");
            if (value.GetType() == typeof(float))
                return ((float)value).ToString("n2");
            if (value.GetType() == typeof(double))
                return ((double)value).ToString("n2");
            if (value.GetType() == typeof(decimal))
                return ((decimal)value).ToString("n2");
            return value.ToString();
        }

        public static string CurrencyToString(object value)
        {
            string decimalSeparator = CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator;

            string strValue = ValueManager.ChangeType(value, "0")
                .Replace(",", decimalSeparator)
                .Replace(".", decimalSeparator)
                .Replace(" ", "");

            double dblValue = Math.Round(Convert.ToDouble(string.IsNullOrWhiteSpace(strValue) ? "0" : strValue), 2, MidpointRounding.AwayFromZero);

            return dblValue.ToString("### ### ### ##0.00"/*"###_###_##0.00;-###_###_##0.00;0.00"*/)
                .Replace(".", decimalSeparator).Trim();
        }

        public static string FormatAmount(object value, string currencyCode = "", bool currensySymbolInWords = false)
        {
            string amount = CurrencyToString(value);


            if (currensySymbolInWords)
            {
                if (currencyCode.ToUpper() == "RUR")
                {
                    string[] parts = amount.Split(new string[] { CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator }, StringSplitOptions.RemoveEmptyEntries);
                    return parts[0] + "," + (parts.Length > 1 ? parts[1] : "00") + " руб.";
                }
                if (currencyCode.ToUpper() == "USD")
                    return amount + " долл. США";

                if (currencyCode.ToUpper() == "EUR")
                    return amount + " евро";
            }
            else
            {
                switch (currencyCode.ToUpper())
                {
                    case "RUR":
                        string[] parts = amount.Split(new string[] { CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator }, StringSplitOptions.RemoveEmptyEntries);
                        return parts[0] + " руб";
                    case "USD":
                        return "$" + amount.TrimStart();
                    case "EUR":
                        return "€" + amount.TrimStart();
                    default:
                        string[] parts1 = amount.Split(new string[] { CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator }, StringSplitOptions.RemoveEmptyEntries);
                        return parts1[0] + " " + currencyCode;
                }
            }

            return amount;
        }
        public static string DateTimeToString(object value)
        {
            if (DBNull.Value.Equals(value))
                return string.Empty;

            if (null == value)
                return string.Empty;

            try
            {
                return Convert.ToDateTime(value).ToString("dd.MM.yyyy");
            }
            catch
            {
                return string.Empty;
            }
        }

        public static string FormatName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return string.Empty;
            StringBuilder sb = new StringBuilder();
            foreach (string part in name.Trim().Split(' '))
            {
                if (part != string.Empty)
                {
                    sb.Append(part.Substring(0, 1).ToUpper());
                    sb.AppendFormat("{0} ", part.Substring(1).ToLower());
                }
            }

            return (sb.ToString().Trim());
        }

        public static string ToShortName(string name)
        {
            if (name != null && name.Length < 3)
                return name;
            StringBuilder sb = new StringBuilder();
            string[] partList = name.Trim().Split(' ');
            for (int i = 0; i < partList.Length; i++)
            {
                string part = partList[i].Trim();
                if (i == 0)
                {
                    sb.Append(part.Substring(0, 1).ToUpper());
                    sb.AppendFormat("{0} ", part.Substring(1).ToLower());
                }
                else
                {
                    sb.AppendFormat("{0}.", part.Substring(0, 1).ToUpper());
                }
            }

            return (sb.ToString().Trim());
        }

        public static string GetClearString(string value)
        {
            StringBuilder sb = new StringBuilder();
            foreach (char ch in value)
            {
                if (Char.IsControl(ch))
                    sb.Append(' ');
                else
                    sb.Append(ch);
            }
            return sb.ToString();
        }

        public static string ToRTFString(string value)
        {
            StringBuilder sb = new StringBuilder();
            byte[] bytes = Encoding.GetEncoding("windows-1251").GetBytes(value);

            foreach (byte b in bytes)
                sb.AppendFormat(@"\'{0}", b.ToString("x"));

            return sb.ToString();
        }

        public static string FromRTFFormat(string word)
        {
            word = word.Replace('{', ' ').Replace('}', ' ').Replace('\r', ' ').Replace('\n', ' ').Trim();
            string[] parts = word.Split(' ');
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < parts.Length; i++)
            {
                MatchCollection collection = Regex.Matches(parts[i], @"\'[a-zA-Z0-9][a-zA-Z0-9]");
                if (collection.Count > 0)
                {
                    foreach (Match match in collection)
                    {
                        byte b = Convert.ToByte("0x" + match.Value.Remove(0, 1), 16);
                        char[] c = Encoding.GetEncoding("windows-1251").GetChars(new byte[] { b });
                        parts[i] = parts[i].Replace("\\" + match.Value, c[0].ToString());
                    }
                    parts[i] += " ";
                }
                if (!string.IsNullOrWhiteSpace(parts[i]) && parts[i].IndexOf('\\') == -1)
                    sb.Append(parts[i]);
            }
            return sb.ToString();
        }

        public static T GetIfExist<T>(DataRow row, string columnName)
        {
            if (row.Table.Columns.Contains(columnName))
                return ValueManager.ChangeType<T>(row[columnName]);
            else
                return default(T);
        }
    }
}
