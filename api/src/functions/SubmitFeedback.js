const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

module.exports = async function (context, req) {
    try {
        const formData = req.body;

        if (!formData.name || !formData.email || !formData.message) {
            context.res = {
                status: 400,
                body: { message: "Missing required fields." }
            };
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            context.res = {
                status: 400,
                body: { message: "Invalid email format." }
            };
            return;
        }

        // Read connection string from environment variable
        const connectionString = process.env["AzureWebJobsStorage"];

        // Create table client
        const tableName = "FeedbackTable";
        const tableClient = TableClient.fromConnectionString(connectionString, tableName);

        // Create table if not exists
        await tableClient.createTable();

        // Save feedback
        const entity = {
            partitionKey: "feedback",
            rowKey: `${Date.now()}`, // Unique identifier
            name: formData.name,
            email: formData.email,
            phone: formData.phone || "",
            overallRating: formData.overallRating || "",
            easeRating: formData.easeRating || "",
            supportRating: formData.supportRating || "",
            categories: formData.categories || "",
            message: formData.message,
            contactConsent: formData.contactConsent === "true",
            newsletter: formData.newsletter === "true"
        };

        await tableClient.createEntity(entity);

        context.res = {
            status: 200,
            body: {
                message: "Feedback submitted and saved to Azure Table Storage!",
                received: {
                    name: formData.name,
                    email: formData.email
                }
            }
        };
    } catch (error) {
        context.log.error("Error:", error.message);
        context.res = {
            status: 500,
            body: { message: "Internal server error." }
        };
    }
};
