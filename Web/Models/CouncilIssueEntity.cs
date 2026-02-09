namespace Web.Models
{
    public class CouncilIssueEntity
    {
        public long id { get; set; }
        public long councilid { get; set; }
        public long question { get; set; }
        public string agenda { get; set; }
        public string decision { get; set; }
        public string speaker { get; set; }
        public string division { get; set; }
    }

}
