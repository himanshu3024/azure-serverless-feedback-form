module.exports = async function (context, req) {
    try {
        // Extract form data from request body
        const formData = req.body;

        // Validate required fields
        if (!formData.name || !formData.email || !formData.message) {
            context.res = {
                status: 400,
                body: { message: "Missing required fields: name, email, and message are required." }
            };
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            context.res = {
                status: 400,
                body: { message: "Invalid email format." }
            };
            return;
        }

        // Validate file size if file is included (max 5MB)
        if (formData.file) {
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (formData.file.size > maxSize) {
                context.res = {
                    status: 400,
                    body: { message: "File size exceeds 5MB limit." }
                };
                return;
            }
        }

        // Log the feedback data (excluding file binary for brevity)
        const feedbackLog = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || 'Not provided',
            overallRating: formData.overallRating || 'Not rated',
            easeRating: formData.easeRating || 'Not rated',
            supportRating: formData.supportRating || 'Not rated',
            categories: formData.categories || 'None selected',
            message: formData.message,
            contactConsent: formData.contactConsent === 'true',
            newsletter: formData.newsletter === 'true',
            fileAttached: !!formData.file
        };
        context.log('Received feedback:', feedbackLog);

        // Simulate processing (e.g., saving to database or storage)
        // In a real application, you might save the file to blob storage and feedback to a database
        const responseData = {
            message: "Thank you for your feedback!",
            received: {
                name: formData.name,
                email: formData.email,
                timestamp: new Date().toISOString()
            }
        };

        context.res = {
            status: 200,
            body: responseData
        };
    } catch (error) {
        context.log.error('Error processing feedback:', error);
        context.res = {
            status: 500,
            body: { message: "An error occurred while processing your feedback. Please try again later." }
        };
    }
};