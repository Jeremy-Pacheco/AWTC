const express = require("express");
const router = express.Router();
const externalController = require("../controllers/external.controller.js");

router.get("/volunteering", externalController.getVolunteerOpportunities);

module.exports = router;
