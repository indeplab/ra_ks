$.storelist = function(options){
    if (options && typeof options.success == "function") options.success([]);
}
$.storesave = function(options){
    if (options && typeof options.success == "function") options.success();
}
$.storeopen = function(options){
    if (options && typeof options.success == "function") options.success({data:{}});
}
$.storemerge = function(options){
    if (options && typeof options.success == "function") options.success();
}
$.storedelete = function(options){
    if (options && typeof options.success == "function") options.success();
}
var getSystemList = function(options){
    if (options && typeof options.success == "function") options.success([]);
}
var getSystemFunctionList = function(options){
    if (options && typeof options.success == "function") options.success([]);
}
var getSystemDataList = function(options){
    if (options && typeof options.success == "function") options.success([]);
}
var getSystemInterfaceList = function(options){
    if (options && typeof options.success == "function") options.success([]);
}
var getSystemComponentList = function(options){
    if (options && typeof options.success == "function") options.success([]);
}
var getDictionaryItems = function(options){
    let res=[];
    if(options.name){
        switch(options.name){
            case "Каталог сред исполнения":
                res=[
                    {label:'.Net',name:'.Net',value:'.Net',id:1,description:''},
                    {label:'.Net Core',name:'.Net Core',value:'.Net Core',id:2,description:''},
                    {label:'.Net Framework',name:'.Net Framework',value:'.Net Framework',id:3,description:''},
                    {label:'Apache',name:'Apache',value:'Apache',id:4,description:''},
                    {label:'ASP.NET',name:'ASP.NET',value:'ASP.NET',id:5,description:''},
                    {label:'Base Commander',name:'Base Commander',value:'Base Commander',id:6,description:''},
                    {label:'Browser',name:'Browser',value:'Browser',id:7,description:''},
                    {label:'Camel',name:'Camel',value:'Camel',id:8,description:''},
                    {label:'Chromium',name:'Chromium',value:'Chromium',id:9,description:''},
                    {label:'Docker',name:'Docker',value:'Docker',id:10,description:''},
                    {label:'FIS Application Services',name:'FIS Application Services',value:'FIS Application Services',id:11,description:''},
                    {label:'GlassFish',name:'GlassFish',value:'GlassFish',id:12,description:''},
                    {label:'Hadoop',name:'Hadoop',value:'Hadoop',id:13,description:''},
                    {label:'Hazelcast',name:'Hazelcast',value:'Hazelcast',id:14,description:''},
                    {label:'IBM API Connect',name:'IBM API Connect',value:'IBM API Connect',id:15,description:''},
                    {label:'IBM InfoSphere Information Server',name:'IBM InfoSphere Information Server',value:'IBM InfoSphere Information Server',id:16,description:''},
                    {label:'IBM Lotus Domino',name:'IBM Lotus Domino',value:'IBM Lotus Domino',id:17,description:''},
                    {label:'IBM WebSphere Application Server',name:'IBM WebSphere Application Server',value:'IBM WebSphere Application Server',id:18,description:''},
                    {label:'IIS',name:'IIS',value:'IIS',id:19,description:''},
                    {label:'JavaScript',name:'JavaScript',value:'JavaScript',id:20,description:''},
                    {label:'JBoss',name:'JBoss',value:'JBoss',id:21,description:''},
                    {label:'JDK',name:'JDK',value:'JDK',id:22,description:''},
                    {label:'Jetty',name:'Jetty',value:'Jetty',id:23,description:''},
                    {label:'JRE',name:'JRE',value:'JRE',id:24,description:''},
                    {label:'Kestrel',name:'Kestrel',value:'Kestrel',id:25,description:''},
                    {label:'Kubernetes',name:'Kubernetes',value:'Kubernetes',id:26,description:''},
                    {label:'MobileIron Client',name:'MobileIron Client',value:'MobileIron Client',id:27,description:''},
                    {label:'Netty',name:'Netty',value:'Netty',id:28,description:''},
                    {label:'Nginx',name:'Nginx',value:'Nginx',id:29,description:''},
                    {label:'Node.js',name:'Node.js',value:'Node.js',id:30,description:''},
                    {label:'OpenShift',name:'OpenShift',value:'OpenShift',id:31,description:''},
                    {label:'Oracle WebLogic Server',name:'Oracle WebLogic Server',value:'Oracle WebLogic Server',id:32,description:''},
                    {label:'Perl',name:'Perl',value:'Perl',id:33,description:''},
                    {label:'PHP',name:'PHP',value:'PHP',id:34,description:''},
                    {label:'Python',name:'Python',value:'Python',id:35,description:''},
                    {label:'ReactJS',name:'ReactJS',value:'ReactJS',id:36,description:''},
                    {label:'RP Server',name:'RP Server',value:'RP Server',id:37,description:''},
                    {label:'SharePoint',name:'SharePoint',value:'SharePoint',id:38,description:''},
                    {label:'Spring Boot',name:'Spring Boot',value:'Spring Boot',id:39,description:''},
                    {label:'Spring Cloud',name:'Spring Cloud',value:'Spring Cloud',id:40,description:''},
                    {label:'Spring Framework',name:'Spring Framework',value:'Spring Framework',id:41,description:''},
                    {label:'Tomcat',name:'Tomcat',value:'Tomcat',id:42,description:''},
                    {label:'Undertow',name:'Undertow',value:'Undertow',id:43,description:''},
                    {label:'Vue.js',name:'Vue.js',value:'Vue.js',id:44,description:''},
                    {label:'WildFly',name:'WildFly',value:'WildFly',id:45,description:''},
                    {label:'Oracle GoldenGate',name:'Oracle GoldenGate',value:'Oracle GoldenGate',id:46,description:''},
                    {label:'Camunda',name:'Camunda',value:'Camunda',id:47,description:''},
                    {label:'Apache Kafka',name:'Apache Kafka',value:'Apache Kafka',id:48,description:''},
                    {label:'Rabbit MQ',name:'Rabbit MQ',value:'Rabbit MQ',id:49,description:''},
                    {label:'Spring WebFlux',name:'Spring WebFlux',value:'Spring WebFlux',id:50,description:''},
                    {label:'IBM WebSphere Message Broker',name:'IBM WebSphere Message Broker',value:'IBM WebSphere Message Broker',id:51,description:''},
                    {label:'IBM MQ',name:'IBM MQ',value:'IBM MQ',id:52,description:''},
                    {label:'IBM DataPower',name:'IBM DataPower',value:'IBM DataPower',id:53,description:''},
                    {label:'SAS Marketing Automation',name:'SAS Marketing Automation',value:'SAS Marketing Automation',id:54,description:''},
                    {label:'SAS Real-time Decision Manager',name:'SAS Real-time Decision Manager',value:'SAS Real-time Decision Manager',id:55,description:''},
                    {label:'Active MQ',name:'Active MQ',value:'Active MQ',id:56,description:''},
                    {label:'Firco',name:'Firco',value:'Firco',id:57,description:''},
                    {label:'Bitrix',name:'Bitrix',value:'Bitrix',id:58,description:''},
                    {label:'Next.js',name:'Next.js',value:'Next.js',id:59,description:''},
                    {label:'Cloudera',name:'Cloudera',value:'Cloudera',id:60,description:''},
                    {label:'CRM Infor',name:'CRM Infor',value:'CRM Infor',id:61,description:''},
                    {label:'Pentaho',name:'Pentaho',value:'Pentaho',id:62,description:''},
                    {label:'SAS GCM',name:'SAS GCM',value:'SAS GCM',id:63,description:''},
                    {label:'SAS OpRisk',name:'SAS OpRisk',value:'SAS OpRisk',id:64,description:''},
                    {label:'SAP Business Objects',name:'SAP Business Objects',value:'SAP Business Objects',id:65,description:''},
                    {label:'SonarCube',name:'SonarCube',value:'SonarCube',id:66,description:''},
                    {label:'Selenoid',name:'Selenoid',value:'Selenoid',id:67,description:''},
                    {label:'AeroKube',name:'AeroKube',value:'AeroKube',id:68,description:''},
                    {label:'HashiCorp Vault',name:'HashiCorp Vault',value:'HashiCorp Vault',id:69,description:''},
                    {label:'Qlik Sense',name:'Qlik Sense',value:'Qlik Sense',id:70,description:''},
                    {label:'Abbyy FineReader',name:'Abbyy FineReader',value:'Abbyy FineReader',id:71,description:''}
                ];
            break;
            case "Каталог ОС":
                res=[
                    {label:'Windows Server',name:'Windows Server',value:'Windows Server',id:'',description:''},
                    {label:'Windows',name:'Windows',value:'Windows',id:'',description:''},
                    {label:'Debian',name:'Debian',value:'Debian',id:'',description:''},
                    {label:'AIX',name:'AIX',value:'AIX',id:'',description:''},
                    {label:'Ubuntu',name:'Ubuntu',value:'Ubuntu',id:'',description:''},
                    {label:'CentOS',name:'CentOS',value:'CentOS',id:'',description:''},
                    {label:'Astra Linux SE',name:'Astra Linux SE',value:'Astra Linux SE',id:'',description:''},
                    {label:'Desktops',name:'Desktops',value:'Desktops',id:'',description:''},
                    {label:'RHEL',name:'RHEL',value:'RHEL',id:'',description:''},
                    {label:'Debian',name:'Debian',value:'Debian',id:'',description:''},
                    {label:'Linux',name:'Linux',value:'Linux',id:'',description:''},
                    {label:'Android',name:'Android',value:'Android',id:'',description:''},
                    {label:'iOS',name:'iOS',value:'iOS',id:'',description:''},
                    {label:'Enterprise Linux (RHEL)',name:'Enterprise Linux (RHEL)',value:'Enterprise Linux (RHEL)',id:'',description:''},
                    {label:'Windows Server',name:'Windows Server',value:'Windows Server',id:'',description:''},
                    {label:'Windows DataCenter',name:'Windows DataCenter',value:'Windows DataCenter',id:'',description:''},
                    {label:'Windows',name:'Windows',value:'Windows',id:'',description:''},
                    {label:'Vision Edge OS',name:'Vision Edge OS',value:'Vision Edge OS',id:'',description:''},
                    {label:'CloudLens vTap OS',name:'CloudLens vTap OS',value:'CloudLens vTap OS',id:'',description:''},
                    {label:'IBM i',name:'IBM i',value:'IBM i',id:'',description:''},
                    {label:'AIX',name:'AIX',value:'AIX',id:'',description:''},
                    {label:'HP-UX',name:'HP-UX',value:'HP-UX',id:'',description:''},
                    {label:'NAS OS 13.x',name:'NAS OS 13.x',value:'NAS OS 13.x',id:'',description:''}
                ];
                break;
            case "Каталог платформ управления контейнерами":
                res=[
                    {label:'Openshift',name:'Openshift',value:'Openshift',id:'',description:''},
                    {label:'Kubernetes',name:'Kubernetes',value:'Kubernetes',id:'',description:''}
                ];
                break;
            case "Каталог средств контейнеризации":
                res=[
                    {label:'Docker',name:'Docker',value:'Docker',id:'',description:''}
                ];
                break;
            case "Каталог БД":
                res=[
                    {label:'ArangoDB',name:'ArangoDB',value:'ArangoDB',id:'',description:''},
                    {label:'Awdb',name:'Awdb',value:'Awdb',id:'',description:''},
                    {label:'Base Commander',name:'Base Commander',value:'Base Commander',id:'',description:''},
                    {label:'CRONOS',name:'CRONOS',value:'CRONOS',id:'',description:''},
                    {label:'Db2',name:'Db2',value:'Db2',id:'',description:''},
                    {label:'Druid',name:'Druid',value:'Druid',id:'',description:''},
                    {label:'FoxPro',name:'FoxPro',value:'FoxPro',id:'',description:''},
                    {label:'FreeSql',name:'FreeSql',value:'FreeSql',id:'',description:''},
                    {label:'Hazelcast',name:'Hazelcast',value:'Hazelcast',id:'',description:''},
                    {label:'HDS',name:'HDS',value:'HDS',id:'',description:''},
                    {label:'Impala',name:'Impala',value:'Impala',id:'',description:''},
                    {label:'InterBase',name:'InterBase',value:'InterBase',id:'',description:''},
                    {label:'Lotus Notes',name:'Lotus Notes',value:'Lotus Notes',id:'',description:''},
                    {label:'MariaDB',name:'MariaDB',value:'MariaDB',id:'',description:''},
                    {label:'MinIO',name:'MinIO',value:'MinIO',id:'',description:''},
                    {label:'MongoDB',name:'MongoDB',value:'MongoDB',id:'',description:''},
                    {label:'MS Access',name:'MS Access',value:'MS Access',id:'',description:''},
                    {label:'MS SQL',name:'MS SQL',value:'MS SQL',id:'',description:''},
                    {label:'MySQL',name:'MySQL',value:'MySQL',id:'',description:''},
                    {label:'ODS',name:'ODS',value:'ODS',id:'',description:''},
                    {label:'OpenDJ',name:'OpenDJ',value:'OpenDJ',id:'',description:''},
                    {label:'OpenLDAP',name:'OpenLDAP',value:'OpenLDAP',id:'',description:''},
                    {label:'Oracle',name:'Oracle',value:'Oracle',id:'',description:''},
                    {label:'Paradox',name:'Paradox',value:'Paradox',id:'',description:''},
                    {label:'Pervasive PSQL',name:'Pervasive PSQL',value:'Pervasive PSQL',id:'',description:''},
                    {label:'Postgres Pro',name:'Postgres Pro',value:'Postgres Pro',id:'',description:''},
                    {label:'PostgreSQL',name:'PostgreSQL',value:'PostgreSQL',id:'',description:''},
                    {label:'Redis',name:'Redis',value:'Redis',id:'',description:''},
                    {label:'SAP IQ',name:'SAP IQ',value:'SAP IQ',id:'',description:''},
                    {label:'Sybase',name:'Sybase',value:'Sybase',id:'',description:''},
                    {label:'Tarantool',name:'Tarantool',value:'Tarantool',id:'',description:''},
                    {label:'Vertica',name:'Vertica',value:'Vertica',id:'',description:''},
                    {label:'Встроенная',name:'Встроенная',value:'Встроенная',id:'',description:''},
                    {label:'Ред База Данных',name:'Ред База Данных',value:'Ред База Данных',id:'',description:''},
                    {label:'ClickHouse',name:'ClickHouse',value:'ClickHouse',id:'',description:''}
                ];
                break;
            case "Каталог сред разработки":
                res=[
                    {label:'.Net',name:'.Net',value:'.Net',id:'',description:''},
                    {label:'.Net Core',name:'.Net Core',value:'.Net Core',id:'',description:''},
                    {label:'.Net Framework',name:'.Net Framework',value:'.Net Framework',id:'',description:''},
                    {label:'1С',name:'1С',value:'1С',id:'',description:''},
                    {label:'Ajax',name:'Ajax',value:'Ajax',id:'',description:''},
                    {label:'ASP.NET',name:'ASP.NET',value:'ASP.NET',id:'',description:''},
                    {label:'Bitrix Framework',name:'Bitrix Framework',value:'Bitrix Framework',id:'',description:''},
                    {label:'Bootstrap',name:'Bootstrap',value:'Bootstrap',id:'',description:''},
                    {label:'C#',name:'C#',value:'C#',id:'',description:''},
                    {label:'C++',name:'C++',value:'C++',id:'',description:''},
                    {label:'Delphi',name:'Delphi',value:'Delphi',id:'',description:''},
                    {label:'DHTMLX',name:'DHTMLX',value:'DHTMLX',id:'',description:''},
                    {label:'FoxPro',name:'FoxPro',value:'FoxPro',id:'',description:''},
                    {label:'Go',name:'Go',value:'Go',id:'',description:''},
                    {label:'Groovy',name:'Groovy',value:'Groovy',id:'',description:''},
                    {label:'HTML',name:'HTML',value:'HTML',id:'',description:''},
                    {label:'IBM GatewayScript',name:'IBM GatewayScript',value:'IBM GatewayScript',id:'',description:''},
                    {label:'IBM RPG',name:'IBM RPG',value:'IBM RPG',id:'',description:''},
                    {label:'IIB',name:'IIB',value:'IIB',id:'',description:''},
                    {label:'Java',name:'Java',value:'Java',id:'',description:''},
                    {label:'JavaScript',name:'JavaScript',value:'JavaScript',id:'',description:''},
                    {label:'jQuery',name:'jQuery',value:'jQuery',id:'',description:''},
                    {label:'Kotlin',name:'Kotlin',value:'Kotlin',id:'',description:''},
                    {label:'LotusScript',name:'LotusScript',value:'LotusScript',id:'',description:''},
                    {label:'Perl',name:'Perl',value:'Perl',id:'',description:''},
                    {label:'PHP',name:'PHP',value:'PHP',id:'',description:''},
                    {label:'PL/SQL',name:'PL/SQL',value:'PL/SQL',id:'',description:''},
                    {label:'Python',name:'Python',value:'Python',id:'',description:''},
                    {label:'React Native',name:'React Native',value:'React Native',id:'',description:''},
                    {label:'ReactJS',name:'ReactJS',value:'ReactJS',id:'',description:''},
                    {label:'Report Designer',name:'Report Designer',value:'Report Designer',id:'',description:''},
                    {label:'RP Server',name:'RP Server',value:'RP Server',id:'',description:''},
                    {label:'Ruby',name:'Ruby',value:'Ruby',id:'',description:''},
                    {label:'SAS',name:'SAS',value:'SAS',id:'',description:''},
                    {label:'Spring Boot',name:'Spring Boot',value:'Spring Boot',id:'',description:''},
                    {label:'SQL',name:'SQL',value:'SQL',id:'',description:''},
                    {label:'Swift',name:'Swift',value:'Swift',id:'',description:''},
                    {label:'Tornado',name:'Tornado',value:'Tornado',id:'',description:''},
                    {label:'Transact-SQL',name:'Transact-SQL',value:'Transact-SQL',id:'',description:''},
                    {label:'Visual Basic',name:'Visual Basic',value:'Visual Basic',id:'',description:''},
                    {label:'XML',name:'XML',value:'XML',id:'',description:''},
                    {label:'Erlang',name:'Erlang',value:'Erlang',id:'',description:''},
                    {label:'Firco',name:'Firco',value:'Firco',id:'',description:''}
                ];
                break;
            case "Каталог проектов":
                res=[
                    {label:'GazpromPay',name:'GazpromPay',value:'GazpromPay',id:'',description:''},
                    {label:'VS Единый Транспортный Шлюз Коммуникаций (ЕТШК)',name:'VS Единый Транспортный Шлюз Коммуникаций (ЕТШК)',value:'VS Единый Транспортный Шлюз Коммуникаций (ЕТШК)',id:'',description:''},
                    {label:'VS Инвестиции',name:'VS Инвестиции',value:'VS Инвестиции',id:'',description:''},
                    {label:'VS Розничная АБС',name:'VS Розничная АБС',value:'VS Розничная АБС',id:'',description:''},
                    {label:'VS Collection',name:'VS Collection',value:'VS Collection',id:'',description:''},
                    {label:'VS CRM',name:'VS CRM',value:'VS CRM',id:'',description:''},
                    {label:'VS Daily banking',name:'VS Daily banking',value:'VS Daily banking',id:'',description:''},
                    {label:'VS Digital Platform',name:'VS Digital Platform',value:'VS Digital Platform',id:'',description:''},
                    {label:'VS Premium',name:'VS Premium',value:'VS Premium',id:'',description:''},
                    {label:'VS Авто',name:'VS Авто',value:'VS Авто',id:'',description:''},
                    {label:'VS ГПБ Мобайл',name:'VS ГПБ Мобайл',value:'VS ГПБ Мобайл',id:'',description:''},
                    {label:'VS Инвестиции',name:'VS Инвестиции',value:'VS Инвестиции',id:'',description:''},
                    {label:'VS Ипотека',name:'VS Ипотека',value:'VS Ипотека',id:'',description:''},
                    {label:'VS Кредитные карты',name:'VS Кредитные карты',value:'VS Кредитные карты',id:'',description:''},
                    {label:'VS Пассивные и некредитные продукты',name:'VS Пассивные и некредитные продукты',value:'VS Пассивные и некредитные продукты',id:'',description:''},
                    {label:'VS Платформенный стрим Ядро ОКП',name:'VS Платформенный стрим Ядро ОКП',value:'VS Платформенный стрим Ядро ОКП',id:'',description:''},
                    {label:'VS Потребительское кредитование',name:'VS Потребительское кредитование',value:'VS Потребительское кредитование',id:'',description:''},
                    {label:'VS Сайт',name:'VS Сайт',value:'VS Сайт',id:'',description:''},
                    {label:'VS Сбережения',name:'VS Сбережения',value:'VS Сбережения',id:'',description:''},
                    {label:'VS Эквайринг и Платежи',name:'VS Эквайринг и Платежи',value:'VS Эквайринг и Платежи',id:'',description:''},
                    {label:'VS Экосистема',name:'VS Экосистема',value:'VS Экосистема',id:'',description:''},
                    {label:'VS Эффективный офис и КЦ',name:'VS Эффективный офис и КЦ',value:'VS Эффективный офис и КЦ',id:'',description:''},
                    {label:'VS Ядро ОКП',name:'VS Ядро ОКП',value:'VS Ядро ОКП',id:'',description:''},
                    {label:'VS Ядро процессинг',name:'VS Ядро процессинг',value:'VS Ядро процессинг',id:'',description:''},
                    {label:'Безбумажный офис',name:'Безбумажный офис',value:'Безбумажный офис',id:'',description:''},
                    {label:'Газпромбанк Мероприятия',name:'Газпромбанк Мероприятия',value:'Газпромбанк Мероприятия',id:'',description:''},
                    {label:'ЕБС-Единый биометрический сервис',name:'ЕБС-Единый биометрический сервис',value:'ЕБС-Единый биометрический сервис',id:'',description:''},
                    {label:'Интеграция Банка с подпиской «Огонь»',name:'Интеграция Банка с подпиской «Огонь»',value:'Интеграция Банка с подпиской «Огонь»',id:'',description:''},
                    {label:'Интеграция с Газпром ID (ГИД)',name:'Интеграция с Газпром ID (ГИД)',value:'Интеграция с Газпром ID (ГИД)',id:'',description:''},
                    {label:'Кибербезопасность',name:'Кибербезопасность',value:'Кибербезопасность',id:'',description:''},
                    {label:'Корпоративный кредитный процесс',name:'Корпоративный кредитный процесс',value:'Корпоративный кредитный процесс',id:'',description:''},
                    {label:'Монетизация',name:'Монетизация',value:'Монетизация',id:'',description:''},
                    {label:'Новая ИТ-инфраструктура',name:'Новая ИТ-инфраструктура',value:'Новая ИТ-инфраструктура',id:'',description:''},
                    {label:'ОКС',name:'ОКС',value:'ОКС',id:'',description:''},
                    {label:'Омниканальная платформа',name:'Омниканальная платформа',value:'Омниканальная платформа',id:'',description:''},
                    {label:'Онбординг',name:'Онбординг',value:'Онбординг',id:'',description:''},
                    {label:'Платформа лояльности ГПБ',name:'Платформа лояльности ГПБ',value:'Платформа лояльности ГПБ',id:'',description:''},
                    {label:'Программа лояльности для Межрегионгаз',name:'Программа лояльности для Межрегионгаз',value:'Программа лояльности для Межрегионгаз',id:'',description:''},
                    {label:'ПЦ',name:'ПЦ',value:'ПЦ',id:'',description:''},
                    {label:'Развитие финансового управления',name:'Развитие финансового управления',value:'Развитие финансового управления',id:'',description:''},
                    {label:'Розничкая технологическая платформа (Сеть партнерств)',name:'Розничкая технологическая платформа (Сеть партнерств)',value:'Розничкая технологическая платформа (Сеть партнерств)',id:'',description:''},
                    {label:'Технологическая платформа рисков',name:'Технологическая платформа рисков',value:'Технологическая платформа рисков',id:'',description:''},
                    {label:'Технологическая трансформация Performance-маркетинг',name:'Технологическая трансформация Performance-маркетинг',value:'Технологическая трансформация Performance-маркетинг',id:'',description:''},
                    {label:'Транспортный проект GorodPay',name:'Транспортный проект GorodPay',value:'Транспортный проект GorodPay',id:'',description:''},
                    {label:'Трансформация Performance',name:'Трансформация Performance',value:'Трансформация Performance',id:'',description:''},
                    {label:'Трансформация ИТ 3.0',name:'Трансформация ИТ 3.0',value:'Трансформация ИТ 3.0',id:'',description:''},
                    {label:'Трансформация операционной модели',name:'Трансформация операционной модели',value:'Трансформация операционной модели',id:'',description:''},
                    {label:'Трансформация платформ',name:'Трансформация платформ',value:'Трансформация платформ',id:'',description:''},
                    {label:'Трансформация розницы (ЧББ)',name:'Трансформация розницы (ЧББ)',value:'Трансформация розницы (ЧББ)',id:'',description:''},
                    {label:'Трансформация транзакционного бизнеса',name:'Трансформация транзакционного бизнеса',value:'Трансформация транзакционного бизнеса',id:'',description:''},
                    {label:'Трансформация эквайринга',name:'Трансформация эквайринга',value:'Трансформация эквайринга',id:'',description:''},
                    {label:'Управление клиентскими отношениями',name:'Управление клиентскими отношениями',value:'Управление клиентскими отношениями',id:'',description:''},
                    {label:'Управление корпоративными данными',name:'Управление корпоративными данными',value:'Управление корпоративными данными',id:'',description:''},
                    {label:'Управление человеческим капиталом',name:'Управление человеческим капиталом',value:'Управление человеческим капиталом',id:'',description:''},
                    {label:'Ценообразование',name:'Ценообразование',value:'Ценообразование',id:'',description:''},
                    {label:'Цифровой рубль',name:'Цифровой рубль',value:'Цифровой рубль',id:'',description:''},
                    {label:'Эффективное производство ИТ',name:'Эффективное производство ИТ',value:'Эффективное производство ИТ',id:'',description:''},
                    {label:'VS СЦП',name:'VS СЦП',value:'VS СЦП',id:'',description:''}
                ];
                break;
            case "Каталог сетевых сегментов":
                res=[
                    {label:'EXT-Egress-Prod',name:'EXT-Egress-Prod',value:'EXT-Egress-Prod',id:'53',color:'',description:'Внешний продуктивный серверный Сегмент ЧО с доступом в сеть Интернет'},
                    {label:'EXT-Ingress-Prod',name:'EXT-Ingress-Prod',value:'EXT-Ingress-Prod',id:'54',color:'',description:'Внешний продуктивный серверный Сегмент ЧО с доступом в/из сеть Интернет'},
                    {label:'EXT-Test',name:'EXT-Test',value:'EXT-Test',id:'55',color:'',description:'Внешний тестовый серверный Сегмент ЧО'},
                    {label:'EXT-Infra',name:'EXT-Infra',value:'EXT-Infra',id:'56',color:'',description:'Внешний инфраструктурный Сегмент ЧО'},
                    {label:'EXT-Mgmt',name:'EXT-Mgmt',value:'EXT-Mgmt',id:'57',color:'',description:'Внешний серверный Сегмент управления ЧО'},
                    {label:'EXT-WOTA-Prod',name:'EXT-WOTA-Prod',value:'EXT-WOTA-Prod',id:'58',color:'',description:'Внешний продуктивный серверный Сегмент ЧО с доступом в/из сеть Интернет без типового доступа к Инфраструктурным сервисам'},
                    {label:'EXT-WOTA-Test',name:'EXT-WOTA-Test',value:'EXT-WOTA-Test',id:'59',color:'',description:'Внешний тестовый серверный Сегмент ЧО с доступом в/из сеть Интернет без типового доступа к Инфраструктурным сервисам'},
                    {label:'EXT-WOTA-Mgmt',name:'EXT-WOTA-Mgmt',value:'EXT-WOTA-Mgmt',id:'60',color:'',description:'Внешний серверный Сегмент управления ЧО без типового доступа к Инфраструктурным сервисам'},
                    {label:'EXT-Egress-Prod-DZI',name:'EXT-Egress-Prod-DZI',value:'EXT-Egress-Prod-DZI',id:'61',color:'',description:'Внешний продуктивный серверный Сегмент Блока ИБ с доступом в сеть Интернет'},
                    {label:'EXT-Ingress-Prod-DZI',name:'EXT-Ingress-Prod-DZI',value:'EXT-Ingress-Prod-DZI',id:'62',color:'',description:'Внешний продуктивный серверный Сегмент Блока ИБ с доступом в/из сети Интернет'},
                    {label:'EXT-Test-DZI',name:'EXT-Test-DZI',value:'EXT-Test-DZI',id:'63',color:'',description:'Внешний тестовый серверный Сегмент Блока ИБ'},
                    {label:'EXT-Infra-DZI',name:'EXT-Infra-DZI',value:'EXT-Infra-DZI',id:'64',color:'',description:'Внешний инфраструктурный Сегмент Блока ИБ'},
                    {label:'EXT-Mgmt-DZI',name:'EXT-Mgmt-DZI',value:'EXT-Mgmt-DZI',id:'65',color:'',description:'Внешний серверный Сегмент управления Блока ИБ'},
                    {label:'EXT-WOTA-Prod-DZI',name:'EXT-WOTA-Prod-DZI',value:'EXT-WOTA-Prod-DZI',id:'66',color:'',description:'Внешний продуктивный серверный Сегмент Блока ИБ без типового доступа к Инфраструктурным сервисам'},
                    {label:'EXT-WOTA-Test-DZI',name:'EXT-WOTA-Test-DZI',value:'EXT-WOTA-Test-DZI',id:'67',color:'',description:'Внешний тестовый серверный Сегмент Блока ИБ без типового доступа к Инфраструктурным сервисам'},
                    {label:'EXT-WOTA-Mgmt-DZI',name:'EXT-WOTA-Mgmt-DZI',value:'EXT-WOTA-Mgmt-DZI',id:'68',color:'',description:'Внешний тестовый серверный Сегмент Блока ИБ без типового доступа к Инфраструктурным сервисам'},
                    {label:'EXT-CAgents',name:'EXT-CAgents',value:'EXT-CAgents',id:'69',color:'',description:'Внешний серверный Сегмент для Контрагентов'},
                    {label:'EXT-FDMZ',name:'EXT-FDMZ',value:'EXT-FDMZ',id:'70',color:'',description:'Внешний серверный Сегмент ЧО для систем филиалов в инфраструктуре ГО'},
                    {label:'EXT-Prod-CRD',name:'EXT-Prod-CRD',value:'EXT-Prod-CRD',id:'71',color:'#fff5d6',description:'Внешний продуктивный серверный Сегмент ПЦ с доступом в/из сеть Интернет'},
                    {label:'EXT-Test-CRD',name:'EXT-Test-CRD',value:'EXT-Test-CRD',id:'72',color:'',description:'Внешний тестовый серверный Сегмент ПЦ с доступом в/из сети Интернет'},
                    {label:'EXT-Mgmt-CRD',name:'EXT-Mgmt-CRD',value:'EXT-Mgmt-CRD',id:'73',color:'',description:'Внешний серверный Сегмент управления ПЦ'},
                    {label:'EXT-WOTA-Prod-CRD',name:'EXT-WOTA-Prod-CRD',value:'EXT-WOTA-Prod-CRD',id:'74',color:'',description:'Внешний продуктивный серверный Сегмент ПЦ с доступом в/из сеть Интернет без типового доступа к Инфраструктурным сервисам'},
                    {label:'EXT-WOTA-Test-CRD',name:'EXT-WOTA-Test-CRD',value:'EXT-WOTA-Test-CRD',id:'75',color:'',description:'Внешний тестовый серверный Сегмент ПЦ с доступом в/из сеть Интернет без типового доступа к Инфраструктурным сервисам'},
                    {label:'EXT-WOTA-Mgmt-CRD',name:'EXT-WOTA-Mgmt-CRD',value:'EXT-WOTA-Mgmt-CRD',id:'76',color:'',description:'Внешний серверный Сегмент управления ПЦ без типового доступа к Инфраструктурным сервисам'},
                    {label:'EXT-WOTA-Mgmt-Test-CRD',name:'EXT-WOTA-Mgmt-Test-CRD',value:'EXT-WOTA-Mgmt-Test-CRD',id:'77',color:'',description:'Внешний тестовый серверный Сегмент управления ПЦ без типового доступа к Инфраструктурным сервисам'},
                    {label:'INTDMZ-Prod',name:'INTDMZ-Prod',value:'INTDMZ-Prod',id:'78',color:'',description:'Внутренний продуктивный серверный Сегмент ЧО меньшего уровня доверия'},
                    {label:'INTDMZ-Test',name:'INTDMZ-Test',value:'INTDMZ-Test',id:'79',color:'',description:'Внутренний тестовый серверный Сегмент ЧО меньшего уровня доверия'},
                    {label:'INTDMZ-Infra',name:'INTDMZ-Infra',value:'INTDMZ-Infra',id:'80',color:'',description:'Внутренний инфраструктурный Сегмент ЧО меньшего уровня доверия'},
                    {label:'INTDMZ-WOTA-Prod',name:'INTDMZ-WOTA-Prod',value:'INTDMZ-WOTA-Prod',id:'81',color:'#f5d7d7',description:'Внутренний продуктивный серверный Сегмент ЧО меньшего уровня доверия без доступа к Инфраструктурным сервисам'},
                    {label:'INTDMZ-WOTA-Test',name:'INTDMZ-WOTA-Test',value:'INTDMZ-WOTA-Test',id:'82',color:'',description:'Внутренний тестовый серверный Сегмент ЧО меньшего уровня доверия без доступа к Инфраструктурным сервисам'},
                    {label:'INTDMZ-Prod-DZI',name:'INTDMZ-Prod-DZI',value:'INTDMZ-Prod-DZI',id:'83',color:'',description:'Внутренний продуктивный серверный Сегмент Блока ИБ меньшего уровня доверия'},
                    {label:'INTDMZ-Test-DZI',name:'INTDMZ-Test-DZI',value:'INTDMZ-Test-DZI',id:'84',color:'',description:'Внутренний тестовый серверный Сегмент Блока ИБ меньшего уровня доверия'},
                    {label:'INTDMZ-Infra-DZI',name:'INTDMZ-Infra-DZI',value:'INTDMZ-Infra-DZI',id:'85',color:'',description:'Внутренний инфраструктурный Сегмент Блока ИБ меньшего уровня доверия'},
                    {label:'INTDMZ-WOTA-Prod-DZI',name:'INTDMZ-WOTA-Prod-DZI',value:'INTDMZ-WOTA-Prod-DZI',id:'86',color:'#abebed',description:'Внутренний продуктивный серверный Сегмент Блока ИБ меньшего уровня доверия без доступа к Инфраструктурным сервисам'},
                    {label:'INTDMZ-WOTA-Test-DZI',name:'INTDMZ-WOTA-Test-DZI',value:'INTDMZ-WOTA-Test-DZI',id:'87',color:'',description:'Внутренний тестовый серверный Сегмент Блока ИБ меньшего уровня доверия без доступа к Инфраструктурным сервисам'},
                    {label:'INTDMZ-Prod-CRD',name:'INTDMZ-Prod-CRD',value:'INTDMZ-Prod-CRD',id:'88',color:'#b9fac7',description:'Внутренний продуктивный серверный Сегмент ПЦ меньшего уровня доверия'},
                    {label:'INTDMZ-Test-CRD',name:'INTDMZ-Test-CRD',value:'INTDMZ-Test-CRD',id:'89',color:'',description:'Внутренний тестовый серверный Сегмент ПЦ меньшего уровня доверия'},
                    {label:'INTDMZ-WOTA-Prod-CRD',name:'INTDMZ-WOTA-Prod-CRD',value:'INTDMZ-WOTA-Prod-CRD',id:'90',color:'',description:'Внутренний продуктивный серверный Сегмент ПЦ меньшего уровня доверия без доступа к Инфраструктурным сервисам'},
                    {label:'INTDMZ-WOTA-Test-CRD',name:'INTDMZ-WOTA-Test-CRD',value:'INTDMZ-WOTA-Test-CRD',id:'91',color:'',description:'Внутренний тестовый серверный Сегмент ПЦ меньшего уровня доверия без доступа к Инфраструктурным сервисам'},
                    {label:'INTDMZ-FINT',name:'INTDMZ-FINT',value:'INTDMZ-FINT',id:'92',color:'#e5e6cf',description:'Внутренний серверный Сегмент ЧО для систем филиалов в инфраструктуре ГО'},
                    {label:'INT-Prod',name:'INT-Prod',value:'INT-Prod',id:'93',color:'#fff5d6',description:'Внутренний продуктивный серверный Сегмент ЧО'},
                    {label:'INT-Test',name:'INT-Test',value:'INT-Test',id:'94',color:'',description:'Внутренний тестовый серверный Сегмент ЧО'},
                    {label:'INT-Infra',name:'INT-Infra',value:'INT-Infra',id:'95',color:'#c19fd6',description:'Внутренний инфраструктурный Сегмент ЧО'},
                    {label:'INT-Mgmt',name:'INT-Mgmt',value:'INT-Mgmt',id:'96',color:'',description:'Внутренний Сегмент управления ЧО'},
                    {label:'INT-Prod-DZI',name:'INT-Prod-DZI',value:'INT-Prod-DZI',id:'97',color:'',description:'Внутренний продуктивный серверный Сегмент Блока ИБ'},
                    {label:'INT-Test-DZI',name:'INT-Test-DZI',value:'INT-Test-DZI',id:'98',color:'',description:'Внутренний тестовый серверный Сегмент Блока ИБ'},
                    {label:'INT-Infra-DZI',name:'INT-Infra-DZI',value:'INT-Infra-DZI',id:'99',color:'',description:'Внутренний инфраструктурный Сегмент Блока ИБ'},
                    {label:'INT-Mgmt-DZI',name:'INT-Mgmt-DZI',value:'INT-Mgmt-DZI',id:'100',color:'',description:'Внутренний Сегмент управления Блока ИБ'},
                    {label:'INT-CAgents',name:'INT-CAgents',value:'INT-CAgents',id:'101',color:'',description:'Внутренний серверный Сегмент для Контрагентов'},
                    {label:'INT-Prod-CRD',name:'INT-Prod-CRD',value:'INT-Prod-CRD',id:'102',color:'#fae6a0',description:'Внутренний продуктивный серверный Сегмент ПЦ'},
                    {label:'INT-Test-CRD',name:'INT-Test-CRD',value:'INT-Test-CRD',id:'103',color:'',description:'Внутренний тестовый серверный Сегмент ПЦ'},
                    {label:'INT-Mgmt-CRD',name:'INT-Mgmt-CRD',value:'INT-Mgmt-CRD',id:'104',color:'',description:'Внутренний серверный Сегмент управления ПЦ'},
                    {label:'INT-WOTA-Prod-CRD',name:'INT-WOTA-Prod-CRD',value:'INT-WOTA-Prod-CRD',id:'105',color:'#e7ffc7',description:'Внутренний продуктивный серверный Сегмент ПЦ без типового доступа к Инфраструктурным сервисам'},
                    {label:'INT-WOTA-Test-CRD',name:'INT-WOTA-Test-CRD',value:'INT-WOTA-Test-CRD',id:'106',color:'',description:'Внутренний тестовый серверный Сегмент ПЦ без типового доступа к Инфраструктурным сервисам'},
                    {label:'INT-WOTA-Mgmt-CRD',name:'INT-WOTA-Mgmt-CRD',value:'INT-WOTA-Mgmt-CRD',id:'107',color:'',description:'Внутренний серверный Сегмент управления ПЦ без типового доступа к Инфраструктурным сервисам'},
                    {label:'INT-WOTA-Mgmt-Test-CRD',name:'INT-WOTA-Mgmt-Test-CRD',value:'INT-WOTA-Mgmt-Test-CRD',id:'108',color:'',description:'Внутренний тестовый серверный Сегмент управления ПЦ без типового доступа к Инфраструктурным сервисам'},
                    {label:'INT-VDI-Employee',name:'INT-VDI-Employee',value:'INT-VDI-Employee',id:'109',color:'#f5f7ed',description:'Внутренний Сегмент VDI для Работников Банка'},
                    {label:'INT-VDI-Contractors',name:'INT-VDI-Contractors',value:'INT-VDI-Contractors',id:'110',color:'',description:'Внутренний Сегмент VDI для подрядчиков'},
                    {label:'INT-ARM-Employee',name:'INT-ARM-Employee',value:'INT-ARM-Employee',id:'111',color:'',description:'Внутренний Сегмент АРМ для Работников Банка'},
                    {label:'INT-ARM-CAgents',name:'INT-ARM-CAgents',value:'INT-ARM-CAgents',id:'112',color:'',description:'Внутренний Сегмент АРМ для Контрагентов'},
                    {label:'INT-Term',name:'INT-Term',value:'INT-Term',id:'113',color:'',description:'Внутренний Сегмент СТД'},
                    {label:'EXT-ARM-Employee',name:'EXT-ARM-Employee',value:'EXT-ARM-Employee',id:'114',color:'',description:'Внешний Сегмент АРМ для Работников Банка'},
                    {label:'EXT-ARM-CAgents',name:'EXT-ARM-CAgents',value:'EXT-ARM-CAgents',id:'115',color:'',description:'Внешний Сегмент АРМ для Контрагентов'},
                    {label:'EXT-Term',name:'EXT-Term',value:'EXT-Term',id:'116',color:'',description:'Внешний Сегмент СТД'},
                    {label:'EXT-Tech',name:'EXT-Tech',value:'EXT-Tech',id:'117',color:'',description:'Внешние Технологические Сегменты'},
                    {label:'INT-Tech',name:'INT-Tech',value:'INT-Tech',id:'118',color:'',description:'Внутренние Технологические Сегменты'},
                    {label:'Внешняя ДМЗ с доступом в сеть Интернет',name:'Внешняя ДМЗ с доступом в сеть Интернет',value:'Внешняя ДМЗ с доступом в сеть Интернет',id:'119',color:'',description:''},
                    {label:'Внешняя ДМЗ с доступом в/из сети Интернет',name:'Внешняя ДМЗ с доступом в/из сети Интернет',value:'Внешняя ДМЗ с доступом в/из сети Интернет',id:'120',color:'',description:''},
                    {label:'Внешняя ДМЗ Блока ИБ',name:'Внешняя ДМЗ Блока ИБ',value:'Внешняя ДМЗ Блока ИБ',id:'121',color:'',description:''},
                    {label:'Внешняя ДМЗ разработки/тестирования',name:'Внешняя ДМЗ разработки/тестирования',value:'Внешняя ДМЗ разработки/тестирования',id:'122',color:'',description:''},
                    {label:'Внешняя ДМЗ инфраструктуры',name:'Внешняя ДМЗ инфраструктуры',value:'Внешняя ДМЗ инфраструктуры',id:'123',color:'',description:''},
                    {label:'Внешняя ДМЗ Контрагентов',name:'Внешняя ДМЗ Контрагентов',value:'Внешняя ДМЗ Контрагентов',id:'124',color:'',description:''},
                    {label:'Внешний сегмент управления оборудованием',name:'Внешний сегмент управления оборудованием',value:'Внешний сегмент управления оборудованием',id:'125',color:'',description:''},
                    {label:'WAN',name:'WAN',value:'WAN',id:'126',color:'#fff5d6',description:'Внешний пользовательский сегмент'},
                    {label:'Внутренняя ДМЗ разработки/тестирования',name:'Внутренняя ДМЗ разработки/тестирования',value:'Внутренняя ДМЗ разработки/тестирования',id:'127',color:'',description:''},
                    {label:'Внутренняя ДМЗ Блока ИБ',name:'Внутренняя ДМЗ Блока ИБ',value:'Внутренняя ДМЗ Блока ИБ',id:'128',color:'',description:''},
                    {label:'Внутренняя ДМЗ Контрагентов',name:'Внутренняя ДМЗ Контрагентов',value:'Внутренняя ДМЗ Контрагентов',id:'129',color:'',description:''},
                    {label:'Внутренний промышленный сегмент за МСЭ',name:'Внутренний промышленный сегмент за МСЭ',value:'Внутренний промышленный сегмент за МСЭ',id:'130',color:'',description:''},
                    {label:'Внутренний промышленный серверный сегмент',name:'Внутренний промышленный серверный сегмент',value:'Внутренний промышленный серверный сегмент',id:'131',color:'',description:''},
                    {label:'Внутренний тестовый серверный сегмент',name:'Внутренний тестовый серверный сегмент',value:'Внутренний тестовый серверный сегмент',id:'132',color:'',description:''},
                    {label:'Внутренний сегмент разработки',name:'Внутренний сегмент разработки',value:'Внутренний сегмент разработки',id:'133',color:'',description:''},
                    {label:'Внутренний сегмент Контрагентов',name:'Внутренний сегмент Контрагентов',value:'Внутренний сегмент Контрагентов',id:'134',color:'',description:''},
                    {label:'Внутренний сегмент для презентаций систем и пилотных проектов',name:'Внутренний сегмент для презентаций систем и пилотных проектов',value:'Внутренний сегмент для презентаций систем и пилотных проектов',id:'135',color:'',description:''},
                    {label:'Внутренний промышленный сегмент Блока ИБ',name:'Внутренний промышленный сегмент Блока ИБ',value:'Внутренний промышленный сегмент Блока ИБ',id:'136',color:'',description:''},
                    {label:'Внутренний сегмент управления',name:'Внутренний сегмент управления',value:'Внутренний сегмент управления',id:'137',color:'',description:''},
                    {label:'Внутренний сегмент управления Блока ИБ',name:'Внутренний сегмент управления Блока ИБ',value:'Внутренний сегмент управления Блока ИБ',id:'138',color:'',description:''},
                    {label:'Внутренний пользовательский сегмент для Работников Банка',name:'Внутренний пользовательский сегмент для Работников Банка',value:'Внутренний пользовательский сегмент для Работников Банка',id:'139',color:'',description:''},
                    {label:'Внутренний пользовательский сегмент для подрядчиков',name:'Внутренний пользовательский сегмент для подрядчиков',value:'Внутренний пользовательский сегмент для подрядчиков',id:'140',color:'',description:''},
                    {label:'Внутренний сегмент для групп сопровождения',name:'Внутренний сегмент для групп сопровождения',value:'Внутренний сегмент для групп сопровождения',id:'141',color:'',description:''},
                    {label:'Контур приемки',name:'Контур приемки',value:'Контур приемки',id:'142',color:'',description:''},
                    {label:'Сети филиалов',name:'Сети филиалов',value:'Сети филиалов',id:'143',color:'',description:''},
                    {label:'Внешний сегмент СТД',name:'Внешний сегмент СТД',value:'Внешний сегмент СТД',id:'144',color:'',description:''},
                    {label:'Внутренний сегмент СТД',name:'Внутренний сегмент СТД',value:'Внутренний сегмент СТД',id:'145',color:'',description:''},
                    {label:'Технологические сегменты',name:'Технологические сегменты',value:'Технологические сегменты',id:'146',color:'',description:''},
                    {label:'INT-Infra-TU',name:'INT-Infra-TU',value:'INT-Infra-TU',id:'147',color:'',description:'Внутренний серверный сегмент управления за МСЭ ТУ'},
                    {label:'INT-Mgmt-TU',name:'INT-Mgmt-TU',value:'INT-Mgmt-TU',id:'148',color:'',description:'Внутренний тестовый серверный сегмент за МСЭ ТУ'},
                    {label:'INT-Prod-TU',name:'INT-Prod-TU',value:'INT-Prod-TU',id:'149',color:'',description:'Внутренний продуктивный серверный сегмент за МСЭ ТУ'},
                    {label:'INT-Test-TU',name:'INT-Test-TU',value:'INT-Test-TU',id:'150',color:'',description:'Внутренний инфраструктурный сегмент за МСЭ ТУ'},
                    {label:'WAN-Infra',name:'WAN-Infra',value:'WAN-Infra',id:'151',color:'',description:'Внешний инфраструктурный сегмент за МСЭ WAN TU'},
                    {label:'WAN-Mgmt',name:'WAN-Mgmt',value:'WAN-Mgmt',id:'152',color:'',description:'Внешний сегмент управления за МСЭ WAN TU'},
                    {label:'WAN-Prod',name:'WAN-Prod',value:'WAN-Prod',id:'153',color:'#f2736f',description:'Внешний продуктивный серверный сегмент за МСЭ WAN TU'},
                    {label:'WAN-Test',name:'WAN-Test',value:'WAN-Test',id:'154',color:'',description:'Внешний тестовый серверный сегмент за МСЭ WAN TU'}
                ];
                break;
            case "Каталог типов АС":
                res=[
                    {label:'Программный комплекс',name:'Программный комплекс',value:'Программный комплекс',id:'',description:''},
                    {label:'Функциональный модуль',name:'Функциональный модуль',value:'Функциональный модуль',id:'',description:''},
                    {label:'Интеграционная платформа',name:'Интеграционная платформа',value:'Интеграционная платформа',id:'',description:''},
                    {label:'База данных',name:'База данных',value:'База данных',id:'',description:''},
                    {label:'Внешняя система',name:'Внешняя система',value:'Внешняя система',id:'',description:''},
                    {label:'Агрегация',name:'Агрегация',value:'Агрегация',id:'',description:''}
                ];
                break;
            case "Каталог классов критичности":
                res=[
                    {label:'MC',name:'MC',value:'MC',id:'',description:'Mission Critical\nСистемы непрерывного действия для обеспечения реализации особо важных (критичных) бизнес-процессов. Сбой таких систем выводит из строя, парализует работу всего комплекса информационных систем или оказывает существенное влияние на функционирование Банка'},
                    {label:'BC',name:'BC',value:'BC',id:'',description:'Business Critical\nСистемы, обеспечивающие эффективное выполнение бизнес-процессов компании'},
                    {label:'BO',name:'BO',value:'BO',id:'',description:'Business Operational\nСистемы, используются бизнесом для увеличения его эффективности, но их отключение не приведет к высоким финансовым потерям'},
                    {label:'OP',name:'OP',value:'OP',id:'',description:'Office Productivity\nСистемы внутреннего использования, обеспечивающие эффективность выполнения офисных операций, но их отключение не приведет к существенным финансовым потерям'}
                ]
                break;
            case "Каталог времен восстановления":
                res=[
                    {label:'RC1',name:'RC1',value:'RC1',id:'',description:'Very High Speed\nСистемы, недоступность которых оказывает немедленное негативное влияние на способность Банком выполнять свои базовые функции'},
                    {label:'RC2',name:'RC2',value:'RC2',id:'',description:'High Speed\nСистемы, недоступность которых оказывает немедленное негативное влияние на способность Банком получать доходы, или оказывает критическое влияние на эффективность работы большого количества сотрудников Банка'},
                    {label:'RC3',name:'RC3',value:'RC3',id:'',description:'Medium Speed\nСистемы, недоступность которых влияет на невозможность получения доходов в долгосрочной перспективе, или существенно влияет на эффективность работы большого количества сотрудников Банка'},
                    {label:'RC4',name:'RC4',value:'RC4',id:'',description:'Low Speed\nВсе остальные системы'}
                ];
                break;
            case "Каталог режимов функционирования":
                res=[
                    {label:'NS',name:'NS',value:'NS',id:'',description:'ИТ-система, не сопровождаемая ИТ'},
                    {label:'8x5',name:'8x5',value:'8x5',id:'',description:'ИТ-система, сопровождаемая ИТ в режиме 8х5 в рамках временной зоны MSK'},
                    {label:'24x7',name:'24x7',value:'24x7',id:'',description:'ИТ-система, сопровождаемая ИТ в режиме 24х7'},
                    {label:'24x7+',name:'24x7+',value:'24x7+',id:'',description:'ИТ-система, сопровождаемая ИТ в режиме 24х7 + поддержка 3-го уровня в режиме 24х7'},
                    {label:'EXT8x5',name:'EXT8x5',value:'EXT8x5',id:'',description:'ИТ-система, сопровождаемая ИТ в режиме 8х5 по всем временным зонам работы офисов'},
                    {label:'Hhxd ',name:'Hhxd ',value:'Hhxd ',id:'',description:'ИТ-система, сопровождаемая ИТ в режиме hh часов в сутки d дней в неделю в рамках временной зоны MSK'},
                    {label:'hhxd TZt',name:'hhxd TZt',value:'hhxd TZt',id:'',description:'ИТ-система, сопровождаемая ИТ в режиме hh часов в сутки d дней в неделю в рамках временной зоны t'}
                ];
                break;
            case "Каталог жизненных циклов":
                res=[
                    {label:'OUT',name:'OUT',value:'OUT',id:'',description:'Неперспективная (устаревшая)\nИТ-система, архитектура которой не отвечает текущим стандартам ИТ-индустрии или платформа которой не поддерживается производителем'},
                    {label:'CUR',name:'CUR',value:'CUR',id:'',description:'Текущая (действующая)\nИТ-система, архитектура и платформа которой удовлетворяет текущим стандартам ИТ Банка'},
                    {label:'PER',name:'PER',value:'PER',id:'',description:'Перспективная\nИТ-система, архитектура и платформа которой удовлетворяет текущим стандартам ИТ Банка и учитывает тенденции развития ИТ-индустрии на долгосрочную перспективу'}
                ];
                break;
            case "Каталог сертификации":
                res=[
                    {label:'NC',name:'NC',value:'NC',id:'',description:'Не сертифицированная ИТ\nИТ-система, предполагающая использование оборудования или системного ПО, не включенного в стандарты ИТ Банка'},
                    {label:'PC',name:'PC',value:'PC',id:'',description:'Частично сертифицированная ИТ\nИТ-система, отдельные компоненты которой предполагают использование оборудования или системного ПО, не включенного в стандарты ИТ Банка'},
                    {label:'FC',name:'FC',value:'FC',id:'',description:'Сертифицированная ИТ\nИТ-система, все компоненты которой предполагают использование стандартного для ИТ Банка оборудования и системного ПО'}
                ];
                break;
            case "Каталог уровней мониторинга":
                res=[
                    {label:'NM',name:'NM',value:'NM',id:'',description:'Нет мониторинга\nИТ-система, не подлежащая автоматическому мониторингу'},
                    {label:'AC',name:'AC',value:'AC',id:'',description:'Мониторинг доступности\nИТ-система, компоненты которой автоматически мониторятся на предмет физической доступности по сети (ping)'},
                    {label:'TM',name:'TM',value:'TM',id:'',description:'Технический мониторинг\nИТ-система является объектом мониторинга технического состояния оборудования (загрузка процессора, потребление памяти, производительность дисковых операций, количество процессов и т.п.). В том числе реализован мониторинг уровня AC'},
                    {label:'FM',name:'FM',value:'FM',id:'',description:'Функциональный мониторинг\nИТ-система является объектом комплексного автоматического мониторинга, способного с минимальной задержкой определить недоступность системы для конечного пользователя и предпринять корректирующие воздействия. Производится мониторинг бизнес-метрик операций в системе. В том числе реализован мониторинг уровня TM, AC'},
                    {label:'CM',name:'CM',value:'CM',id:'',description:'CUSTOM\nИТ-система, для мониторинга которой применяются нестандартные средства мониторинга'}
                ];
                break;
            case "Каталог категорий пользователей":
                res=[
                    {label:'NCI',name:'NCI',value:'NCI',id:'',description:'Без пользовательского интерфейса\nИТ-система, не обладающая пользовательским интерфейсом'},
                    {label:'HO',name:'HO',value:'HO',id:'',description:'Сотрудники Головного Офиса\nИТ-система, пользователями которой являются сотрудники ГО'},
                    {label:'FO',name:'FO',value:'FO',id:'',description:'Сотрудники филиалов\nИТ-система, пользователями которой являются сотрудники иногородних филиалов'},
                    {label:'EC',name:'EC',value:'EC',id:'',description:'Внешние пользователи\nИТ-система, пользователи которой не являются сотрудниками Банка'}
                ];
                break;
            case "Каталог масштабируемости":
                res=[
                    {label:'VM',name:'VM',value:'VM',id:'',description:'Вертикальное масштабирование\nИТ-система масштабируется за счет замены компонентов на более производительные'},
                    {label:'GM',name:'GM',value:'GM',id:'',description:'Горизонтальное масштабирование\nАрхитектура системы позволяет увеличивать ее производительность путем добавления параллельных компонентов с возможностью балансировки нагрузки между компонентами'}
                ];
                break;
            case "Каталог типов обработки отказов":
                res=[
                    {label:'DT',name:'DT',value:'DT',id:'',description:'Disaster Tolerance\nНаряду с защитой от сбоев в пределах одного центра данных (FT), обеспечивает полное дублирование оборудования на удаленных площадках и автоматическое восстановление работоспособности ИТ-системы в резервных центрах данных (автоматическое пере-ключение на резервное оборудование)'},
                    {label:'DR',name:'DR',value:'DR',id:'',description:'Disaster Recovery\nОбеспечивает полное дублирование оборудования на двух и бо-лее площадках и ручное восстановление работоспособности ИТ-системы в резервных центрах данных (ручное переключение на резервное оборудование)'},
                    {label:'FT',name:'FT',value:'FT',id:'',description:'Fault Tolernace\nОбеспечивает полное дублирование оборудования в пределах одного центра данных и автоматическое восстановление работоспособности ИТ-системы&nbsp; (автоматическое переключение на резервное оборудование)'},
                    {label:'HA',name:'HA',value:'HA',id:'',description:'High Availability\nОбеспечивает частичное дублирование оборудования (без дублирования системы хранения данных) в пределах одного центра данных и автоматическое/ручное восстановление работоспособности ИТ-системы (автоматическое/ручное переключение на ре-зервное оборудование)'},
                    {label:'BR',name:'BR',value:'BR',id:'',description:'Backup Recovery\nСистема не обеспечивает обработку отказов компонентов с помощью автоматических или ручных процедур перехода на резерв. Система может быть приведена в работоспособное состояние путем физической замены нерезервированных компонентов с последующим восстановлением из резервной копии настроек/данных'},
                    {label:'NA',name:'NA',value:'NA',id:'',description:'Не обрабатывает отказы\nСистема не обеспечивает обработку отказов компонентов с помощью автоматических или ручных процедур перехода на резерв. Создание резервных копий настроек/данных компонент для ручного восстановления не осуществляется'}
                ];
                break;
            case "Каталог типов развертывания":
                res=[
                    {label:'SA',name:'SA',value:'SA',id:'',description:'Обособленное приложение\nТребуется развертывание системы на каждой рабочей станции; данные физически располагаются на рабочей станции'},
                    {label:'RC',name:'RC',value:'RC',id:'',description:'Толстый (декстопный) клиент\nТребуется развертывание системы на каждой рабочей станции; данные физически располагаются на централизованном сервере'},
                    {label:'WC',name:'WC',value:'WC',id:'',description:'Web-клиент\nИспользуется полноценный «тонкий» веб-клиент для доступа пользователей, логика обработки и хранение данных реализовано на выделенных серверах (сервере)'},
                    {label:'MC',name:'MC',value:'MC',id:'',description:'Мобильный клиент\nИспользуется нативный клиент мобильной ОС. Требуется установка приложения на каждое устройство'},
                    {label:'IS',name:'IS',value:'IS',id:'',description:'Инфраструктурный сервис\nРазвертывание только серверной инфраструктуры. Пользовательский интерфейс отсутствует'}
                ];
                break;
            case "Каталог типов взаимодействий":
                res=[
                    {label:'Синхронное',name:'Синхронное',value:'Синхронное',id:'',description:''},
                    {label:'Асинхронное',name:'Асинхронное',value:'Асинхронное',id:'',description:''},
                    {label:'Псевдосинхронное',name:'Псевдосинхронное',value:'Псевдосинхронное',id:'',description:''},
                    {label:'Псевдоасинхронное',name:'Псевдоасинхронное',value:'Псевдоасинхронное',id:'',description:''},
                    {label:'По подписке/ широковещательно',name:'По подписке/ широковещательно',value:'По подписке/ широковещательно',id:'',description:''},
                    {label:'По подписке/ таргетированно',name:'По подписке/ таргетированно',value:'По подписке/ таргетированно',id:'',description:''},
                    {label:'Пакетное/ ETL',name:'Пакетное/ ETL',value:'Пакетное/ ETL',id:'',description:''},
                    {label:'Пакетное/ Файлы',name:'Пакетное/ Файлы',value:'Пакетное/ Файлы',id:'',description:''}
                ];
                break;
            case "Каталог интеграционных интерфейсов":
                res=[
                    {label:'HTTPS',name:'HTTPS',value:'HTTPS',id:'',description:''},
                    {label:'MQ tls',name:'MQ tls',value:'MQ tls',id:'',description:''},
                    {label:'Kafka',name:'Kafka',value:'Kafka',id:'',description:''},
                    {label:'REST',name:'REST',value:'REST',id:'',description:''},
                    {label:'JDBC',name:'JDBC',value:'JDBC',id:'',description:''},
                    {label:'SOAP',name:'SOAP',value:'SOAP',id:'',description:''},
                    {label:'DBLink',name:'DBLink',value:'DBLink',id:'',description:''},
                    {label:'ISO8583',name:'ISO8583',value:'ISO8583',id:'',description:''},
                    {label:'HTTP',name:'HTTP',value:'HTTP',id:'',description:''},
                    {label:'SMB/файл',name:'SMB/файл',value:'SMB/файл',id:'',description:''},
                    {label:'Oracle Native',name:'Oracle Native',value:'Oracle Native',id:'',description:''},
                    {label:'SMTP',name:'SMTP',value:'SMTP',id:'',description:''},
                    {label:'NFS',name:'NFS',value:'NFS',id:'',description:''},
                    {label:'SFTP',name:'SFTP',value:'SFTP',id:'',description:''},
                    {label:'NDC+',name:'NDC+',value:'NDC+',id:'',description:''},
                    {label:'TCP/IP',name:'TCP/IP',value:'TCP/IP',id:'',description:''},
                    {label:'Way4',name:'Way4',value:'Way4',id:'',description:''},
                    {label:'ODBC',name:'ODBC',value:'ODBC',id:'',description:''},
                    {label:'TMS',name:'TMS',value:'TMS',id:'',description:''},
                    {label:'ICAP',name:'ICAP',value:'ICAP',id:'',description:''},
                    {label:'LDAP/LDAPS',name:'LDAP/LDAPS',value:'LDAP/LDAPS',id:'',description:''},
                    {label:'RADIUS',name:'RADIUS',value:'RADIUS',id:'',description:''},
                    {label:'IMAPS',name:'IMAPS',value:'IMAPS',id:'',description:''},
                    {label:'TLS',name:'TLS',value:'TLS',id:'',description:''},
                    {label:'GRE',name:'GRE',value:'GRE',id:'',description:''},
                    {label:'SNMP',name:'SNMP',value:'SNMP',id:'',description:''},
                    {label:'SPAN',name:'SPAN',value:'SPAN',id:'',description:''},
                    {label:'MRCP',name:'MRCP',value:'MRCP',id:'',description:''},
                    {label:'Protobuf',name:'Protobuf',value:'Protobuf',id:'',description:''},
                    {label:'RTP',name:'RTP',value:'RTP',id:'',description:''},
                    {label:'SIP',name:'SIP',value:'SIP',id:'',description:''},
                    {label:'SSH',name:'SSH',value:'SSH',id:'',description:''},
                    {label:'SMPP',name:'SMPP',value:'SMPP',id:'',description:''},
                    {label:'Адаптер СУВ',name:'Адаптер СУВ',value:'Адаптер СУВ',id:'',description:''},
                    {label:'POP3',name:'POP3',value:'POP3',id:'',description:''},
                    {label:'ws',name:'ws',value:'ws',id:'',description:''},
                    {label:'wss',name:'wss',value:'wss',id:'',description:''},
                    {label:'websock',name:'websock',value:'websock',id:'',description:''},
                    {label:'syslog',name:'syslog',value:'syslog',id:'',description:''},
                    {label:'FIX',name:'FIX',value:'FIX',id:'',description:''},
                    {label:'RPC',name:'RPC',value:'RPC',id:'',description:''},
                    {label:'JRPC',name:'JRPC',value:'JRPC',id:'',description:''},
                    {label:'gRPC',name:'gRPC',value:'gRPC',id:'',description:''},
                    {label:'ASTS Bridge',name:'ASTS Bridge',value:'ASTS Bridge',id:'',description:''},
                    {label:'UDP',name:'UDP',value:'UDP',id:'',description:''},
                    {label:'SAML',name:'SAML',value:'SAML',id:'',description:''},
                    {label:'SRTP',name:'SRTP',value:'SRTP',id:'',description:''},
                    {label:'XMPP',name:'XMPP',value:'XMPP',id:'',description:''},
                    {label:'Kerberos',name:'Kerberos',value:'Kerberos',id:'',description:''}
                ];
                break;
            case "Каталог методов сервиса":
                res=[
                    {label:'GET',name:'GET',value:'GET',id:'',description:''},
                    {label:'POST',name:'POST',value:'POST',id:'',description:''},
                    {label:'GET/POST',name:'GET/POST',value:'GET/POST',id:'',description:''},
                    {label:'PUT',name:'PUT',value:'PUT',id:'',description:''},
                    {label:'DELETE',name:'DELETE',value:'DELETE',id:'',description:''}
                ];
                break;
            case "Каталог интеграционных платформ":
                res=[
                    {label:'АС СИП',name:'АС СИП',value:'АС СИП',id:'',description:''},
                    {label:'P2P',name:'P2P',value:'P2P',id:'',description:''},
                    {label:'Общая папка',name:'Общая папка',value:'Общая папка',id:'',description:''},
                    {label:'SWGate',name:'SWGate',value:'SWGate',id:'',description:''},
                    {label:'ПШ',name:'ПШ',value:'ПШ',id:'',description:''},
                    {label:'СУВ',name:'СУВ',value:'СУВ',id:'',description:''},
                    {label:'ИШ ПЦ',name:'ИШ ПЦ',value:'ИШ ПЦ',id:'',description:''},
                    {label:'РИШ ПЦ',name:'РИШ ПЦ',value:'РИШ ПЦ',id:'',description:''},
                    {label:'ИШ ДБО',name:'ИШ ДБО',value:'ИШ ДБО',id:'',description:''},
                    {label:'Перекладчик ОМНИ',name:'Перекладчик ОМНИ',value:'Перекладчик ОМНИ',id:'',description:''},
                    {label:'ОТС ГДС',name:'ОТС ГДС',value:'ОТС ГДС',id:'',description:''},
                    {label:'GPB API',name:'GPB API',value:'GPB API',id:'',description:''},
                    {label:'ETL',name:'ETL',value:'ETL',id:'',description:''},
                    {label:'Перекладчик АС ГДУ',name:'Перекладчик АС ГДУ',value:'Перекладчик АС ГДУ',id:'',description:''},
                    {label:'ActiveMQ',name:'ActiveMQ',value:'ActiveMQ',id:'',description:''},
                    {label:'АС СПР 2.0. Kafka',name:'АС СПР 2.0. Kafka',value:'АС СПР 2.0. Kafka',id:'',description:''},
                    {label:'ОТСГДС',name:'ОТСГДС',value:'ОТСГДС',id:'',description:''}
                ];
                break;
            case "Каталог статусов документа":
                res=[
                    {stateid:"1",state:'Разработка',statecolor:'#d30202',ord:0,statecanedit:1,statenext:"2"}
                ];
                break;
            case "Каталог типов платформ":
                res=[
                    {label:'Операционная система',name:'Операционная система',value:'Операционная система',id:'',description:'Операционная система'},
                    {label:'Оборудование или программно аппаратный комплекс',name:'Оборудование или программно аппаратный комплекс',value:'Оборудование или программно аппаратный комплекс',id:'',description:'Оборудование или программно аппаратный комплекс'},
                    {label:'Платформа управления контейнерами',name:'Платформа управления контейнерами',value:'Платформа управления контейнерами',id:'',description:'Платформа управления контейнерами'},
                    {label:'Софт прикладной',name:'Софт прикладной',value:'Софт прикладной',id:'',description:'Софт прикладной'},
                    {label:'Софт системный',name:'Софт системный',value:'Софт системный',id:'',description:'Софт системный'},
                    {label:'СУБД',name:'СУБД',value:'СУБД',id:'',description:'СУБД'},
                    {label:'Средство контейнеризации',name:'Средство контейнеризации',value:'Средство контейнеризации',id:'',description:'Средство контейнеризации'},
                    {label:'Среда разработки / библиотека / инструмент разработчика',name:'Среда разработки / библиотека / инструмент разработчика',value:'Среда разработки / библиотека / инструмент разработчика',id:'',description:'Среда разработки / библиотека / инструмент разработчика'},
                    {label:'Операционная система СУБД',name:'Операционная система СУБД',value:'Операционная система СУБД',id:'',description:'Операционная система СУБД'}
                ];
                break;
            case "Каталог классификаторов безопасности":
                res=[
                    {label:'КТ',name:'КТ',value:'КТ',id:'',description:'Коммерческая тайна'},
                    {label:'БТ',name:'БТ',value:'БТ',id:'',description:'Банковская тайна'},
                    {label:'К',name:'К',value:'К',id:'',description:'Конфиденциально'},
                    {label:'ДПК',name:'ДПК',value:'ДПК',id:'',description:'Данные платежных карт'},
                    {label:'ПДО',name:'ПДО',value:'ПДО',id:'',description:'ПДн общедоступные'},
                    {label:'ПДБ',name:'ПДБ',value:'ПДБ',id:'',description:'ПДн биометрические'},
                    {label:'ПДС',name:'ПДС',value:'ПДС',id:'',description:'ПДн специальные'},
                    {label:'ПДИ',name:'ПДИ',value:'ПДИ',id:'',description:'ПДн иные'},
                    {label:'ОИ',name:'ОИ',value:'ОИ',id:'',description:'Открытая информация'}
                ];
                break;
            case "Каталог ПОД":
                res=[
                    {pod1:'АХД',pod2:'',value:'АХД#',id:'8'},
                    {pod1:'БЕЗОПАСНОСТЬ',pod2:'',value:'БЕЗОПАСНОСТЬ#',id:'9'},
                    {pod1:'БУХГАЛТЕРСКИЙ УЧЕТ',pod2:'',value:'БУХГАЛТЕРСКИЙ УЧЕТ#',id:'10'},
                    {pod1:'ВЗЫСКАНИЕ',pod2:'ВЗЫСКАНИЕ ФЛ',value:'ВЗЫСКАНИЕ#ВЗЫСКАНИЕ ФЛ',id:'11'},
                    {pod1:'ВЗЫСКАНИЕ',pod2:'ВЗЫСКАНИЕ ЮЛ',value:'ВЗЫСКАНИЕ#ВЗЫСКАНИЕ ЮЛ',id:'12'},
                    {pod1:'ГЕОДАННЫЕ',pod2:'',value:'ГЕОДАННЫЕ#',id:'13'},
                    {pod1:'ДОКУМЕНТООБОРОТ',pod2:'',value:'ДОКУМЕНТООБОРОТ#',id:'14'},
                    {pod1:'ДОКУМЕНТЫ КЛИЕНТА',pod2:'',value:'ДОКУМЕНТЫ КЛИЕНТА#',id:'15'},
                    {pod1:'ИТ АКТИВЫ',pod2:'',value:'ИТ АКТИВЫ#',id:'16'},
                    {pod1:'КОММУНИКАЦИИ',pod2:'',value:'КОММУНИКАЦИИ#',id:'17'},
                    {pod1:'ЛОГИСТИКА',pod2:'',value:'ЛОГИСТИКА#',id:'18'},
                    {pod1:'МАРКЕТИНГ И БРЕНД-МЕНЕДЖМЕНТ',pod2:'',value:'МАРКЕТИНГ И БРЕНД-МЕНЕДЖМЕНТ#',id:'19'},
                    {pod1:'НЕДВИЖИМОСТЬ',pod2:'',value:'НЕДВИЖИМОСТЬ#',id:'20'},
                    {pod1:'ОБЕСПЕЧЕНИЕ',pod2:'',value:'ОБЕСПЕЧЕНИЕ#',id:'21'},
                    {pod1:'ОРГСТРУКТУРА/КАДРЫ',pod2:'',value:'ОРГСТРУКТУРА/КАДРЫ#',id:'22'},
                    {pod1:'ПРОЧЕЕ',pod2:'',value:'ПРОЧЕЕ#',id:'23'},
                    {pod1:'РИСКИ',pod2:'',value:'РИСКИ#',id:'24'},
                    {pod1:'СДЕЛКА',pod2:'ПРОЧЕЕ',value:'СДЕЛКА#ПРОЧЕЕ',id:'25'},
                    {pod1:'СДЕЛКА',pod2:'АККРЕДИТИВЫ ФЛ',value:'СДЕЛКА#АККРЕДИТИВЫ ФЛ',id:'26'},
                    {pod1:'СДЕЛКА',pod2:'КАРТЫ ФЛ',value:'СДЕЛКА#КАРТЫ ФЛ',id:'27'},
                    {pod1:'СДЕЛКА',pod2:'КРАТКОСРОЧНОЕ КРЕДИТОВАНИЕ ЮЛ',value:'СДЕЛКА#КРАТКОСРОЧНОЕ КРЕДИТОВАНИЕ ЮЛ',id:'28'},
                    {pod1:'СДЕЛКА',pod2:'КРЕДИТЫ ФЛ',value:'СДЕЛКА#КРЕДИТЫ ФЛ',id:'29'},
                    {pod1:'СОБЫТИЯ',pod2:'',value:'СОБЫТИЯ#',id:'30'},
                    {pod1:'СУБЪЕКТ',pod2:'СУБЪЕКТ ФЛ',value:'СУБЪЕКТ#СУБЪЕКТ ФЛ',id:'31'},
                    {pod1:'СУБЪЕКТ',pod2:'СУБЪЕКТ ЮЛ',value:'СУБЪЕКТ#СУБЪЕКТ ЮЛ',id:'32'},
                    {pod1:'ТРАНЗАКЦИОННЫЙ КОНТРОЛЬ',pod2:'',value:'ТРАНЗАКЦИОННЫЙ КОНТРОЛЬ#',id:'33'},
                    {pod1:'УПРАВЛЕНЧЕСКИЙ УЧЕТ',pod2:'',value:'УПРАВЛЕНЧЕСКИЙ УЧЕТ#',id:'34'},
                    {pod1:'УСЛУГИ',pod2:'ПРОЧЕЕ',value:'УСЛУГИ#ПРОЧЕЕ',id:'35'},
                    {pod1:'УСЛУГИ',pod2:'БРОКЕРСКОЕ ОБСЛУЖИВАНИЕ ФЛ',value:'УСЛУГИ#БРОКЕРСКОЕ ОБСЛУЖИВАНИЕ ФЛ',id:'36'},
                    {pod1:'УСЛУГИ',pod2:'ИНВЕСТИЦИОННОЕ КОНСУЛЬТИРОВАНИЕ ФЛ',value:'УСЛУГИ#ИНВЕСТИЦИОННОЕ КОНСУЛЬТИРОВАНИЕ ФЛ',id:'37'},
                    {pod1:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ',pod2:'ТОРГОВЫЕ ОПЕРАЦИИ НА ВАЛЮТНОМ, ДЕНЕЖНОМ, ДОЛГОВОМ И ДОЛЕВОМ РЫНКАХ',value:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ#ТОРГОВЫЕ ОПЕРАЦИИ НА ВАЛЮТНОМ, ДЕНЕЖНОМ, ДОЛГОВОМ И ДОЛЕВОМ РЫНКАХ',id:'38'},
                    {pod1:'ПРОЧИЕ ДОКУМЕНТЫ',pod2:'',value:'ПРОЧИЕ ДОКУМЕНТЫ#',id:'39'},
                    {pod1:'МЕРОПРИЯТИЯ',pod2:'',value:'МЕРОПРИЯТИЯ#',id:'40'},
                    {pod1:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ',pod2:'ПРОЧЕЕ',value:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ#ПРОЧЕЕ',id:'41'},
                    {pod1:'СУБЪЕКТ',pod2:'ОБЩИЕ',value:'СУБЪЕКТ#ОБЩИЕ',id:'42'},
                    {pod1:'КОМПЛАЕНС',pod2:'',value:'КОМПЛАЕНС#',id:'43'},
                    {pod1:'СДЕЛКА',pod2:'КАРТЫ ЮЛ',value:'СДЕЛКА#КАРТЫ ЮЛ',id:'44'},
                    {pod1:'СДЕЛКА',pod2:'РКО ФЛ',value:'СДЕЛКА#РКО ФЛ',id:'45'},
                    {pod1:'СДЕЛКА',pod2:'РКО ЮЛ',value:'СДЕЛКА#РКО ЮЛ',id:'46'},
                    {pod1:'СДЕЛКА',pod2:'ФИНАНСИРОВАНИЕ НЕДВИЖИМОСТИ',value:'СДЕЛКА#ФИНАНСИРОВАНИЕ НЕДВИЖИМОСТИ',id:'47'},
                    {pod1:'СДЕЛКА',pod2:'ЭЛЕКТРОННАЯ БАНКОВСКАЯ ГАРАНТИЯ',value:'СДЕЛКА#ЭЛЕКТРОННАЯ БАНКОВСКАЯ ГАРАНТИЯ',id:'48'},
                    {pod1:'УСЛУГИ',pod2:'АГЕНТСКИЕ УСЛУГИ ПО ВЫПЛАТЕ ДОХОДОВ ПО ЦЕННЫМ БУМАГАМ',value:'УСЛУГИ#АГЕНТСКИЕ УСЛУГИ ПО ВЫПЛАТЕ ДОХОДОВ ПО ЦЕННЫМ БУМАГАМ',id:'49'},
                    {pod1:'УСЛУГИ',pod2:'БРОКЕРСКОЕ ОБСЛУЖИВАНИЕ ЮЛ',value:'УСЛУГИ#БРОКЕРСКОЕ ОБСЛУЖИВАНИЕ ЮЛ',id:'50'},
                    {pod1:'УСЛУГИ',pod2:'ДЕПОЗИТАРНЫЕ УСЛУГИ',value:'УСЛУГИ#ДЕПОЗИТАРНЫЕ УСЛУГИ',id:'51'},
                    {pod1:'УСЛУГИ',pod2:'ПАРТНЁРСКИЕ ПРОГРАММЫ ПО ПРОДАЖЕ СТРАХОВОК',value:'УСЛУГИ#ПАРТНЁРСКИЕ ПРОГРАММЫ ПО ПРОДАЖЕ СТРАХОВОК',id:'52'},
                    {pod1:'УСЛУГИ',pod2:'РОЗНИЧНЫЕ ПАРТНЕРСКИЕ ПРОДУКТЫ',value:'УСЛУГИ#РОЗНИЧНЫЕ ПАРТНЕРСКИЕ ПРОДУКТЫ',id:'53'},
                    {pod1:'УСЛУГИ',pod2:'СЕЙФОВЫЕ ЯЧЕЙКИ',value:'УСЛУГИ#СЕЙФОВЫЕ ЯЧЕЙКИ',id:'54'},
                    {pod1:'УСЛУГИ',pod2:'СОПРОВОЖДЕНИЕ КОНТРАКТОВ',value:'УСЛУГИ#СОПРОВОЖДЕНИЕ КОНТРАКТОВ',id:'55'},
                    {pod1:'УСЛУГИ',pod2:'ЭКВАЙРИНГ',value:'УСЛУГИ#ЭКВАЙРИНГ',id:'56'},
                    {pod1:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ',pod2:'КОНВЕРСИОННЫЕ ОПЕРАЦИИ ЮЛ',value:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ#КОНВЕРСИОННЫЕ ОПЕРАЦИИ ЮЛ',id:'57'},
                    {pod1:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ',pod2:'ТОРГОВЫЕ ОПЕРАЦИИ С ДРАГОЦЕННЫМИ МЕТАЛЛАМИ',value:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ#ТОРГОВЫЕ ОПЕРАЦИИ С ДРАГОЦЕННЫМИ МЕТАЛЛАМИ',id:'58'},
                    {pod1:'СДЕЛКА',pod2:'ЛИЗИНГ',value:'СДЕЛКА#ЛИЗИНГ',id:'59'},
                    {pod1:'СДЕЛКА',pod2:'АВТОЛИЗИНГ',value:'СДЕЛКА#АВТОЛИЗИНГ',id:'60'},
                    {pod1:'УСЛУГИ',pod2:'ВЫПУСК ЦЕННЫХ БУМАГ',value:'УСЛУГИ#ВЫПУСК ЦЕННЫХ БУМАГ',id:'61'},
                    {pod1:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ',pod2:'КОНВЕРСИОННЫЕ ОПЕРАЦИИ ФЛ',value:'ФИНАНСОВЫЕ ИНСТРУМЕНТЫ#КОНВЕРСИОННЫЕ ОПЕРАЦИИ ФЛ',id:'62'},
                    {pod1:'ВАЛЮТНЫЙ КОНТРОЛЬ',pod2:'',value:'ВАЛЮТНЫЙ КОНТРОЛЬ',id:'63'},
                    {pod1:'УСЛУГИ',pod2:'ЗАРПЛАТНЫЕ ПРОЕКТЫ',value:'УСЛУГИ#ЗАРПЛАТНЫЕ ПРОЕКТЫ',id:'64'}
                ];
                break;
        }
    }
    if (options && typeof options.success == "function") options.success(res);
    return res;
}
var getSystemMetricList = function(options){
    if (options && typeof options.success == "function") options.success([]);
}
var getSystemInterfaceListA = function(options){
    if (options && typeof options.success == "function") options.success([]);
}
var getPodDictionary = function (options) {
    getDictionaryItems({
        name:"Каталог ПОД",
        length:10000,
        success:function(res){
            if (options && typeof options.success == "function") options.success(res);
        }
    });
}
function getCurrentUser(options) {
    if (options && typeof options.success == "function") options.success({
        email:"",
        id:"0",
        login:"",
        name:"",
        roles:[]
    });
}
function getSPListID(listName,CAMLQuery,CAMLQueryOptions){
    return undefined;
}
function getSPListValues(listName,CAMLQuery,CAMLRowLimit,CAMLQueryOptions){
    return [];
}
var docstatelist;
$.docstateictionary = function(){
    if(!docstatelist){
        getDictionaryItems({
            async:false,
            name:"Каталог статусов документа",
            term:"",
            length:100,
            success:function(result){
                docstatelist=result;
            }
        });
    }
    return docstatelist;
}
function getEmptyPodForOutput(){
    return [];
}