using System;

namespace Web.Models
{
    public class dataEntity
    {
        public string uuid { get; set; }
        public string name { get; set; }
        public string shortName { get; set; }
        public string description { get; set; }
        public string classUuid { get; set; }
        public string relatedSourceUuid { get; set; }
        public string relatedDestinationUuid { get; set; }
        
        public dataEntity[] relations { get; set; } = Array.Empty<dataEntity>();
    }
    public class resultEntityList
    {
        public dataEntity[] data { get; set; } = Array.Empty<dataEntity>();
    }
    public class chainEntity
    {
        public dataEntity[] StartObjectsUUIDs { get; set; } = Array.Empty<dataEntity>();
    }
    public class resultChainList
    {
        public chainEntity data { get; set; } = new chainEntity();
    }
    public class indicatorEntity
    {
        public string uuid { get; set; }
        public string name { get; set; }
        public string shortName { get; set; }
        public string description { get; set; }
        
    }
    public class resultIndicatorList
    {
        public indicatorEntity[] data { get; set; } = Array.Empty<indicatorEntity>();
    }

    public class indicatorValue
    {
        public object data { get; set; }
        public string type { get; set; }
    }
    public class indicatorValueEntity
    {
        public string i { get; set; }
        public indicatorValue v { get; set; } = new indicatorValue();
    }
    public class resultIndicatorValueList
    {
        public indicatorValueEntity[] data { get; set; } = Array.Empty<indicatorValueEntity>();
    }


    public class chainRequest
    {
        public string ClassUUID { get; set; }
        public string StartClassUUID { get; set; }
        public string EndClassUUID { get; set; }
        public string ID { get; set; } 
    }
    public class objectRequest
    {
        public string ClassUUID { get; set; }
        public string Name { get; set; }
        public string ID { get; set; } 
    }

}
