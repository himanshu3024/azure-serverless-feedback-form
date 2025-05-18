module.exports = async function (context, req) {
  const { name, email, message } = req.body;

  context.log("Feedback received:", { name, email, message });

  if (!name || !email || !message) {
    context.res = {
      status: 400,
      body: { message: "All fields are required." },
    };
    return;
  }

  // Respond back
  context.res = {
    status: 200,
    body: { message: "Thank you for your feedback, " + name + "!" },
  };
};
