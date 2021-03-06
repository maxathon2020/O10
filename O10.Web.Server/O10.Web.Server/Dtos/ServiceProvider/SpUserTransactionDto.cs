﻿namespace O10.Web.Server.Dtos.ServiceProvider
{
    public class SpUserTransactionDto
    {
        public string SpUserTransactionId { get; set; }

        public string RegistrationId { get; set; }

        public string TransactionId { get; set; }
        public string Description { get; set; }

        public bool IsProcessed { get; set; }
        public bool IsConfirmed { get; set; }
        public bool IsCompromised { get; set; }
    }
}
