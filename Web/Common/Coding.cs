
namespace Common
{
    public class StringCoder
    {
        public static string Code(string password)     //процедура "Шифрование". используем шифр Виженера.
        {
            string key = "vtyzpjdenbujhm";
            string all = @"`1234567890-=~!@#$%^&*()_+qwertyuiop[]QWERTYUIOP{}asdfghjkl;'\ASDFGHJKL:""|ZXCVBNM<>?zxcvbnm,./№ёЁйцукенгшщзхъЙЦУКЕНГШЩЗХЪфывапролджэФЫВАПРОЛДЖЭячсмитьбюЯЧСМИТЬБЮ";//все символы, которые могут быть использовани при вводе пароляя
            string st; int center;                           //объявление новых переменных.
            string leftSlice, rightSlice, cPass = "";

            if (key.Length > password.Length)               //если длина строки пароля (ключа для входа в программу и для шифрования)>длины строки пароля (какого-либо сайта и т.д.),
            {
                key = key.Substring(0, password.Length);    //то переменная key обрежется и станет равной длинне пароля 
            }
            else                                            // Иначе повторять ключ (ключключключклю), пока не станет равным длинне пароля
                for (int i = 0; key.Length < password.Length; i++)
                {
                    key = key + key.Substring(i, 1);
                }
            //основной цикл шифрования
            for (int i = 0; i < password.Length; i++)
            {//находим центр строки all (центр - это будущий первый символ строки со сдвигом)
                center = all.IndexOf(key.Substring(i, 1));
                leftSlice = all.Substring(center); //берем левую часть будущей строки со сдвигом
                rightSlice = all.Substring(0, center);// затем правую
                st = leftSlice + rightSlice;// формируем строку со сдвигом
                center = all.IndexOf(password.Substring(i, 1));// теперь в переменную center запишем индекс очередного символа шифруемой строки
                cPass += st.Substring(center, 1);    //поскольку индексы символа из строки со сдвигом и из обычной строки совпадают, то нужный нам символ берется по такому же индексу
            }

            return cPass;
        }

        public static string Decode(string password)        //процедура "Расшифрование"
        {
            string key = "vtyzpjdenbujhm";
            // строка all содержит все символы, которые можно вводить с русской и англ раскладки клавиатуры
            string all = @"`1234567890-=~!@#$%^&*()_+qwertyuiop[]QWERTYUIOP{}asdfghjkl;'\ASDFGHJKL:""|ZXCVBNM<>?zxcvbnm,./№ёЁйцукенгшщзхъЙЦУКЕНГШЩЗХЪфывапролджэФЫВАПРОЛДЖЭячсмитьбюЯЧСМИТЬБЮ";
            //строка st со сдвигом по ключу (в качестве ключа используем наш пароль для входа)
            string st; int center; // центр указывает на индекс символа, до которого идет сдвиг по ключу.
            string leftSlice, rightSlice, cPass = ""; //leftSlice, rightSlice - правый срез, левый срез. из них составляется строка со сдвигом st. 

            //если пароль короче ключа - обрезаем ключ
            if (key.Length > password.Length)
            {
                key = key.Substring(0, password.Length);
            }
            //Иначе повторяем ключ, пока он не примет длинну пароля.
            else
                for (int i = 0; key.Length < password.Length; i++)
                {
                    key = key + key.Substring(i, 1);
                }
            // основной цикл расшифрования.
            for (int i = 0; i < password.Length; i++)
            {
                //находим центр строки all (центр - это будущий первый символ строки со сдвигом)
                center = all.IndexOf(key.Substring(i, 1));
                leftSlice = all.Substring(center); //берем левую часть будущей строки со сдвигом
                rightSlice = all.Substring(0, center);// затем правую
                st = leftSlice + rightSlice; // формируем строку со сдвигом
                center = st.IndexOf(password.Substring(i, 1)); // теперь в переменную center запишем индекс очередного символа расшифроввываемой строки
                cPass += all.Substring(center, 1); //поскольку индексы символа из строки со сдвигом и из обычной строки совпадают, то нужный нам символ берется по такому же индексу
            }
            return cPass; //возвращаем расшифрованный пароль.
        }
    }
}
