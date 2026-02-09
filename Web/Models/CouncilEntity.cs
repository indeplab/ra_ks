using System;
using System.Collections.Generic;

namespace Web.Models
{
    public class CouncilEntity
    {
        public long id { get; set; }
        public long number { get; set; }
        public DateTime date{get;set;}
        public List<CouncilIssueEntity> issues { get; set; }
        public List<CouncilSystemEntity> systems { get; set; }
        public string agendaFile { get; set; }
        public string decisionFile { get; set; }
    }

}
