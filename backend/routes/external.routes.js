const express = require("express");
const router = express.Router();
const externalController = require("../controllers/external.controller.js");

/**
 * @swagger
 * /api/external/volunteering:
 *   get:
 *     summary: Get volunteer opportunities
 *     description: Public endpoint to retrieve list of available volunteer opportunities and projects
 *     tags: [External]
 *     security: []
 *     responses:
 *       200:
 *         description: List of volunteer opportunities
 *       500:
 *         description: Server error
 */
router.get("/volunteering", externalController.getVolunteerOpportunities);

module.exports = router;
