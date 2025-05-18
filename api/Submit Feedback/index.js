const { TableClient } = require("@azure/data-tables");
const formidable = require("formidable");

module.exports = async function (context, req) {
    try {
        // Parse form data
        const form = new formidable.IncomingForm();
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });

        // Validate required fields
        if (!fields.name || !fields.email || !fields.message) {
            context.res = {
                status: 400,
                body: { message: "Missing required fields." }
            };
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fields.email)) {
            context.res = {
                status: 400,
                body: { message: "Invalid email format." }
            };
            return;
        }

        // Read connection string from environment variable
        const connectionString = process.env["STORAGE_CONNECTION_STRING_3024"];
        if (!connectionString) {
            context.res = {
                status: 500,
                body: { message: "Storage connection string not configured." }
            };
            return;
        }

        // Create table client
        const tableName = "FeedbackTable";
        const tableClient = TableClient.fromConnectionString(connectionString, tableName);

        // Create table if it doesn't exist
        await tableClient.createTable();

        // Save feedback
        const entity = {
            partitionKey: "feedback",
            rowKey: `${Date.now()}`,
            name: fields.name || "",
            email: fields.email || "",
            phone: fields.phone || "",
            overallRating: fields.overallRating || "",
            easeRating: fields.easeRating || "",
            supportRating: fields.supportRating || "",
            categories: fields.categories || "",
            message: fields.message || "",
            contactConsent: fields.contactConsent === "true",
            newsletter: fields.newsletter === "true"
        };

        await tableClient.createEntity(entity);

        context.res = {
            status: 200,
            body: {
                message: "Feedback submitted and saved to Azure Table Storage!",
                received: {
                    name: fields.name,
                    email: fields.email
                }
            }
        };
    } catch (error) {
        context.log.error("Error:", error.message);
        context.res = {
            status: 500,
            body: { message: "Internal server error.", error: error.message }
        };
    }
};